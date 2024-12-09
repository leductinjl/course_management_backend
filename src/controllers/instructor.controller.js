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

  async getCurrentInstructor(userId) {
    try {
      const instructor = await Instructor.findOne({
        where: { userId },
        include: [{
          model: User,
          attributes: ['email']
        }]
      });

      if (!instructor) {
        throw new ApiError(404, 'Không tìm thấy thông tin giảng viên');
      }

      return {
        id: instructor.id,
        fullName: instructor.fullName,
        email: instructor.User.email,
        phone: instructor.phone,
        address: instructor.address,
        specialization: instructor.specialization,
        bio: instructor.bio,
        created_at: instructor.created_at,
        updated_at: instructor.updated_at
      };
    } catch (error) {
      console.error('Error in getCurrentInstructor:', error);
      throw error;
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
}

module.exports = new InstructorController(); 