const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyPayment } = require('../controllers/paymentController');
const protect = require('../middleware/auth');
const { validate, createPaymentRules, verifyPaymentRules } = require('../middleware/validate');

router.post('/create-order', protect, createPaymentRules, validate, createRazorpayOrder);
router.post('/verify', protect, verifyPaymentRules, validate, verifyPayment);
// NOTE: webhook route is registered directly in server.js with express.raw() for signature verification

module.exports = router;
