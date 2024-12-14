const { Grade, Enrollment, Student, Class, Course, Instructor } = require('../models');
const { ApiError } = require('../utils/apiError');
const { validateClassGrades } = require('../validators/classGrade.validator');
const { Op } = require('sequelize');

class ClassGradeController {
  async getClassStudents(req, res, next) {
    try {
      const { class_id } = req.params;

      // Kiểm tra lớp học tồn tại
      const classData = await Class.findOne({
        where: { id: class_id },
        include: [{
          model: Course,
          attributes: ['name', 'code']
        }]
      });

      if (!classData) {
        throw new ApiError(404, 'Không tìm thấy lớp học');
      }

      // Lấy tất cả học viên đang học (enrolled)
      const enrollments = await Enrollment.findAll({
        where: { 
          class_id,
          status: 'enrolled' // Chỉ lấy học viên đang học
        },
        include: [
          {
            model: Student,
            attributes: ['id', 'full_name'],
            required: true
          },
          {
            model: Grade,
            required: false // Left join để lấy cả học viên chưa có điểm
          }
        ],
        order: [[Student, 'full_name', 'ASC']]
      });

      // Transform data để trả về
      const students = enrollments.map(enrollment => ({
        enrollment_id: enrollment.id,
        student_id: enrollment.Student.id,
        student_name: enrollment.Student.full_name,
        status: enrollment.status,
        attendance_score: enrollment.Grade?.attendance_score || null,
        midterm_score: enrollment.Grade?.midterm_score || null,
        final_score: enrollment.Grade?.final_score || null,
        total_score: enrollment.Grade?.total_score || null,
        grade_status: enrollment.Grade?.grade_status || 'pending'
      }));

      // Trả về kết quả với format đúng
      res.json({
        success: true,
        data: students,
        metadata: {
          total_students: enrollments.length,
          class_info: {
            id: classData.id,
            class_code: classData.class_code,
            course_name: classData.Course.name,
            course_code: classData.Course.code
          }
        }
      });

    } catch (error) {
      console.error('Error in getClassStudents:', error);
      next(error);
    }
  }

  async updateGrades(req, res, next) {
    try {
      const { class_id } = req.params;
      const { grades } = req.body;
      
      // Lấy instructor từ user_id và log chi tiết
      const instructor = await Instructor.findOne({
        where: { user_id: req.user.id },
        attributes: ['id', 'user_id', 'full_name']
      });

      console.log('Found instructor:', instructor ? {
        instructor_id: instructor.id,  // ID của instructor để dùng cho last_updated_by
        user_id: instructor.user_id,
        name: instructor.full_name
      } : 'Not found');

      if (!instructor) {
        throw new ApiError(403, 'Không tìm thấy thông tin giảng viên');
      }

      // Kiểm tra lớp học và quyền truy cập
      const classExists = await Class.findOne({
        where: { 
          id: class_id,
          instructor_id: instructor.id  // Dùng instructor.id để check quyền
        }
      });

      if (!classExists) {
        throw new ApiError(404, 'Không tìm thấy lớp học hoặc không có quyền truy cập');
      }

      const updatedGrades = [];

      for (const grade of grades) {
        const { enrollment_id, attendance_score, midterm_score, final_score } = grade;

        // Kiểm tra enrollment
        const enrollment = await Enrollment.findOne({
          where: { 
            id: enrollment_id,
            class_id,
            status: 'enrolled'
          }
        });

        if (!enrollment) {
          continue;
        }

        // Tính điểm tổng kết
        let total_score = null;
        if (attendance_score !== null && midterm_score !== null && final_score !== null) {
          total_score = (attendance_score * 0.1) + (midterm_score * 0.4) + (final_score * 0.5);
          total_score = Math.round(total_score * 100) / 100;
        }

        try {
          // Tìm grade hiện tại
          let gradeRecord = await Grade.findOne({
            where: { enrollment_id }
          });

          if (gradeRecord) {
            // Cập nhật grade hiện có
            await gradeRecord.update({
              attendance_score,
              midterm_score,
              final_score,
              total_score,
              grade_status: 'graded',
              last_updated_by: instructor.id  // Dùng instructor.id thay vì user.id
            });
          } else {
            // Tạo grade mới
            gradeRecord = await Grade.create({
              enrollment_id,
              attendance_score,
              midterm_score,
              final_score,
              total_score,
              grade_status: 'graded',
              last_updated_by: instructor.id  // Dùng instructor.id thay vì user.id
            });
          }

          updatedGrades.push(gradeRecord);

        } catch (gradeError) {
          console.error('Error updating grade:', {
            enrollment_id,
            instructor_id: instructor.id,
            error: gradeError.message
          });
          throw gradeError;
        }
      }

      res.json({
        success: true,
        message: 'Cập nhật điểm thành công',
        data: updatedGrades
      });

    } catch (error) {
      console.error('Error in updateGrades:', error);
      next(error);
    }
  }
}

module.exports = new ClassGradeController();
