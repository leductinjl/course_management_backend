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
    return await AdminActivity.create({
      adminId,
      activityType: 'CLASS_CREATE',
      description: `Created new class: ${classData.classCode}`,
      affectedTable: 'classes',
      affectedId: classData.id
    });
  }

  async logUpdate(adminId, classData, changes) {
    const changeDescription = Object.keys(changes)
      .map(key => `${key}: ${changes[key]}`)
      .join(', ');

    return await AdminActivity.create({
      adminId,
      activityType: 'CLASS_UPDATE',
      description: `Updated class ${classData.classCode}: ${changeDescription}`,
      affectedTable: 'classes',
      affectedId: classData.id
    });
  }

  async logDeletion(adminId, classData) {
    return await AdminActivity.create({
      adminId,
      activityType: 'CLASS_DELETE',
      description: `Deleted class: ${classData.classCode}`,
      affectedTable: 'classes',
      affectedId: classData.id
    });
  }
}

exports.courseActivityLogger = new CourseActivityLogger();
exports.classActivityLogger = new ClassActivityLogger(); 