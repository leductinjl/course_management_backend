const Joi = require('joi');

const schedulePattern = /^(MON|TUE|WED|THU|FRI|SAT)(,(MON|TUE|WED|THU|FRI|SAT|SUN))* \d{2}:\d{2}-\d{2}:\d{2} [A-Z0-9]+$/;

const validateSchedule = (schedule) => {
  if (!schedulePattern.test(schedule)) {
    throw new Error('Định dạng lịch học không hợp lệ. Ví dụ đúng: "MON,WED,FRI 18:00-20:00 A101"');
  }
  
  const [days, time, room] = schedule.split(' ');
  const [startTime, endTime] = time.split('-');
  
  // Kiểm tra thời gian hợp lệ
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  if (startHour < 7 || startHour > 21 || endHour < 7 || endHour > 21) {
    throw new Error('Thời gian học phải nằm trong khoảng 7:00-21:00');
  }
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  if (endMinutes <= startMinutes) {
    throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu');
  }
  
  return true;
};

module.exports = {
  validateSchedule
}; 