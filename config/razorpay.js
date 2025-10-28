const Razorpay = require('razorpay');

// Validate environment variables
if (!process.env.RAZORPAY_KEY_ID) {
  console.error('RAZORPAY_KEY_ID is not set in environment variables');
  process.exit(1);
}

if (!process.env.RAZORPAY_KEY_SECRET) {
  console.error('RAZORPAY_KEY_SECRET is not set in environment variables');
  process.exit(1);
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// console.log('Razorpay initialized with Key ID:', process.env.RAZORPAY_KEY_ID);

module.exports = razorpay;