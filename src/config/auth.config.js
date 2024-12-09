require('dotenv').config();

module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET || '22ha',
    refreshSecret: process.env.JWT_REFRESH_SECRET || '23ha',
    expiresIn: '1h',  // Token hết hạn sau 1 giờ
    refreshExpiresIn: '7d'  // Refresh token hết hạn sau 7 ngày
  }
}; 