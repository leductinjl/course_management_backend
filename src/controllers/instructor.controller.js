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
      console.log('Getting instructor with userId:', userId);
      
      // Tìm user trước để đảm bảo user tồn tại và active
      const user = await User.findOne({
        where: { 
          id: userId,
          role: 'instructor',
          status: 'active'
        }
      });

      if (!user) {
        console.log('User not found or inactive:', userId);
        throw new ApiError(404, 'Không tìm thấy thông tin người dùng hoặc tài khoản không hoạt động');
      }

      // Sau đó tìm instructor profile
      const instructor = await Instructor.findOne({
        where: { 
          userId: user.id  // Dùng user.id từ user đã tìm được
        }
      });

      if (!instructor) {
        console.log('Instructor profile not found for user:', userId);
        throw new ApiError(404, 'Không tìm thấy thông tin giảng viên');
      }

      // Log để debug
      console.log('Found instructor:', {
        id: instructor.id,
        fullName: instructor.fullName,
        email: user.email,
        status: user.status
      });

      return {
        id: instructor.id,
        fullName: instructor.fullName,
        email: user.email,
        phone: instructor.phone || null,
        address: instructor.address || null,
        specialization: instructor.specialization || null,
        bio: instructor.bio || null,
        created_at: instructor.created_at,
        updated_at: instructor.updated_at
      };
    } catch (error) {
      console.error('Error in getCurrentInstructor:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Lỗi khi tải thông tin giảng viên');
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