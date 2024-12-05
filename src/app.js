const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Database sync
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced');
}).catch(err => {
  console.error('Error syncing database:', err);
});

module.exports = app;
