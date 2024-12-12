const { Class, Course, Instructor } = require('../models');
const { ApiError } = require('../utils/apiError');
const { Op } = require('sequelize');

class InstructorTeachingController {
  async getTeachingSchedule(req, res) {
    try {
      const { week = 'current' } = req.query;
      const instructorId = req.instructor.id;

      // Calculate date range based on week parameter
      let startDate, endDate;
      const today = new Date();
      
      switch(week) {
        case 'next':
          startDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'all':
          startDate = today;
          endDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
          break;
        default: // current
          startDate = today;
          endDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      }

      const classes = await Class.findAll({
        where: {
          instructorId,
          startDate: { [Op.lte]: endDate },
          endDate: { [Op.gte]: startDate }
        },
        include: [{
          model: Course,
          attributes: ['code', 'name']
        }],
        order: [['startDate', 'ASC']]
      });

      const schedules = classes.map(cls => ({
        id: cls.id,
        courseCode: cls.Course.code,
        courseName: cls.Course.name,
        classCode: cls.classCode,
        schedule: cls.schedule,
        room: cls.room,
        startDate: cls.startDate,
        endDate: cls.endDate,
        status: cls.status
      }));

      res.json({
        success: true,
        data: schedules
      });
    } catch (error) {
      console.error('Error fetching teaching schedule:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching teaching schedule'
      });
    }
  }

  async getInstructorCourses(req, res) {
    try {
      const instructor = await Instructor.findOne({
        where: { userId: req.user.id }
      });

      if (!instructor) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin giảng viên'
        });
      }

      console.log('Instructor found:', instructor.id);
      
      console.log('Querying classes with:', {
        instructorId: instructor.id,
        status: ['upcoming', 'ongoing']
      });

      const classes = await Class.findAll({
        where: {
          instructorId: instructor.id,
          status: ['upcoming', 'ongoing']
        },
        include: [{
          model: Course,
          as: 'Course',
          attributes: ['id', 'code', 'name', 'credits', 'description']
        }],
        order: [['startDate', 'ASC']]
      });

      console.log('Found classes:', classes);

      const coursesMap = new Map();
      classes.forEach(cls => {
        const course = cls.Course;
        if (!coursesMap.has(course.id)) {
          coursesMap.set(course.id, {
            id: course.id,
            code: course.code,
            name: course.name,
            credits: course.credits,
            description: course.description,
            classes: []
          });
        }
        coursesMap.get(course.id).classes.push({
          id: cls.id,
          classCode: cls.classCode,
          schedule: cls.schedule,
          room: cls.room,
          status: cls.status
        });
      });

      const courses = Array.from(coursesMap.values());
      console.log('Mapped courses:', courses);
      res.json(courses);
    } catch (error) {
      console.error('Error in getInstructorCourses:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Không thể lấy danh sách môn học' 
      });
    }
  }

  async updateClassStatus(req, res) {
    try {
      const { classId } = req.params;
      const { status } = req.body;
      const instructorId = req.instructor.id;

      const cls = await Class.findOne({
        where: {
          id: classId,
          instructorId
        }
      });

      if (!cls) {
        throw new ApiError(404, 'Class not found');
      }

      await cls.update({ status });

      res.json({
        success: true,
        message: 'Class status updated successfully'
      });
    } catch (error) {
      console.error('Error updating class status:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating class status'
      });
    }
  }
}

module.exports = new InstructorTeachingController(); 