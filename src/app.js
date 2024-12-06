const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sequelize = require('./config/database');
const routes = require('./routes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use(routes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Course Management System API' });
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối cơ sở dữ liệu thành công!');
    
    // Sync database (in development)
    await sequelize.sync({ alter: true });
    console.log('✅ Đã đồng bộ hóa cơ sở dữ liệu');

    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Không thể kết nối đến cơ sở dữ liệu:', error);
  }
};

startServer(); 