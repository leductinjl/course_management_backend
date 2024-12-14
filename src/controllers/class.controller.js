const { literal } = require('sequelize');
const { Class, Course, Instructor, Admin, User, sequelize, Enrollment, Student, LessonProgress } = require('../models');
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
                attributes: ['id', 'name', 'code', 'credits', 'fee']
              },
              {
                model: Instructor,
                attributes: ['id', 'full_name', 'specialization']
              },
              {
                model: Admin,
                as: 'creator',
                attributes: ['id', 'full_name']
              }
            ],
            order: [['created_at', 'DESC']]
          });
          
          // Thêm thống kê cho mỗi lớp
          const classesWithStats = await Promise.all(classes.map(async (classItem) => {
            const enrollmentCount = await Enrollment.count({
              where: { class_id: classItem.id }
            });

            const classData = classItem.toJSON();
            return {
              ...classData,
              stats: {
                enrollmentCount,
                completedLessons: 0,
                totalLessons: 0,
                announcementCount: 0
              }
            };
          }));
          
          res.json({
            success: true,
            data: classesWithStats
          });
        } catch (error) {
          console.error('Error in listClasses:', error);
          next(new ApiError(500, 'Error fetching classes', error));
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
          const course = await Course.findByPk(value.course_id);
          if (!course) {
            return next(new ApiError(404, 'Không tìm thấy khóa học'));
          }
          if (course.status !== 'active') {
            return next(new ApiError(400, 'Khóa học không trong trạng thái hoạt động'));
          }
    
          // Kiểm tra instructor status
          const instructor = await Instructor.findOne({
            where: { id: value.instructor_id },
            include: [{
              model: User,
              attributes: ['status'],
              required: true,
              on: literal('"Instructor"."user_id" = "User"."id"')
            }]
          });
          
          if (!instructor) {
            return next(new ApiError(404, 'Không tìm thấy giảng viên'));
          }
          if (instructor.User.status !== 'active') {
            return next(new ApiError(400, 'Giảng viên không trong trạng thái hoạt động'));
          }
    
          // Tạo mã lớp
          let class_code = value.class_code 
            ? `${course.code}-${value.class_code}`
            : `${course.code}-01`;
    
          // Kiểm tra mã lớp tồn tại và tự động tạo mã lớp mới nếu cần
          let existingClass = await Class.findOne({ 
            where: { class_code } 
          });
    
          let counter = 1;
          while (existingClass) {
            class_code = `${course.code}-${String(counter).padStart(2, '0')}`;
            existingClass = await Class.findOne({ 
              where: { class_code } 
            });
            counter++;
          }
    
          // Tạo lớp mới
          const newClass = await Class.create({
            ...value,
            class_code,
            created_by: req.admin.id,
            updated_by: req.admin.id
          });
    
          // Log hoạt động sau khi lớp đã được tạo thành công
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
          
          // Kiểm tra class tồn tại
          const existingClass = await Class.findByPk(id);
          if (!existingClass) {
            return next(new ApiError(404, 'Không tìm thấy lớp học'));
          }

          // Kiểm tra và lọc dữ liệu đầu vào
          const allowedFields = ['start_date', 'end_date', 'schedule', 'room', 'capacity', 'status'];
          const updateData = allowedFields.reduce((acc, field) => {
            if (req.body && req.body[field] !== undefined) {
              acc[field] = req.body[field];
            }
            return acc;
          }, {});

          // Thêm updated_by
          updateData.updated_by = req.admin.id;

          // Validate dữ liệu
          if (Object.keys(updateData).length === 0) {
            return next(new ApiError(400, 'Không có dữ liệu cập nhật'));
          }

          // Validate status
          const validStatuses = ['upcoming', 'ongoing', 'completed', 'cancelled'];
          if (updateData.status && !validStatuses.includes(updateData.status)) {
            return next(new ApiError(400, 'Trạng thái không hợp lệ'));
          }

          // Validate dates if provided
          if (updateData.start_date && updateData.end_date) {
            const start_date = new Date(updateData.start_date);
            const end_date = new Date(updateData.end_date);
            if (end_date <= start_date) {
              return next(new ApiError(400, 'Ngày kết thúc phải sau ngày bắt đầu'));
            }
          }

          // Validate capacity if provided
          if (updateData.capacity) {
            const capacity = Number(updateData.capacity);
            if (isNaN(capacity) || capacity < 1) {
              return next(new ApiError(400, 'Sĩ số phải là số dương'));
            }
            updateData.capacity = capacity;
          }

          // Cập nhật class
          await existingClass.update(updateData);

          // Log hoạt động sau khi cập nhật thành công
          try {
            await classActivityLogger.logUpdate(req.admin.id, existingClass);
          } catch (logError) {
            console.error('Error logging activity:', logError);
            // Không throw error nếu log thất bại
          }

          // Lấy dữ liệu class đã cập nhật
          const updatedClass = await Class.findByPk(id, {
            include: [
              {
                model: Course,
                attributes: ['id', 'name', 'code']
              },
              {
                model: Instructor,
                attributes: ['id', 'full_name']
              }
            ]
          });

          res.json({
            success: true,
            message: 'Cập nhật lớp học thành công',
            data: updatedClass
          });
        } catch (error) {
          console.error('Error in updateClass:', error);
          next(new ApiError(500, 'Lỗi cập nhật lớp học: ' + error.message));
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
              'full_name',
              'user_id'
            ],
            include: [{
              model: User,
              attributes: ['id', 'email', 'status'],
              where: { 
                status: 'active'
              },
              required: true,
              on: literal('"Instructor"."user_id" = "User"."id"')
            }],
            order: [
              ['full_name', 'ASC']
            ],
            logging: console.log
          });

          console.log('Found instructors:', instructors);

          const formattedInstructors = instructors.map(instructor => ({
            id: instructor.id,
            full_name: instructor.full_name,
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
  async calculateTotalLessons(schedule, start_date, end_date) {
    try {
      const { days } = this.parseSchedule(schedule);
      const start = new Date(start_date);
      const end = new Date(end_date);
      
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
  async calculateCompletedLessons(schedule, start_date, end_date) {
    try {
      const { days } = this.parseSchedule(schedule);
      const start = new Date(start_date);
      const end = new Date(end_date);
      const now = new Date();

      // Nếu chưa bắt đầu khóa học
      if (now < start) return 0;
      
      // Nếu đã kết thúc khóa học
      if (now > end) {
        return this.calculateTotalLessons(schedule, start_date, end_date);
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
      next(new ApiError(500, 'Không thể lấy số lư���ng học viên'));
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
        classData.start_date,
        classData.end_date
      );

      const completedLessons = this.calculateCompletedLessons(
        totalLessons,
        classData.start_date,
        classData.end_date
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
          start_date: {
            [Op.gte]: startOfMonth
          }
        }
      });

      // Sửa lại phần query top courses để chỉ rõ id của bảng Class
      const topCourses = await Class.findAll({
        attributes: [
          'course_id',
          [sequelize.fn('COUNT', sequelize.col('Class.id')), 'classCount']
        ],
        include: [{
          model: Course,
          attributes: ['name', 'code'],
          required: true
        }],
        group: ['Class.course_id', 'Course.id', 'Course.name', 'Course.code'],
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
            course_id: c.course_id,
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
  calculateTotalLessons(schedule, start_date, end_date) {
    const start = new Date(start_date);
    const end = new Date(end_date);
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

  calculateCompletedLessons(totalLessons, start_date, end_date) {
    const now = new Date();
    const start = new Date(start_date);
    const end = new Date(end_date);
    
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
  async generateclass_code(courseCode) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const semester = Math.floor(date.getMonth() / 4) + 1;
    const baseCode = `${courseCode}-${year}${semester}`;
    
    // Find the highest sequence number for this base code
    const latestClass = await Class.findOne({
      where: {
        class_code: {
          [Op.like]: `${baseCode}-%`
        }
      },
      order: [['class_code', 'DESC']]
    });

    let sequence = 1;
    if (latestClass) {
      const lastSequence = parseInt(latestClass.class_code.split('-').pop());
      sequence = lastSequence + 1;
    }

    return `${baseCode}-${sequence.toString().padStart(2, '0')}`;
  }

  async getClass(req, res, next) {
    try {
      const classData = await Class.findByPk(req.params.id, {
        include: [
          {
            model: Course,
            attributes: ['id', 'name', 'code', 'credits', 'fee']
          },
          {
            model: Instructor,
            attributes: ['id', 'full_name', 'specialization']
          },
          {
            model: Admin,
            as: 'creator',
            attributes: ['id', 'full_name']
          }
        ]
      });

      if (!classData) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy lớp học'
        });
      }

      const enrollmentCount = await Enrollment.count({
        where: { class_id: classData.id }
      });

      const result = {
        ...classData.toJSON(),
        stats: {
          enrollmentCount,
          completedLessons: 0,
          totalLessons: 0,
          announcementCount: 0
        }
      };

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  // Helper methods cho thống kê
  async getEnrollmentCount(class_id) {
    // Implement logic đếm số học viên đăng ký
    return 0; // Placeholder
  }

  async getLessonProgress(class_id) {
    // Implement logic tính tiến độ bài học
    return {
      total: 0,
      completed: 0
    }; // Placeholder
  }

  async getAnnouncementCount(class_id) {
    // Implement logic đếm số thông báo
    return 0; // Placeholder
  }

  // Thêm method mới
  async getAvailableClasses(req, res, next) {
    try {
      const { course_id } = req.params;
      
      const classes = await Class.findAll({
        where: {
          course_id,
          status: 'upcoming', // Chỉ lấy các lớp sắp mở
        },
        include: [
          {
            model: Instructor,
            attributes: ['id', 'full_name', 'specialization'],
          }
        ],
        attributes: [
          'id', 'class_code', 'schedule', 'room', 'capacity',
          'start_date', 'end_date', 'status'
        ]
      });

      // Lấy số lượng học viên đã đăng ký cho mỗi lớp
      const classesWithCount = await Promise.all(
        classes.map(async (classItem) => {
          const enrollmentCount = await Enrollment.count({
            where: {
              class_id: classItem.id,
              status: 'enrolled'
            }
          });

          return {
            ...classItem.toJSON(),
            enrollmentCount
          };
        })
      );

      res.json({
        success: true,
        data: classesWithCount
      });
    } catch (error) {
      next(error);
    }
  }

  async getAvailableClassesForStudent(course_id, user_id) {
    try {
      // Kiểm tra course tồn tại
      const course = await Course.findByPk(course_id);
      if (!course) {
        throw new ApiError(404, 'Không tìm thấy môn học');
      }

      const classes = await Class.findAll({
        where: {
          course_id,
          status: ['upcoming', 'ongoing', 'active'],
        },
        include: [
          {
            model: Instructor,
            attributes: ['id', 'full_name', 'specialization'],
          },
          {
            model: Course,
            attributes: ['id', 'name', 'code'],
            where: { id: course_id }
          }
        ],
        attributes: [
          'id', 
          'class_code',
          'schedule',
          'room',
          'capacity',
          'start_date',
          'end_date',
          'status'
        ],
        order: [
          ['start_date', 'ASC']
        ]
      });

      // Log để debug
      console.log(`Found ${classes.length} classes for course ${course_id}`);

      // Lấy student_id từ user_id
      const student = await Student.findOne({
        where: { user_id }
      });

      if (!student) {
        throw new ApiError(404, 'Không tìm thấy thông tin học viên');
      }

      const classesWithEnrollmentCount = await Promise.all(
        classes.map(async (classItem) => {
          const enrollmentCount = await Enrollment.count({
            where: {
              class_id: classItem.id,
              status: 'enrolled'
            }
          });

          // Kiểm tra xem học viên đã đăng ký lớp này chưa
          const isEnrolled = await Enrollment.findOne({
            where: {
              class_id: classItem.id,
              student_id: student.id,
              status: 'enrolled'
            }
          });

          return {
            ...classItem.toJSON(),
            enrollmentCount,
            isEnrolled: !!isEnrolled,
            instructor: classItem.Instructor ? {
              id: classItem.Instructor.id,
              full_name: classItem.Instructor.full_name,
              specialization: classItem.Instructor.specialization
            } : null
          };
        })
      );

      return classesWithEnrollmentCount;
    } catch (error) {
      console.error('Error in getAvailableClassesForStudent:', error);
      console.error('Course ID:', course_id);
      throw error;
    }
  }

  async getClassStudents(req, res, next) {
    try {
      const { id } = req.params;
      console.log('Fetching students for class:', id);

      const enrollments = await Enrollment.findAll({
        where: {
          class_id: id,
          status: 'enrolled'  // Chỉ lấy enrolled
        },
        include: [
          {
            model: Student,
            attributes: ['id', 'full_name', 'phone'],
            required: true,
            include: [{
              model: User,
              attributes: ['email']
            }]
          }
        ],
        order: [[{ model: Student }, 'full_name', 'ASC']]
      });

      // Log raw data để debug
      console.log('Raw enrollments:', JSON.stringify(enrollments, null, 2));

      const students = enrollments.map(enrollment => ({
        enrollment_id: enrollment.id,
        full_name: enrollment.Student.full_name,
        email: enrollment.Student.User.email,
        phone: enrollment.Student.phone || '-',
        enrollment_date: enrollment.created_at,
        status: enrollment.status // Thêm status vào để kiểm tra
      }));

      // Log formatted data để debug
      console.log('Formatted students:', JSON.stringify(students, null, 2));

      return res.json({
        success: true,
        data: students,
        total: students.length
      });

    } catch (error) {
      console.error('Error in getClassStudents:', error);
      next(new ApiError(500, 'Không thể lấy danh sách học viên'));
    }
  }
}

module.exports = new ClassController(); 