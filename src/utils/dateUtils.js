/**
 * Format a date to Vietnamese locale string
 * @param {Date|string} date - The date to format
 * @returns {string|null} Formatted date string or null if date is invalid
 */
const formatDate = (date) => {
  if (!date) return null;
  
  try {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return null;
  }
};

/**
 * Add weeks to a date
 * @param {Date} date - The base date
 * @param {number} weeks - Number of weeks to add
 * @returns {Date} New date with added weeks
 */
const addWeeks = (date, weeks) => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + weeks * 7);
  return newDate;
};

/**
 * Check if a date is past due
 * @param {Date|string} date - The date to check
 * @returns {boolean} True if date is in the past
 */
const isPastDue = (date) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

module.exports = {
  formatDate,
  addWeeks,
  isPastDue
};
