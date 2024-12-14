const { LessonProgress, Class } = require('../models');
const { validateLessonProgress } = require('../validators/lessonProgress.validator');
const { ApiError } = require('../utils/apiError');

class LessonProgressController {
  async createLesson(req, res, next) {
    try {
      const { error } = validateLessonProgress(req.body);
      if (error) {
        throw new ApiError(400, 'Dữ liệu không hợp lệ', error.details);
      }

      const lesson = await LessonProgress.create({
        ...req.body,
        created_by: req.user.id
      });

      res.status(201).json({
        success: true,
        data: lesson
      });
    } catch (error) {
      next(error);
    }
  }

  async updateLesson(req, res, next) {
    try {
      const { id } = req.params;
      const { error } = validateLessonProgress(req.body);
      if (error) {
        throw new ApiError(400, 'Dữ liệu không hợp lệ', error.details);
      }

      const lesson = await LessonProgress.findByPk(id);
      if (!lesson) {
        throw new ApiError(404, 'Không tìm thấy bài học');
      }

      await lesson.update({
        ...req.body,
        updated_by: req.user.id
      });

      res.json({
        success: true,
        data: lesson
      });
    } catch (error) {
      next(error);
    }
  }

  async getClassLessons(req, res, next) {
    try {
      const { class_id } = req.params;
      const lessons = await LessonProgress.findAll({
        where: { class_id },
        order: [['lesson_number', 'ASC']]
      });

      res.json({
        success: true,
        data: lessons
      });
    } catch (error) {
      next(error);
    }
  }

  async getLessonStats(req, res, next) {
    try {
      const { class_id } = req.params;
      const stats = await LessonProgress.findAndCountAll({
        where: { class_id },
        attributes: ['completed']
      });

      const completedCount = stats.rows.filter(lesson => lesson.completed).length;

      res.json({
        success: true,
        data: {
          totalLessons: stats.count,
          completedLessons: completedCount
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LessonProgressController(); 