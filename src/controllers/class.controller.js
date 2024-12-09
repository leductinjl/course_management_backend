const { Class, Course, Instructor, Admin, User, sequelize } = require('../models');
const { validateClass } = require('../validators/class.validator');
const { ApiError } = require('../utils/apiError');
const { classActivityLogger } = require('../utils/activityLogger');
const { Op } = require('sequelize');

class ClassController {
    async listClasses(req, res, next) {
        try {
          const classes = await Class.findAll({
            include: [
              {
                model: Course,
                attributes: ['id', 'name', 'code']
              },
              {
                model: Instructor,
                attributes: ['id', 'fullName']
              },
              {
                model: Admin,
                as: 'creator',
                attributes: ['id', 'fullName']
              }
            ],
            order: [['created_at', 'DESC']]
          });
          
          res.json({
            success: true,
            data: classes
          });
        } catch (error) {
          next(new ApiError(500, 'Error fetching classes'));
        }
      }
    
      async createClass(req, res, next) {
        try {
          const requestData = {
            ...req.body,
            status: 'upcoming'
          };
    
          const { error, value } = validateClass(requestData);
          if (error) {
            console.error('Validation error details:', error.details);
            return next(new ApiError(400, 'Lỗi validation: ' + error.details[0].message));
          }
    
          // Kiểm tra course status
          const course = await Course.findByPk(value.courseId);
          if (!course) {
            return next(new ApiError(404, 'Không tìm thấy khóa học'));
          }
          if (course.status !== 'active') {
            return next(new ApiError(400, 'Khóa học không trong trạng thái hoạt động'));
          }
    
          // Kiểm tra instructor status
          const instructor = await Instructor.findOne({
            where: { id: value.instructorId },
            include: [{
              model: User,
              attributes: ['status'],
              required: true,
              on: literal('"Instructor"."userId" = "User"."id"')
            }]
          });
          
          if (!instructor) {
            return next(new ApiError(404, 'Không tìm thấy giảng viên'));
          }
          if (instructor.User.status !== 'active') {
            return next(new ApiError(400, 'Giảng viên không trong trạng thái hoạt động'));
          }
    
          // Tạo mã lớp
          const classCode = value.classCode 
            ? `${course.code}-${value.classCode}`
            : `${course.code}-01`;
    
          // Kiểm tra mã lớp tồn tại
          const existingClass = await Class.findOne({ 
            where: { classCode } 
          });
          
          if (existingClass) {
            return next(new ApiError(400, 'Mã lớp đã tồn tại'));
          }
    
          // Tạo lớp mới với status mặc định
          const newClass = await Class.create({
            ...value,
            classCode,
            createdBy: req.admin.id,
            updatedBy: req.admin.id
          });
    
          await classActivityLogger.logCreation(req.admin.id, newClass);
    
          res.status(201).json({
            success: true,
            data: newClass
          });
        } catch (error) {
          console.error('Error in createClass:', error);
          next(new ApiError(500, 'Lỗi tạo lớp học: ' + error.message));
        }
      }
    
      async updateClass(req, res, next) {
        try {
          const { id } = req.params;
          const { error, value } = validateClass(req.body, true);
          
          if (error) {
            return next(new ApiError(400, 'Validation error', error.details));
          }
    
          const classToUpdate = await Class.findByPk(id);
          if (!classToUpdate) {
            return next(new ApiError(404, 'Class not found'));
          }
    
          await classToUpdate.update(value);
          await classActivityLogger.logUpdate(req.admin.id, classToUpdate, value);
    
          res.json({
            success: true,
            data: classToUpdate
          });
        } catch (error) {
          next(new ApiError(500, 'Error updating class'));
        }
      }
    
      async deleteClass(req, res, next) {
        try {
          const { id } = req.params;
          const classToDelete = await Class.findByPk(id);
          
          if (!classToDelete) {
            return next(new ApiError(404, 'Class not found'));
          }
    
          await classToDelete.destroy();
          await classActivityLogger.logDeletion(req.admin.id, classToDelete);
    
          res.json({
            success: true,
            message: 'Class deleted successfully'
          });
        } catch (error) {
          next(new ApiError(500, 'Error deleting class'));
        }
      }
    
      async getInstructors(req, res, next) {
        try {
          const { literal } = require('sequelize');
          
          const instructors = await Instructor.findAll({
            attributes: [
              'id',
              'fullName',
              'userId'
            ],
            include: [{
              model: User,
              attributes: ['id', 'email', 'status'],
              where: { 
                status: 'active'
              },
              required: true,
              on: literal('"Instructor"."userId" = "User"."id"')
            }],
            order: [
              ['fullName', 'ASC']
            ],
            logging: console.log
          });

          console.log('Found instructors:', instructors);

          const formattedInstructors = instructors.map(instructor => ({
            id: instructor.id,
            fullName: instructor.fullName,
            user: instructor.User ? {
              id: instructor.User.id,
              email: instructor.User.email,
              status: instructor.User.status
            } : null
          }));

          res.json({
            success: true,
            data: formattedInstructors,
            total: formattedInstructors.length
          });
        } catch (error) {
          console.error('Error in getInstructors:', error);
          next(new ApiError(500, 'Error fetching instructors: ' + error.message));
        }
      }
    
      async getAvailableCourses(req, res, next) {
        try {
          const courses = await Course.findAll({
            where: { status: 'active' },
            attributes: ['id', 'name', 'code']
          });
          
          res.json({
            success: true,
            data: courses
          });
        } catch (error) {
          next(new ApiError(500, 'Error fetching available courses'));
        }
      }

  // Hàm tính tổng số buổi học
  async calculateTotalLessons(schedule, startDate, endDate) {
    try {
      const { days } = this.parseSchedule(schedule);
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Map các ngày trong tuần sang số (0 = Chủ nhật, 1 = Thứ 2,...)
      const dayMapping = {
        'SUN': 0,
        'MON': 1,
        'TUE': 2,
        'WED': 3,
        'THU': 4,
        'FRI': 5,
        'SAT': 6
      };

      // Chuyển đổi các ngày học sang số
      const classWeekDays = days.map(day => dayMapping[day]);
      
      let totalLessons = 0;
      let currentDate = new Date(start);

      // Lặp qua từng ngày từ ngày bắt đầu đến ngày kết thúc
      while (currentDate <= end) {
        // Kiểm tra nếu ngày hiện tại là ngày học
        if (classWeekDays.includes(currentDate.getDay())) {
          totalLessons++;
        }
        // Tăng lên 1 ngày
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return totalLessons;
    } catch (error) {
      console.error('Error calculating total lessons:', error);
      return 0;
    }
  }

  // Hàm tính số buổi học đã hoàn thành
  async calculateCompletedLessons(schedule, startDate, endDate) {
    try {
      const { days } = this.parseSchedule(schedule);
      const start = new Date(startDate);
      const end = new Date(endDate);
      const now = new Date();

      // Nếu chưa bắt đầu khóa học
      if (now < start) return 0;
      
      // Nếu đã kết thúc khóa học
      if (now > end) {
        return this.calculateTotalLessons(schedule, startDate, endDate);
      }

      // Map các ngày trong tuần
      const dayMapping = {
        'SUN': 0,
        'MON': 1,
        'TUE': 2,
        'WED': 3,
        'THU': 4,
        'FRI': 5,
        'SAT': 6
      };

      // Chuyển đổi các ngày học sang số
      const classWeekDays = days.map(day => dayMapping[day]);
      
      let completedLessons = 0;
      let currentDate = new Date(start);

      // Lặp qua từng ngày từ ngày bắt đầu đến ngày hiện tại
      while (currentDate <= now && currentDate <= end) {
        // Kiểm tra nếu ngày hiện tại là ngày học
        if (classWeekDays.includes(currentDate.getDay())) {
          const currentTime = now.getTime();
          const lessonDate = new Date(currentDate);
          const [hours, minutes] = this.parseSchedule(schedule).endTime.split(':');
          lessonDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

          // Chỉ tính các buổi học đã kết thúc
          if (currentTime > lessonDate.getTime()) {
            completedLessons++;
          }
        }
        // Tăng lên 1 ngày
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return completedLessons;
    } catch (error) {
      console.error('Error calculating completed lessons:', error);
      return 0;
    }
  }

  // Lấy số lượng học viên đăng ký
  async getEnrollmentCount(req, res, next) {
    try {
      const { id } = req.params;
      const count = await Enrollment.count({
        where: { class_id: id }
      });
      
      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      next(new ApiError(500, 'Không thể lấy số lượng học viên'));
    }
  }

  // Lấy tiến độ buổi học
  async getLessonProgress(req, res, next) {
    try {
      const { id } = req.params;
      const classData = await Class.findByPk(id);
      
      if (!classData) {
        return next(new ApiError(404, 'Không tìm thấy lớp học'));
      }

      const totalLessons = this.calculateTotalLessons(
        classData.schedule,
        classData.startDate,
        classData.endDate
      );

      const completedLessons = this.calculateCompletedLessons(
        totalLessons,
        classData.startDate,
        classData.endDate
      );

      res.json({
        success: true,
        data: {
          totalLessons,
          completedLessons,
          remainingLessons: totalLessons - completedLessons
        }
      });
    } catch (error) {
      next(new ApiError(500, 'Không thể lấy tiến độ buổi học'));
    }
  }

  // Lấy số lượng thông báo
  async getAnnouncementCount(req, res, next) {
    try {
      const { id } = req.params;
      const count = await ClassAnnouncement.count({
        where: { class_id: id }
      });
      
      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      next(new ApiError(500, 'Không thể lấy số lượng thông báo'));
    }
  }

  // Lấy tổng quan các lớp học
  async getClassSummary(req, res, next) {
    try {
      // Lấy tổng số lớp học
      const totalClasses = await Class.count();

      // Lấy số lớp học theo trạng thái
      const [upcoming, ongoing, completed, cancelled] = await Promise.all([
        Class.count({ where: { status: 'upcoming' } }),
        Class.count({ where: { status: 'ongoing' } }),
        Class.count({ where: { status: 'completed' } }),
        Class.count({ where: { status: 'cancelled' } })
      ]);

      // Lấy số lớp học trong tháng này
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const classesThisMonth = await Class.count({
        where: {
          startDate: {
            [Op.gte]: startOfMonth
          }
        }
      });

      // Sửa lại phần query top courses để chỉ rõ id của bảng Class
      const topCourses = await Class.findAll({
        attributes: [
          'courseId',
          [sequelize.fn('COUNT', sequelize.col('Class.id')), 'classCount']
        ],
        include: [{
          model: Course,
          attributes: ['name', 'code'],
          required: true
        }],
        group: ['Class.courseId', 'Course.id', 'Course.name', 'Course.code'],
        order: [[sequelize.fn('COUNT', sequelize.col('Class.id')), 'DESC']],
        limit: 5
      });

      res.json({
        success: true,
        data: {
          total: totalClasses,
          byStatus: {
            upcoming,
            ongoing,
            completed,
            cancelled
          },
          classesThisMonth,
          topCourses: topCourses.map(c => ({
            courseId: c.courseId,
            courseName: c.Course.name,
            courseCode: c.Course.code,
            classCount: parseInt(c.get('classCount'))
          }))
        }
      });
    } catch (error) {
      console.error('Error in getClassSummary:', error);
      next(new ApiError(500, 'Không thể lấy tổng quan lớp học'));
    }
  }

  // Helper methods
  calculateTotalLessons(schedule, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = schedule.split(',').map(day => day.trim().toUpperCase());
    
    let totalLessons = 0;
    const currentDate = new Date(start);
    
    while (currentDate <= end) {
      const dayOfWeek = currentDate.toLocaleString('en-US', { weekday: 'short' }).toUpperCase();
      if (days.includes(dayOfWeek)) {
        totalLessons++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return totalLessons;
  }

  calculateCompletedLessons(totalLessons, startDate, endDate) {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now < start) return 0;
    if (now > end) return totalLessons;
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsedDuration = now.getTime() - start.getTime();
    const progress = elapsedDuration / totalDuration;
    
    return Math.floor(totalLessons * progress);
  }

  // Thêm method kiểm tra UUID
  static isValidUUID(str) {
    if (!str) return false;
    
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(str);
  }

  // Helper method to generate class code
  async generateClassCode(courseCode) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const semester = Math.floor(date.getMonth() / 4) + 1;
    const baseCode = `${courseCode}-${year}${semester}`;
    
    // Find the highest sequence number for this base code
    const latestClass = await Class.findOne({
      where: {
        classCode: {
          [Op.like]: `${baseCode}-%`
        }
      },
      order: [['classCode', 'DESC']]
    });

    let sequence = 1;
    if (latestClass) {
      const lastSequence = parseInt(latestClass.classCode.split('-').pop());
      sequence = lastSequence + 1;
    }

    return `${baseCode}-${sequence.toString().padStart(2, '0')}`;
  }

  async getClass(req, res, next) {
    try {
      const { id } = req.params;
      
      const classData = await Class.findOne({
        where: { id },
        include: [
          {
            model: Course,
            attributes: ['id', 'name', 'code']
          },
          {
            model: Instructor,
            attributes: ['id', 'fullName']
          },
          {
            model: Admin,
            as: 'creator',
            attributes: ['id', 'fullName']
          }
        ]
      });

      if (!classData) {
        return next(new ApiError(404, 'Không tìm thấy lớp học'));
      }

      // Lấy thêm thống kê của lớp học
      const [enrollmentCount, lessonProgress, announcementCount] = await Promise.all([
        this.getEnrollmentCount(id),
        this.getLessonProgress(id),
        this.getAnnouncementCount(id)
      ]);

      const classDetails = {
        ...classData.toJSON(),
        stats: {
          enrollmentCount,
          lessonProgress,
          announcementCount
        }
      };

      res.json({
        success: true,
        data: classDetails
      });
    } catch (error) {
      console.error('Error getting class:', error);
      next(new ApiError(500, 'Error getting class details'));
    }
  }

  // Helper methods cho thống kê
  async getEnrollmentCount(classId) {
    // Implement logic đếm số học viên đăng ký
    return 0; // Placeholder
  }

  async getLessonProgress(classId) {
    // Implement logic tính tiến độ bài học
    return {
      total: 0,
      completed: 0
    }; // Placeholder
  }

  async getAnnouncementCount(classId) {
    // Implement logic đếm số thông báo
    return 0; // Placeholder
  }
}

module.exports = new ClassController(); 