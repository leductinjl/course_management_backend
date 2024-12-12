const { User, Student, Instructor, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const adminActivityController = require('./activity.controller');
const { Op } = require('sequelize');

class UserManagementController {
  async listUsers(req, res) {
    try {
      const users = await User.findAll({
        include: [
          { 
            model: Student,
            as: 'studentProfile',
            attributes: { 
              exclude: ['createdAt', 'updatedAt', 'password'] 
            }
          },
          { 
            model: Instructor,
            as: 'instructorProfile',
            attributes: { 
              exclude: ['createdAt', 'updatedAt', 'password'] 
            }
          }
        ],
        attributes: { 
          exclude: ['password'] 
        }
      });

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Error listing users:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể tải danh sách người dùng',
        code: 'SERVER_ERROR'
      });
    }
  }

  async createUser(req, res) {
    const t = await sequelize.transaction();

    try {
      const { email, password, fullName, role, status = 'active' } = req.body;

      // Check if admin exists in request
      if (!req.admin || !req.admin.id) {
        await t.rollback();
        return res.status(401).json({
          success: false,
          message: 'Unauthorized - Admin information missing',
          code: 'UNAUTHORIZED'
        });
      }

      // Validate required fields
      if (!email || !password || !fullName || !role) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: 'Thiếu thông tin bắt buộc',
          code: 'MISSING_REQUIRED_FIELDS'
        });
      }

      // Check if email exists
      const existingUser = await User.findOne({ 
        where: { email },
        transaction: t 
      });

      if (existingUser) {
        await t.rollback();
        return res.status(400).json({
          success: false,
          message: 'Email đã tồn tại trong hệ thống',
          code: 'EMAIL_EXISTS'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create base user
      const user = await User.create({
        email,
        password: hashedPassword,
        role,
        status,
      }, { transaction: t });

      // Create profile based on role
      let profile;
      if (role === 'student') {
        profile = await Student.create({
          userId: user.id,
          fullName,
          createdBy: req.admin.id,
        }, { transaction: t });
      } else if (role === 'instructor') {
        profile = await Instructor.create({
          userId: user.id,
          fullName,
          createdBy: req.admin.id,
        }, { transaction: t });
      }

      await t.commit();

      // Log activity
      await adminActivityController.logActivity(
        req.admin.id,
        'CREATE_USER',
        `Created new ${role}: ${fullName}`,
        'users',
        user.id
      );

      // Return created user with profile
      const createdUser = await User.findByPk(user.id, {
        include: [
          { 
            model: Student,
            as: 'studentProfile',
            attributes: { exclude: ['password'] }
          },
          { 
            model: Instructor,
            as: 'instructorProfile',
            attributes: { exclude: ['password'] }
          }
        ],
        attributes: { exclude: ['password'] }
      });

      res.status(201).json({
        success: true,
        data: createdUser
      });

    } catch (error) {
      await t.rollback();
      console.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        message: 'Không thể tạo người dùng',
        code: 'SERVER_ERROR'
      });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { email, fullName, status, ...userData } = req.body;

      const result = await sequelize.transaction(async (t) => {
        const user = await User.findByPk(id);
        if (!user) {
          throw new Error('NOT_FOUND');
        }

        // Update user with status
        await user.update({
          email,
          status,
          ...userData
        }, { transaction: t });

        // Update profile without status
        if (user.role === 'student') {
          await Student.update(
            { 
              fullName,
              updatedBy: req.admin.id,
              ...userData 
            },
            { 
              where: { userId: id },
              transaction: t 
            }
          );
        } else if (user.role === 'instructor') {
          await Instructor.update(
            { 
              fullName,
              updatedBy: req.admin.id,
              ...userData 
            },
            { 
              where: { userId: id },
              transaction: t 
            }
          );
        }

        return user;
      });

      await adminActivityController.logActivity(
        req.admin.id,
        'UPDATE_USER',
        `Updated ${result.role}: ${fullName}`,
        'users',
        id
      );

      const updatedUser = await User.findByPk(id, {
        include: [
          { 
            model: Student,
            as: 'studentProfile',
            attributes: { exclude: ['password'] }
          },
          { 
            model: Instructor,
            as: 'instructorProfile',
            attributes: { exclude: ['password'] }
          }
        ],
        attributes: { exclude: ['password'] }
      });

      res.json({
        success: true,
        data: updatedUser
      });
    } catch (error) {
      if (error.message === 'NOT_FOUND') {
        return res.status(404).json({
          message: 'User not found',
          code: 'NOT_FOUND'
        });
      }
      console.error('Error updating user:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      
      if (!user) {
        return res.status(404).json({
          message: 'User not found',
          code: 'NOT_FOUND'
        });
      }

      await adminActivityController.logActivity(
        req.admin.id,
        'DELETE_USER',
        `Deleted ${user.role} with email: ${user.email}`,
        'users',
        id
      );

      await user.destroy();
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }
}

module.exports = new UserManagementController(); 