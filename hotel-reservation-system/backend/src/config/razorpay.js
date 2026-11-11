const Razorpay = require('razorpay');

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

let razorpayInstance = null;

if (keyId && keySecret && keyId !== 'rzp_test_placeholder' && keySecret !== 'secret_placeholder') {
  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
    console.log('✅ Razorpay instance initialized with Test credentials');
  } catch (err) {
    console.warn('⚠️ Razorpay initialization failed:', err.message);
  }
} else {
  console.log('ℹ️ Razorpay credentials not configured or placeholder detected. Mock Payment Mode is active.');
}

module.exports = {
  razorpayInstance,
  isMockMode: !razorpayInstance,
  razorpayKeyId: keyId || 'rzp_test_mock_team6'
};

