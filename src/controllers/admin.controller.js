const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Admin, AdminActivity } = require('../models');

class AdminController {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const admin = await Admin.findOne({ 
        where: { email },
        attributes: ['id', 'email', 'password', 'admin_type', 'full_name', 'status', 'is_locked']
      });

      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Email hoặc mật khẩu không chính xác'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Email hoặc mật khẩu không chính xác'
        });
      }

      if (admin.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'Tài khoản đã bị vô hiệu hóa'
        });
      }

      const token = jwt.sign(
        {
          id: admin.id,
          email: admin.email,
          role: 'admin',
          admin_type: admin.admin_type,
          isAdmin: true
        },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      // Log the login activity
      await AdminActivity.create({
        admin_id: admin.id,
        activity_type: 'LOGIN',
        description: 'Admin logged in'
      });

      res.json({
        success: true,
        data: {
          token,
          admin: {
            id: admin.id,
            email: admin.email,
            full_name: admin.full_name,
            admin_type: admin.admin_type
          }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }

  async logout(req, res) {
    try {
      const admin_id = req.admin.id;
      
      // Log activity
      await AdminActivity.create({
        admin_id,
        activity_type: 'LOGOUT',
        description: 'Admin logged out'
      });

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  async getProfile(req, res) {
    try {
      const admin = await Admin.findByPk(req.admin.id, {
        attributes: { exclude: ['password'] }
      });
      
      if (!admin) {
        return res.status(404).json({
          message: 'Admin not found',
          code: 'NOT_FOUND'
        });
      }

      res.json(admin);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const admin = await Admin.findByPk(req.admin.id);
      
      if (!admin) {
        return res.status(404).json({
          message: 'Admin not found',
          code: 'NOT_FOUND'
        });
      }

      // Update allowed fields
      const allowedFields = ['full_name', 'phone'];
      allowedFields.forEach(field => {
        if (req.body[field]) {
          admin[field] = req.body[field];
        }
      });

      await admin.save();

      // Log activity
      await AdminActivity.create({
        admin_id: admin.id,
        activity_type: 'PROFILE_UPDATE',
        description: 'Admin updated their profile'
      });

      res.json(admin);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }
}

module.exports = new AdminController(); 