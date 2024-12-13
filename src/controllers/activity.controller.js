const { AdminActivity } = require('../models');

class AdminActivityController {
  async logActivity(admin_id, activity_type, description, affected_table = null, affected_id = null) {
    try {
      return await AdminActivity.create({
        admin_id,
        activity_type,
        description,
        affected_table,
        affected_id
      });
    } catch (error) {
      console.error('Error logging admin activity:', error);
      throw error;
    }
  }

  async getActivities(req, res) {
    try {
      const activities = await AdminActivity.findAll({
        where: { admin_id: req.admin.id },
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