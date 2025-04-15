# 🎓 Course Management Backend API

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white)](https://sequelize.org/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)](https://jwt.io/)

A robust backend API for the Course Management System, built with Node.js and Express.js. This API powers the course management application's core functionality, handling user authentication, course management, enrollment processing, and payment integration.

## 🚀 Features

- **User Management**
  - Secure authentication with JWT
  - Role-based access control (Admin, Instructor, Student)
  - User profile management
  - Account security features

- **Course Management**
  - CRUD operations for courses
  - Class scheduling and management
  - Course content organization
  - Category handling

- **Enrollment System**
  - Student enrollment processing
  - Enrollment status tracking
  - Class capacity management
  - Enrollment history

- **Payment Integration**
  - VNPay payment gateway integration
  - Payment status tracking
  - Transaction history
  - Secure payment processing

## 🛠️ Technical Stack

- **Backend**
  - Node.js
  - Express.js
  - PostgreSQL
  - Sequelize ORM
  - JWT for authentication

- **API Features**
  - RESTful API design
  - Input validation with Joi
  - Error handling middleware
  - Request logging
  - CORS support

- **Development Tools**
  - ESLint
  - Nodemon for development
  - Postman for API testing
  - Winston for logging

## 🎯 Project Goals

This backend project was developed with the following objectives:
- Create a scalable and maintainable course management system
- Implement secure authentication and role-based access control
- Provide efficient course and class management
- Integrate secure payment processing
- Follow RESTful API best practices
- Ensure data integrity and security

## 💻 Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/course_management_backend.git
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server
```bash
npm run dev
```

5. Start the production server
```bash
npm start
```

## 📚 API Documentation

The API documentation is available at `/api-docs` when running the server in development mode.

### Key Endpoints

- **Authentication**
  - POST `/api/auth/login` - User login
  - POST `/api/auth/refresh-token` - Refresh access token
  - GET `/api/auth/profile` - Get user profile

- **Course Management**
  - GET `/api/courses` - Get all courses
  - GET `/api/courses/:id` - Get course details
  - POST `/api/courses` - Create new course
  - PUT `/api/courses/:id` - Update course
  - DELETE `/api/courses/:id` - Delete course

- **Class Management**
  - GET `/api/classes` - Get all classes
  - GET `/api/classes/:id` - Get class details
  - POST `/api/classes` - Create new class
  - PUT `/api/classes/:id` - Update class
  - DELETE `/api/classes/:id` - Delete class

- **Enrollment**
  - POST `/api/enrollments` - Create new enrollment
  - GET `/api/enrollments` - Get user enrollments
  - GET `/api/enrollments/:id` - Get enrollment details
  - PUT `/api/enrollments/:id/status` - Update enrollment status

- **Payment**
  - POST `/api/payments/create` - Create payment
  - GET `/api/payments/return` - Payment return URL
  - GET `/api/payments/history` - Get payment history

## 📚 Learning Outcomes

Through this project, I have gained:
- Experience with Node.js and Express.js
- Understanding of RESTful API design
- Database modeling with PostgreSQL and Sequelize
- Authentication and authorization implementation
- Payment gateway integration
- API documentation practices
- Error handling and logging
- Performance optimization
- Security best practices

## 🔍 Future Improvements

- Implement real-time notifications
- Add more payment gateway options
- Enhance search functionality
- Implement caching
- Add comprehensive testing suite
- Improve API documentation
- Add analytics dashboard
- Implement file upload for course materials

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

For any inquiries or feedback, please reach out to:
- Email: [leductin.ld@gmail.com](mailto:leductin.ld@gmail.com)
- GitHub: [leductinjl](https://github.com/leductinjl) 
