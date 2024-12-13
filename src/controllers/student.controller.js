const { Student, User } = require('../models');
const { ApiError } = require('../utils/apiError');
const { validateStudentUpdate } = require('../validators/student.validator');

class StudentController {
  async getCurrentStudent(req, res, next) {
    try {
      console.log('Getting student profile for user:', req.user.id);
      
      const student = await Student.findOne({
        where: { user_id: req.user.id },
        include: [{
          model: User,
          attributes: ['email']
        }]
      });

      console.log('Found student:', student);

      if (!student) {
        throw new ApiError(404, 'Không tìm thấy thông tin học viên');
      }

      const response = {
        id: student.id,
        user_id: student.user_id,
        full_name: student.full_name,
        email: student.User.email,
        phone: student.phone || '',
        address: student.address || '',
        date_of_birth: student.date_of_birth,
        created_at: student.created_at,
        updated_at: student.updated_at
      };

      console.log('Sending response:', response);

      res.json({
        success: true,
        data: response
      });
    } catch (error) {
      console.error('Error in getCurrentStudent:', error);
      next(error);
    }
  }

  async updateStudent(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const student = await Student.findOne({
        where: { id, user_id: req.user.id }
      });

      if (!student) {
        throw new ApiError(404, 'Không tìm thấy thông tin học viên');
      }

      const { error, value } = validateStudentUpdate(updateData);
      if (error) {
        throw new ApiError(400, 'Dữ liệu không hợp lệ', error.details);
      }

      await student.update(value);

      res.json({
        success: true,
        message: 'Cập nhật thông tin thành công',
        data: student
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StudentController(); 