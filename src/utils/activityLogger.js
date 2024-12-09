const { AdminActivity } = require('../models');

class CourseActivityLogger {
  async logCreation(adminId, course) {
    return await AdminActivity.create({
      adminId,
      activityType: 'COURSE_CREATE',
      description: `Created new course: ${course.name} (${course.code})`,
      affectedTable: 'courses',
      affectedId: course.id
    });
  }

  async logUpdate(adminId, course, changes) {
    const changedFields = Object.keys(changes).join(', ');
    return await AdminActivity.create({
      adminId,
      activityType: 'COURSE_UPDATE',
      description: `Updated course: ${course.name} (${course.code}). Changed fields: ${changedFields}`,
      affectedTable: 'courses',
      affectedId: course.id
    });
  }

  async logDeletion(adminId, course) {
    return await AdminActivity.create({
      adminId,
      activityType: 'COURSE_DELETE',
      description: `Deleted course: ${course.name} (${course.code})`,
      affectedTable: 'courses',
      affectedId: course.id
    });
  }
}

class ClassActivityLogger {
  async logCreation(adminId, classData) {
    if (!classData) return;
    
    try {
      await AdminActivity.create({
        adminId,
        activityType: 'create',
        description: `Created class with code: ${classData.classCode}`,
        affectedTable: 'classes',
        affectedId: classData.id
      });
    } catch (error) {
      console.error('Error logging class creation:', error);
    }
  }

  async logUpdate(adminId, classData) {
    if (!classData) return;
    
    try {
      await AdminActivity.create({
        adminId,
        activityType: 'update',
        description: `Updated class with code: ${classData.classCode}`,
        affectedTable: 'classes',
        affectedId: classData.id
      });
    } catch (error) {
      console.error('Error logging class update:', error);
    }
  }

  async logDeletion(adminId, classData) {
    if (!classData) return;
    
    try {
      await AdminActivity.create({
        adminId,
        activityType: 'delete',
        description: `Deleted class with code: ${classData.classCode}`,
        affectedTable: 'classes',
        affectedId: classData.id
      });
    } catch (error) {
      console.error('Error logging class deletion:', error);
    }
  }
}

exports.courseActivityLogger = new CourseActivityLogger();
exports.classActivityLogger = new ClassActivityLogger(); 