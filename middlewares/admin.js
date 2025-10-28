const User = require('../models/User');
const bcrypt = require('bcryptjs');

const initializeAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminEmail || !adminPassword) {
      console.error('Admin credentials not found in environment variables');
      return;
    }

    const adminExists = await User.findOne({ email: adminEmail });
    
    if (!adminExists) {
      // Hash the admin password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      const admin = new User({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        phoneNumber: '',
        address: '',
        city: '',
        state: '',
        pincode: ''
      });
      
      await admin.save();
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
      
      // Update admin password if it has changed
      const isPasswordValid = await bcrypt.compare(adminPassword, adminExists.password);
      if (!isPasswordValid) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);
        
        adminExists.password = hashedPassword;
        await adminExists.save();
        console.log('Admin password updated');
      }
    }
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
};

module.exports = initializeAdmin;