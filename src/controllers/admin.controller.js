const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Admin, AdminActivity } = require('../models');

class AdminController {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email và mật khẩu không được để trống',
          code: 'MISSING_FIELDS',
          errors: {
            fields: {
              email: !email ? 'Email là bắt buộc' : null,
              password: !password ? 'Mật khẩu là bắt buộc' : null
            }
          }
        });
      }

      // Find admin
      const admin = await Admin.findOne({ where: { email } });
      if (!admin) {
        return res.status(401).json({
          success: false,
          message: 'Email hoặc mật khẩu không chính xác',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Check account status
      if (admin.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: 'Tài khoản đã bị vô hiệu hóa',
          code: 'ACCOUNT_DISABLED',
          details: {
            status: admin.status,
            reason: 'Account is not active'
          }
        });
      }

      // Check if account is locked
      if (admin.isLocked) {
        return res.status(403).json({
          success: false,
          message: 'Tài khoản đã bị khóa',
          code: 'ACCOUNT_LOCKED',
          details: {
            reason: 'Account is locked'
          }
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        // Increment login attempts
        admin.loginAttempts += 1;
        
        // Lock account after 5 failed attempts
        if (admin.loginAttempts >= 5) {
          admin.isLocked = true;
        }
        
        await admin.save();

        return res.status(401).json({
          success: false,
          message: 'Email hoặc mật khẩu không chính xác',
          code: 'INVALID_CREDENTIALS'
        });
      }

      // Reset login attempts on successful login
      admin.loginAttempts = 0;
      admin.lastLogin = new Date();
      await admin.save();

      // Create activity log
      await AdminActivity.create({
        adminId: admin.id,
        activityType: 'LOGIN',
        description: 'Admin logged in successfully'
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: admin.id,
          email: admin.email,
          adminType: admin.adminType 
        },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      res.json({
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          fullName: admin.fullName,
          adminType: admin.adminType
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }

  async logout(req, res) {
    try {
      const adminId = req.admin.id;
      
      // Log activity
      await AdminActivity.create({
        adminId,
        activityType: 'LOGOUT',
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
      const allowedFields = ['fullName', 'phone'];
      allowedFields.forEach(field => {
        if (req.body[field]) {
          admin[field] = req.body[field];
        }
      });

      await admin.save();

      // Log activity
      await AdminActivity.create({
        adminId: admin.id,
        activityType: 'PROFILE_UPDATE',
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