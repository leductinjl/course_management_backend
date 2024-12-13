const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan'); // Thêm morgan để log requests
const sequelize = require('./config/database');
const routes = require('./routes');
const { ApiError } = require('./utils/apiError');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev')); // Log requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log('\n=== New Request ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('===================\n');
  next();
});

// Routes
app.use((req, res, next) => {
  console.log('Route being accessed:', req.method, req.url);
  next();
});

app.use(routes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Course Management System API' });
});

// 404 handler
app.use((req, res, next) => {
  console.log('404 Not Found:', req.method, req.url);
  next(new ApiError(404, `Route ${req.method} ${req.url} not found`));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    status: err.statusCode || 500
  });

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(err.details && { details: err.details })
  });
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

    // Log all registered routes
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        console.log('Route:', {
          path: middleware.route.path,
          methods: Object.keys(middleware.route.methods)
        });
      } else if (middleware.name === 'router') {
        middleware.handle.stack.forEach((handler) => {
          if (handler.route) {
            console.log('Router Route:', {
              path: handler.route.path,
              methods: Object.keys(handler.route.methods)
            });
          }
        });
      }
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại cổng ${PORT}`);
      console.log(`📝 API Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('❌ Không thể kết nối đến cơ sở dữ liệu:', error);
    process.exit(1); // Exit with failure
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
  process.exit(1);
});

startServer();

module.exports = app;