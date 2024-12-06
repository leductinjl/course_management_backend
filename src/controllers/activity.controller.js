const { AdminActivity } = require('../models');

class AdminActivityController {
  async logActivity(adminId, activityType, description, affectedTable = null, affectedId = null) {
    try {
      return await AdminActivity.create({
        adminId,
        activityType,
        description,
        affectedTable,
        affectedId
      });
    } catch (error) {
      console.error('Error logging admin activity:', error);
      throw error;
    }
  }

  async getActivities(req, res) {
    try {
      const activities = await AdminActivity.findAll({
        where: { adminId: req.admin.id },
        order: [['created_at', 'DESC']],
        limit: 100
      });

      res.json(activities);
    } catch (error) {
      console.error('Error fetching admin activities:', error);
      res.status(500).json({
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      });
    }
  }
}

module.exports = new AdminActivityController();