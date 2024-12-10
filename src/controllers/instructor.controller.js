const { 
  Instructor, 
  User, 
  InstructorAchievement, 
  InstructorCertificate, 
  InstructorWorkHistory 
} = require('../models');
const { ApiError } = require('../utils/apiError');

class InstructorController {
  async listInstructors() {
    try {
      const instructors = await Instructor.findAll({
        attributes: ['id', 'fullName'],
        where: { status: 'ACTIVE' }
      });
      return instructors;
    } catch (error) {
      console.error('Error in listInstructors:', error);
      throw new ApiError(500, 'Lỗi khi lấy danh sách giảng viên');
    }
  }

  async getCurrentInstructor(req, res, next) {
    try {
      const userId = req.user.id;
      console.log('Getting instructor with userId:', userId);

      if (!userId) {
        throw new ApiError(400, 'User ID is required');
      }

      const instructor = await User.findOne({
        where: {
          id: userId,
          role: 'instructor'
        },
        include: [
          // your includes here
        ]
      });

      if (!instructor) {
        throw new ApiError(404, 'Instructor not found');
      }

      res.json({
        success: true,
        data: instructor
      });
    } catch (error) {
      console.error('Error in getCurrentInstructor:', error);
      next(new ApiError(500, 'Lỗi khi tải thông tin giảng viên'));
    }
  }

  // Achievement methods
  async getAchievements(instructorId) {
    try {
      const achievements = await InstructorAchievement.findAll({
        where: { instructorId },
        order: [['achievementDate', 'DESC']]
      });
      return achievements;
    } catch (error) {
      console.error('Error in getAchievements:', error);
      throw new ApiError(500, 'Lỗi khi lấy thông tin thành tích');
    }
  }

  async createAchievement(instructorId, data) {
    try {
      const achievement = await InstructorAchievement.create({
        instructorId,
        title: data.title,
        description: data.description,
        achievementDate: data.achievementDate
      });
      return achievement;
    } catch (error) {
      console.error('Error in createAchievement:', error);
      throw new ApiError(500, 'Lỗi khi tạo thành tích mới');
    }
  }

  // Certificate methods
  async getCertificates(instructorId) {
    try {
      const certificates = await InstructorCertificate.findAll({
        where: { instructorId },
        order: [['issueYear', 'DESC']]
      });
      return certificates;
    } catch (error) {
      console.error('Error in getCertificates:', error);
      throw new ApiError(500, 'Lỗi khi lấy thông tin chứng chỉ');
    }
  }

  async createCertificate(instructorId, data) {
    try {
      const certificate = await InstructorCertificate.create({
        instructorId,
        name: data.name,
        issuer: data.issuer,
        issueYear: data.issueYear
      });
      return certificate;
    } catch (error) {
      console.error('Error in createCertificate:', error);
      throw new ApiError(500, 'Lỗi khi tạo chứng chỉ mới');
    }
  }

  // Work History methods
  async getWorkHistory(instructorId) {
    try {
      const workHistory = await InstructorWorkHistory.findAll({
        where: { instructorId },
        order: [['startDate', 'DESC']]
      });
      return workHistory;
    } catch (error) {
      console.error('Error in getWorkHistory:', error);
      throw new ApiError(500, 'Lỗi khi lấy thông tin quá trình công tác');
    }
  }

  async createWorkHistory(instructorId, data) {
    try {
      const workHistory = await InstructorWorkHistory.create({
        instructorId,
        position: data.position,
        department: data.department,
        startDate: data.startDate,
        endDate: data.endDate,
        responsibilities: data.responsibilities
      });
      return workHistory;
    } catch (error) {
      console.error('Error in createWorkHistory:', error);
      throw new ApiError(500, 'Lỗi khi tạo quá trình công tác mới');
    }
  }

  async updateInstructor(instructorId, data) {
    try {
      const instructor = await Instructor.findByPk(instructorId, {
        include: [{
          model: User,
          attributes: ['email']
        }]
      });

      if (!instructor) {
        throw new ApiError(404, 'Không tìm thấy thông tin giảng viên');
      }

      // Cập nhật thông tin giảng viên
      await instructor.update(data);

      // Log để debug
      console.log('Updated instructor:', {
        id: instructor.id,
        fullName: instructor.fullName,
        email: instructor.User ? instructor.User.email : 'N/A'
      });

      return instructor;
    } catch (error) {
      console.error('Error in updateInstructor:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Lỗi khi cập nhật thông tin giảng viên');
    }
  }
}

module.exports = new InstructorController(); 