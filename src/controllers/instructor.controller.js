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
        attributes: ['id', 'full_name'],
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
      console.log('Getting current instructor for user:', req.user.id);
      
      const user = await User.findByPk(req.user.id, {
        attributes: ['id', 'email']
      });

      const instructor = await Instructor.findOne({
        where: { user_id: req.user.id }
      });

      if (!instructor) {
        throw new ApiError(404, 'Không tìm thấy thông tin giảng viên');
      }

      const response = {
        id: instructor.id,
        full_name: instructor.full_name,
        email: user.email,
        phone: instructor.phone || '',
        address: instructor.address || '',
        specialization: instructor.specialization || '',
        bio: instructor.bio || '',
        created_at: instructor.created_at,
        updated_at: instructor.updated_at
      };

      return res.status(200).json({
        success: true,
        data: response
      });
    } catch (error) {
      console.error('Error in getCurrentInstructor:', error);
      next(error);
    }
  }

  // Achievement methods
  async getAchievements(instructor_id) {
    try {
      const achievements = await InstructorAchievement.findAll({
        where: { instructor_id },
        order: [['achievementDate', 'DESC']]
      });
      return achievements;
    } catch (error) {
      console.error('Error in getAchievements:', error);
      throw new ApiError(500, 'Lỗi khi lấy thông tin thành tích');
    }
  }

  async createAchievement(instructor_id, data) {
    try {
      const achievement = await InstructorAchievement.create({
        instructor_id,
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

  async updateAchievement(instructor_id, achievementId, data) {
    try {
      const achievement = await InstructorAchievement.findOne({
        where: { 
          id: achievementId,
          instructor_id 
        }
      });

      if (!achievement) {
        throw new ApiError(404, 'Không tìm thấy thành tích');
      }

      await achievement.update({
        title: data.title,
        description: data.description,
        achievementDate: data.achievementDate
      });

      return achievement;
    } catch (error) {
      console.error('Error in updateAchievement:', error);
      throw new ApiError(500, 'Lỗi khi cập nhật thành tích');
    }
  }

  async deleteAchievement(instructor_id, achievementId) {
    try {
      const achievement = await InstructorAchievement.findOne({
        where: { 
          id: achievementId,
          instructor_id 
        }
      });

      if (!achievement) {
        throw new ApiError(404, 'Không tìm thấy thành tích');
      }

      await achievement.destroy();
    } catch (error) {
      console.error('Error in deleteAchievement:', error);
      throw new ApiError(500, 'Lỗi khi xóa thành tích');
    }
  }

  // Certificate methods
  async getCertificates(instructor_id) {
    try {
      const certificates = await InstructorCertificate.findAll({
        where: { instructor_id },
        order: [['issue_year', 'DESC']]
      });
      return certificates;
    } catch (error) {
      console.error('Error in getCertificates:', error);
      throw new ApiError(500, 'Lỗi khi lấy thông tin chứng chỉ');
    }
  }

  async createCertificate(instructor_id, data) {
    try {
      const certificate = await InstructorCertificate.create({
        instructor_id,
        name: data.name,
        issuer: data.issuer,
        issue_year: data.issue_year
      });
      return certificate;
    } catch (error) {
      console.error('Error in createCertificate:', error);
      throw new ApiError(500, 'Lỗi khi tạo chứng chỉ mới');
    }
  }

  async updateCertificate(instructor_id, certificateId, data) {
    try {
      const certificate = await InstructorCertificate.findOne({
        where: { 
          id: certificateId,
          instructor_id 
        }
      });

      if (!certificate) {
        throw new ApiError(404, 'Không tìm thấy chứng chỉ');
      }

      await certificate.update({
        name: data.name,
        issuer: data.issuer,
        issue_year: data.issue_year
      });

      return certificate;
    } catch (error) {
      console.error('Error in updateCertificate:', error);
      throw new ApiError(500, 'Lỗi khi cập nhật chứng chỉ');
    }
  }

  async deleteCertificate(instructor_id, certificateId) {
    try {
      const certificate = await InstructorCertificate.findOne({
        where: { 
          id: certificateId,
          instructor_id 
        }
      });

      if (!certificate) {
        throw new ApiError(404, 'Không tìm thấy chứng chỉ');
      }

      await certificate.destroy();
    } catch (error) {
      console.error('Error in deleteCertificate:', error);
      throw new ApiError(500, 'Lỗi khi xóa chứng chỉ');
    }
  }

  // Work History methods
  async getWorkHistory(instructor_id) {
    try {
      const workHistory = await InstructorWorkHistory.findAll({
        where: { instructor_id },
        order: [['start_date', 'DESC']]
      });
      return workHistory;
    } catch (error) {
      console.error('Error in getWorkHistory:', error);
      throw new ApiError(500, 'Lỗi khi lấy thông tin quá trình công tác');
    }
  }

  async createWorkHistory(instructor_id, data) {
    try {
      const workHistory = await InstructorWorkHistory.create({
        instructor_id,
        position: data.position,
        department: data.department,
        start_date: data.start_date,
        end_date: data.end_date,
        responsibilities: data.responsibilities
      });
      return workHistory;
    } catch (error) {
      console.error('Error in createWorkHistory:', error);
      throw new ApiError(500, 'Lỗi khi tạo quá trình công tác mới');
    }
  }

  async updateWorkHistory(instructor_id, historyId, data) {
    try {
      const workHistory = await InstructorWorkHistory.findOne({
        where: { 
          id: historyId,
          instructor_id 
        }
      });

      if (!workHistory) {
        throw new ApiError(404, 'Không tìm thấy quá trình công tác');
      }

      await workHistory.update({
        position: data.position,
        department: data.department,
        start_date: data.start_date,
        end_date: data.end_date,
        responsibilities: data.responsibilities
      });

      return workHistory;
    } catch (error) {
      console.error('Error in updateWorkHistory:', error);
      throw new ApiError(500, 'Lỗi khi cập nhật quá trình công tác');
    }
  }

  async deleteWorkHistory(instructor_id, historyId) {
    try {
      const workHistory = await InstructorWorkHistory.findOne({
        where: { 
          id: historyId,
          instructor_id 
        }
      });

      if (!workHistory) {
        throw new ApiError(404, 'Không tìm thấy quá trình công tác');
      }

      await workHistory.destroy();
    } catch (error) {
      console.error('Error in deleteWorkHistory:', error);
      throw new ApiError(500, 'Lỗi khi xóa quá trình công tác');
    }
  }

  async updateInstructor(req, res, next) {
    try {
      const instructor_id = req.params.id;
      const updateData = req.body;

      const instructor = await Instructor.findOne({
        where: { id: instructor_id },
        include: [{
          model: User,
          attributes: ['email']
        }]
      });

      if (!instructor) {
        throw new ApiError(404, 'Không tìm thấy thông tin giảng viên');
      }

      await instructor.update(updateData);

      console.log('Updated instructor:', {
        id: instructor.id,
        full_name: instructor.full_name,
        email: instructor.User ? instructor.User.email : 'N/A'
      });

      return res.status(200).json({
        success: true,
        data: instructor
      });

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