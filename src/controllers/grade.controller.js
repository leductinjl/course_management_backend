const { Grade, Enrollment, Class, Student, Course, User } = require('../models');
const { validateGrade } = require('../validators/grade.validator');
const { ApiError } = require('../utils/apiError');
const excel = require('exceljs');

class GradeController {
  // Lấy điểm của một lớp học
  async getClassGrades(req, res, next) {
    try {
      const { class_id } = req.params;
      
      // Lấy tất cả enrollment của lớp học
      const enrollments = await Enrollment.findAll({
        where: { 
          class_id,
          // Chỉ lấy học viên có trạng thái enrolled hoặc completed
          status: ['enrolled', 'completed']
        },
        include: [
          {
            model: Student,
            attributes: ['id', 'full_name', 'student_code'], // Thêm student_code
            required: true
          },
          {
            model: Grade,
            required: false
          }
        ],
        order: [[{ model: Student }, 'full_name', 'ASC']]
      });

      // Format lại dữ liệu trả về với thêm thông tin
      const grades = enrollments.map(enrollment => ({
        enrollment_id: enrollment.id,
        student_id: enrollment.Student.id,
        student_code: enrollment.Student.student_code, // Thêm mã số sinh viên
        student_name: enrollment.Student.full_name,
        enrollment_status: enrollment.status,
        attendance_score: enrollment.Grade?.attendance_score || null,
        midterm_score: enrollment.Grade?.midterm_score || null,
        final_score: enrollment.Grade?.final_score || null,
        total_score: enrollment.Grade?.total_score || null,
        grade_status: enrollment.Grade?.grade_status || 'pending'
      }));

      return res.json({
        success: true,
        data: grades,
        total: grades.length
      });

    } catch (error) {
      console.error('Error in getClassGrades:', error);
      next(new ApiError(500, 'Không thể lấy danh sách điểm'));
    }
  }

  // Cập nhật điểm hàng loạt
  async updateGrades(req, res, next) {
    try {
      const { class_id } = req.params;
      const { grades } = req.body;

      if (!class_id || !grades || !Array.isArray(grades)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid request data'
        });
      }

      console.log('Updating grades for class:', class_id);
      console.log('Grades data:', grades);

      // Validate và cập nhật từng điểm
      const updatedGrades = [];
      for (const grade of grades) {
        const { enrollment_id, ...gradeData } = grade;
        const updatedGrade = await Grade.upsert({
          enrollment_id,
          ...gradeData,
          last_updated_by: req.user?.id || null
        });
        updatedGrades.push(updatedGrade);
      }

      return res.json({
        success: true,
        message: 'Cập nhật điểm thành công',
        data: updatedGrades
      });
    } catch (error) {
      console.error('Error in updateGrades:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể cập nhật điểm',
        error: error.message
      });
    }
  }

  // Cập nhật điểm một học viên
  async updateGrade(req, res, next) {
    try {
      const { id } = req.params;
      const gradeData = req.body;

      const { error } = validateGrade(gradeData);
      if (error) {
        throw new ApiError(400, 'Dữ liệu không hợp lệ', error.details);
      }

      const grade = await Grade.findByPk(id);
      if (!grade) {
        throw new ApiError(404, 'Không tìm thấy thông tin điểm');
      }

      // Tính điểm tổng kết
      const totalScore = this.calculateTotalScore(
        gradeData.attendance_score,
        gradeData.midterm_score,
        gradeData.final_score
      );

      const updatedGrade = await grade.update({
        ...gradeData,
        total_score: totalScore,
        grade_status: 'graded',
        last_updated_by: req.instructor.id
      });

      res.json({
        success: true,
        message: 'Cập nhật điểm thành công',
        data: updatedGrade
      });
    } catch (error) {
      next(error);
    }
  }

  // Xuất điểm ra file Excel
  async exportGrades(req, res, next) {
    try {
      const { class_id } = req.params;

      const classData = await Class.findOne({
        where: { id: class_id },
        include: [{ model: Course }]
      });

      const grades = await Grade.findAll({
        include: [{
          model: Enrollment,
          where: { class_id },
          include: [{ model: Student }]
        }]
      });

      const workbook = new excel.Workbook();
      const worksheet = workbook.addWorksheet('Grades');

      // Thêm headers
      worksheet.columns = [
        { header: 'MSSV', key: 'student_id' },
        { header: 'Họ và tên', key: 'full_name' },
        { header: 'Chuyên cần', key: 'attendance_score' },
        { header: 'Giữa kỳ', key: 'midterm_score' },
        { header: 'Cuối kỳ', key: 'final_score' },
        { header: 'Tổng kết', key: 'total_score' }
      ];

      // Thêm data
      grades.forEach(grade => {
        worksheet.addRow({
          student_id: grade.Enrollment.Student.id,
          full_name: grade.Enrollment.Student.full_name,
          attendance_score: grade.attendance_score,
          midterm_score: grade.midterm_score,
          final_score: grade.final_score,
          total_score: grade.total_score
        });
      });

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=grades-${classData.class_code}.xlsx`
      );

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      next(error);
    }
  }

  // Helper method để tính điểm tổng kết
  calculateTotalScore(attendance, midterm, final) {
    if (!attendance || !midterm || !final) return null;
    
    // Công thức tính điểm: 10% chuyên cần + 40% giữa kỳ + 50% cuối kỳ
    const total = (attendance * 0.1) + (midterm * 0.4) + (final * 0.5);
    return Math.round(total * 100) / 100; // Làm tròn đến 2 chữ số thập phân
  }

  // Lấy danh sách điểm cần xác thực cho admin
  async getPendingGrades(req, res, next) {
    try {
      const grades = await Grade.findAll({
        where: {
          grade_status: 'graded' // Chỉ lấy những điểm đã được chấm
        },
        include: [{
          model: Enrollment,
          include: [
            {
              model: Student,
              attributes: ['id', 'full_name']
            },
            {
              model: Class,
              include: [{
                model: Course,
                attributes: ['name', 'code']
              }]
            }
          ]
        }],
        order: [['updated_at', 'DESC']]
      });

      res.json({
        success: true,
        data: grades
      });
    } catch (error) {
      next(error);
    }
  }

  // Xác thực điểm một học viên
  async verifyGrade(req, res, next) {
    try {
      const { id } = req.params;
      const { note } = req.body;

      const grade = await Grade.findByPk(id);
      if (!grade) {
        throw new ApiError(404, 'Không tìm thấy thông tin điểm');
      }

      if (grade.grade_status !== 'graded') {
        throw new ApiError(400, 'Điểm chưa được chấm hoặc đã được xác thực');
      }

      const updatedGrade = await grade.update({
        grade_status: 'verified',
        verified_by: req.user.id,
        verified_at: new Date()
      });

      // Ghi log hoạt động
      await ActivityLog.create({
        user_id: req.user.id,
        action: 'verify_grade',
        target_type: 'grade',
        target_id: id,
        description: note || 'Xác thực điểm',
        metadata: {
          grade_id: id,
          previous_status: 'graded',
          new_status: 'verified'
        }
      });

      res.json({
        success: true,
        message: 'Xác thực điểm thành công',
        data: updatedGrade
      });
    } catch (error) {
      next(error);
    }
  }

  // Xác thực điểm hàng loạt
  async verifyBulkGrades(req, res, next) {
    try {
      const { grade_ids, note } = req.body;
      const verifiedGrades = [];

      for (const id of grade_ids) {
        const grade = await Grade.findByPk(id);
        if (!grade || grade.grade_status !== 'graded') continue;

        const updatedGrade = await grade.update({
          grade_status: 'verified',
          verified_by: req.user.id,
          verified_at: new Date()
        });

        // Ghi log hoạt động
        await ActivityLog.create({
          user_id: req.user.id,
          action: 'verify_grade',
          target_type: 'grade',
          target_id: id,
          description: note || 'Xác thực điểm hàng loạt',
          metadata: {
            grade_id: id,
            previous_status: 'graded',
            new_status: 'verified'
          }
        });

        verifiedGrades.push(updatedGrade);
      }

      res.json({
        success: true,
        message: `Đã xác thực ${verifiedGrades.length} điểm`,
        data: verifiedGrades
      });
    } catch (error) {
      next(error);
    }
  }

  // Lấy điểm của một lớp (cho admin)
  async getClassGradesForAdmin(req, res, next) {
    try {
      const { class_id } = req.params;
      
      const enrollments = await Enrollment.findAll({
        where: { 
          class_id,
          status: 'enrolled'
        },
        include: [
          {
            model: Student,
            attributes: ['id', 'full_name'],
            required: true
          },
          {
            model: Grade,
            required: false
          }
        ],
        order: [[{ model: Student }, 'full_name', 'ASC']]
      });

      // Log để debug
      console.log('Raw enrollments:', JSON.stringify(enrollments, null, 2));

      const grades = enrollments.map(enrollment => ({
        enrollment_id: enrollment.id,
        full_name: enrollment.Student.full_name,  // Đảm bảo lấy đúng tên
        attendance_score: enrollment.Grade?.attendance_score,
        midterm_score: enrollment.Grade?.midterm_score,
        final_score: enrollment.Grade?.final_score,
        total_score: enrollment.Grade?.total_score,
        grade_status: enrollment.Grade?.grade_status || 'pending'
      }));

      // Log để debug
      console.log('Formatted grades:', JSON.stringify(grades, null, 2));

      return res.json({
        success: true,
        data: grades
      });

    } catch (error) {
      console.error('Error in getClassGradesForAdmin:', error);
      next(new ApiError(500, 'Không thể lấy danh sách điểm'));
    }
  }

  async getClassStudents(req, res, next) {
    try {
      const { id } = req.params;
      console.log('Fetching students for class:', id);

      const enrollments = await Enrollment.findAll({
        where: {
          class_id: id,
          status: 'enrolled'  // Chỉ lấy học viên đang enrolled
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

      console.log('Found enrollments:', enrollments.length);

      const students = enrollments.map(enrollment => ({
        enrollment_id: enrollment.id,
        full_name: enrollment.Student.full_name,
        email: enrollment.Student.User.email,
        phone: enrollment.Student.phone || '-',
        enrollment_date: enrollment.created_at
      }));

      console.log('Formatted students:', students.length);

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

module.exports = new GradeController(); 