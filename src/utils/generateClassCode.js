const { Class } = require('../models');
const { Op } = require('sequelize');

const generateClassCode = async () => {
  // Format: CLS-YYYYMM-XXX
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const prefix = `CLS-${year}${month}-`;

  // Tìm mã lớp cuối cùng có prefix tương tự
  const lastClass = await Class.findOne({
    where: {
      class_code: {
        [Op.like]: `${prefix}%`
      }
    },
    order: [['class_code', 'DESC']]
  });

  let sequence = 1;
  if (lastClass) {
    // Lấy số sequence từ mã lớp cuối cùng
    const lastSequence = parseInt(lastClass.class_code.split('-')[2]);
    sequence = lastSequence + 1;
  }

  // Tạo mã lớp mới với sequence được padding với số 0
  return `${prefix}${String(sequence).padStart(3, '0')}`;
};

module.exports = { generateClassCode };
