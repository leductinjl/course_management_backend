const { Class, Course, Instructor } = require('../models');
const { ApiError } = require('../utils/apiError');
const { Op } = require('sequelize');

class InstructorTeachingController {
  async getTeachingSchedule(req, res) {
    try {
      const { week = 'current' } = req.query;
      const instructor_id = req.instructor.id;

      // Calculate date range based on week parameter
      let start_date, end_date;
      const today = new Date();
      
      switch(week) {
        case 'next':
          start_date = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          end_date = new Date(start_date.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'all':
          start_date = today;
          end_date = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
          break;
        default: // current
          start_date = today;
          end_date = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      }

      const classes = await Class.findAll({
        where: {
          instructor_id,
          start_date: { [Op.lte]: end_date },
          end_date: { [Op.gte]: start_date }
        },
        include: [{
          model: Course,
          attributes: ['code', 'name']
        }],
        order: [['start_date', 'ASC']]
      });

      const schedules = classes.map(cls => ({
        id: cls.id,
        courseCode: cls.Course.code,
        courseName: cls.Course.name,
        class_code: cls.class_code,
        schedule: cls.schedule,
        room: cls.room,
        start_date: cls.start_date,
        end_date: cls.end_date,
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
        where: { user_id: req.user.id }
      });

      if (!instructor) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin giảng viên'
        });
      }

      console.log('Instructor found:', instructor.id);
      
      console.log('Querying classes with:', {
        instructor_id: instructor.id,
        status: ['upcoming', 'ongoing']
      });

      const classes = await Class.findAll({
        where: {
          instructor_id: instructor.id,
          status: ['upcoming', 'ongoing']
        },
        include: [{
          model: Course,
          as: 'Course',
          attributes: ['id', 'code', 'name', 'credits', 'description']
        }],
        order: [['start_date', 'ASC']]
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
          class_code: cls.class_code,
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
      const { class_id } = req.params;
      const { status } = req.body;
      const instructor_id = req.instructor.id;

      const cls = await Class.findOne({
        where: {
          id: class_id,
          instructor_id
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