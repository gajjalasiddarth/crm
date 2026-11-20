const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const existing = await User.findOne({ email: 'admin_test@test.com' });
    if (existing) {
      console.log('Testing admin already exists');
      process.exit(0);
    }
    const user = await User.create({
      name: 'Test Admin',
      email: 'admin_test@test.com',
      password: 'password123',
      role: 'admin'
    });
    console.log(`Created admin user: ${user.name} (${user.email})`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createAdmin();
