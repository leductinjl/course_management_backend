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

exports.courseActivityLogger = new CourseActivityLogger(); 