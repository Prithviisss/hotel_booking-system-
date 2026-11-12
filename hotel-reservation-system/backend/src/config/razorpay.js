const Razorpay = require('razorpay');

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

let razorpayInstance = null;

// Only instantiate real Razorpay if genuine live/test keys are supplied
const isRealKey = Boolean(
  keyId &&
  keySecret &&
  keyId !== 'mock' &&
  keySecret !== 'mock' &&
  keyId !== 'rzp_test_placeholder' &&
  keySecret !== 'secret_placeholder' &&
  keyId.startsWith('rzp_')
);

if (isRealKey) {
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
  console.log('ℹ️ Mock Payment Mode is active. Razorpay API skipped.');
}

module.exports = {
  razorpayInstance,
  isMockMode: !isRealKey || !razorpayInstance,
  razorpayKeyId: keyId || 'rzp_test_mock_team6'
};
