const { AdminActivity } = require('../models');

class CourseActivityLogger {
  async logCreation(admin_id, course) {
    return await AdminActivity.create({
      admin_id,
      activity_type: 'COURSE_CREATE',
      description: `Created new course: ${course.name} (${course.code})`,
      affected_table: 'courses',
      affected_id: course.id
    });
  }

  async logUpdate(admin_id, course, changes) {
    const changedFields = Object.keys(changes).join(', ');
    return await AdminActivity.create({
      admin_id,
      activity_type: 'COURSE_UPDATE',
      description: `Updated course: ${course.name} (${course.code}). Changed fields: ${changedFields}`,
      affected_table: 'courses',
      affected_id: course.id
    });
  }

  async logDeletion(admin_id, course) {
    return await AdminActivity.create({
      admin_id,
      activity_type: 'COURSE_DELETE',
      description: `Deleted course: ${course.name} (${course.code})`,
      affected_table: 'courses',
      affected_id: course.id
    });
  }
}

class ClassActivityLogger {
  async logCreation(admin_id, classData) {
    if (!classData) return;
    
    try {
      await AdminActivity.create({
        admin_id,
        activity_type: 'create',
        description: `Created class with code: ${classData.class_code}`,
        affected_table: 'classes',
        affected_id: classData.id
      });
    } catch (error) {
      console.error('Error logging class creation:', error);
    }
  }

  async logUpdate(admin_id, classData) {
    if (!classData) return;
    
    try {
      await AdminActivity.create({
        admin_id,
        activity_type: 'update',
        description: `Updated class with code: ${classData.class_code}`,
        affected_table: 'classes',
        affected_id: classData.id
      });
    } catch (error) {
      console.error('Error logging class update:', error);
    }
  }

  async logDeletion(admin_id, classData) {
    if (!classData) return;
    
    try {
      await AdminActivity.create({
        admin_id,
        activity_type: 'delete',
        description: `Deleted class with code: ${classData.class_code}`,
        affected_table: 'classes',
        affected_id: classData.id
      });
    } catch (error) {
      console.error('Error logging class deletion:', error);
    }
  }
}

exports.courseActivityLogger = new CourseActivityLogger();
exports.classActivityLogger = new ClassActivityLogger(); 