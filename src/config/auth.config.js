require('dotenv').config();

module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    expiresIn: '1h',  // Token hết hạn sau 1 giờ
    refreshExpiresIn: '7d'  // Refresh token hết hạn sau 7 ngày
  }
}; 