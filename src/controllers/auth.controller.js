const { User, Student, Instructor } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ApiError } = require('../utils/apiError');

class AuthController {
  async studentLogin(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({
        where: { email, role: 'student' },
        include: [{
          model: Student,
          as: 'studentProfile'
        }]
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw ApiError.unauthorized('Email hoặc mật khẩu không chính xác');
      }

      if (user.status !== 'active') {
        throw ApiError.forbidden('Tài khoản đã bị khóa');
      }

      const token = jwt.sign(
        { id: user.id, role: 'student' },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            role: 'student',
            profile: user.studentProfile
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async instructorLogin(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({
        where: { email, role: 'instructor' },
        include: [{
          model: Instructor,
          as: 'instructorProfile',
          foreignKey: 'user_id'
        }]
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw ApiError.unauthorized('Email hoặc mật khẩu không chính xác');
      }

      if (user.status !== 'active') {
        throw ApiError.forbidden('Tài khoản đã bị khóa');
      }

      const token = jwt.sign(
        { 
          id: user.id,
          email: user.email,
          role: 'instructor'
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            role: 'instructor',
            profile: user.instructorProfile
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async studentRegister(req, res, next) {
    try {
      const { email, password, full_name, phoneNumber, address } = req.body;

      // Check if email exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw ApiError.badRequest('Email đã tồn tại trong hệ thống');
      }

      // Create user
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        email,
        password: hashedPassword,
        role: 'student',
        status: 'active'  // Set active by default
      });

      // Create student profile
      await Student.create({
        user_id: user.id,
        full_name,
        phoneNumber,
        address
      });

      res.status(201).json({
        success: true,
        message: 'Đăng ký thành công. Bạn có thể đăng nhập ngay bây giờ.'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController(); 