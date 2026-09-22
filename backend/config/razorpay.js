const Razorpay = require('razorpay');


const isConfigured = process.env.RAZORPAY_KEY_ID
  && process.env.RAZORPAY_KEY_SECRET
  && !process.env.RAZORPAY_KEY_ID.includes('XXXXXXXXXX')
  && !process.env.RAZORPAY_KEY_SECRET.includes('XXXXXXXXXXXXXXXX');

let razorpayInstance;

if (isConfigured) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log('💳 Razorpay: Configured with real keys');
} else {

  razorpayInstance = {
    orders: {
      create: () => { throw new Error('Razorpay not configured'); },
    },
  };
  console.log('💳 Razorpay: Not configured — using demo payment mode');
}

module.exports = razorpayInstance;
