const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { Admin } = require('../models');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdmin() {
  try {
    console.log('=== Create Admin Account ===');
    
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password: ');
    const fullName = await question('Enter full name: ');
    const adminType = await question('Enter admin type (super_admin/course_admin/user_admin/finance_admin): ');
    const phone = await question('Enter phone number: ');

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      id: uuidv4(),
      email,
      password: hashedPassword,
      fullName,
      adminType,
      phone,
      loginAttempts: 0,
      isLocked: false,
      status: 'active'
    });

    console.log('\nAdmin created successfully:');
    console.log({
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      adminType: admin.adminType
    });

  } catch (error) {
    console.error('Error creating admin:', error.message);
  } finally {
    rl.close();
  }
}

// Nếu file được chạy trực tiếp
if (require.main === module) {
  createAdmin();
}

module.exports = createAdmin; 