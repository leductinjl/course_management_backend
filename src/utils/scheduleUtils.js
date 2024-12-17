const dayjs = require('dayjs');
const isBetween = require('dayjs/plugin/isBetween');
const isSameOrBefore = require('dayjs/plugin/isSameOrBefore');
const isSameOrAfter = require('dayjs/plugin/isSameOrAfter');

dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

function parseSchedule(schedule) {
  if (!schedule) {
    console.warn('Schedule is empty');
    return null;
  }

  try {
    // Format: "MON,WED,FRI|07:30-09:00"
    const [daysStr, timeStr] = schedule.split('|');
    const days = daysStr.split(',');
    const [startTime, endTime] = timeStr.split('-');

    // Validate format
    if (!days.length || !startTime || !endTime) {
      console.warn('Invalid schedule format:', schedule);
      return null;
    }

    // Convert time to minutes for easier comparison
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    return {
      days,
      startTime: startMinutes,
      endTime: endMinutes
    };
  } catch (error) {
    console.error('Error parsing schedule:', error);
    return null;
  }
}

function checkScheduleConflict(schedule1, startDate1, endDate1, schedule2, startDate2, endDate2) {
  console.log('Checking schedule conflict between:', {
    schedule1, startDate1, endDate1,
    schedule2, startDate2, endDate2
  });

  if (!schedule1 || !schedule2 || !startDate1 || !endDate1 || !startDate2 || !endDate2) {
    console.warn('Missing required parameters for schedule conflict check');
    return false;
  }

  try {
    const parsed1 = parseSchedule(schedule1);
    const parsed2 = parseSchedule(schedule2);

    if (!parsed1 || !parsed2) {
      console.warn('Invalid schedule format');
      return false;
    }

    // Kiểm tra xem hai khoảng thời gian có giao nhau không
    const start1 = dayjs(startDate1);
    const end1 = dayjs(endDate1);
    const start2 = dayjs(startDate2);
    const end2 = dayjs(endDate2);

    // Kiểm tra giao nhau của khoảng thời gian
    const hasDateOverlap = !(
      end1.isBefore(start2) || 
      start1.isAfter(end2)
    );

    console.log('Date overlap check:', {
      hasDateOverlap,
      period1: `${start1.format('YYYY-MM-DD')} to ${end1.format('YYYY-MM-DD')}`,
      period2: `${start2.format('YYYY-MM-DD')} to ${end2.format('YYYY-MM-DD')}`
    });

    if (!hasDateOverlap) {
      return false;
    }

    // Kiểm tra xem có ngày học nào trùng nhau không
    const commonDays = parsed1.days.filter(day => parsed2.days.includes(day));
    
    if (commonDays.length === 0) {
      return false;
    }

    // Kiểm tra thời gian học có giao nhau không
    const hasTimeOverlap = !(
      parsed1.endTime <= parsed2.startTime || 
      parsed1.startTime >= parsed2.endTime
    );

    console.log('Time overlap check:', {
      commonDays,
      hasTimeOverlap,
      time1: `${Math.floor(parsed1.startTime/60)}:${parsed1.startTime%60}-${Math.floor(parsed1.endTime/60)}:${parsed1.endTime%60}`,
      time2: `${Math.floor(parsed2.startTime/60)}:${parsed2.startTime%60}-${Math.floor(parsed2.endTime/60)}:${parsed2.endTime%60}`
    });

    return hasTimeOverlap && commonDays.length > 0;
  } catch (error) {
    console.error('Error checking schedule conflict:', error);
    return false;
  }
}

module.exports = {
  parseSchedule,
  checkScheduleConflict
}; 