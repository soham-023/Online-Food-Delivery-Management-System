const crypto = require('crypto');
const { Order } = require('../models');
const razorpay = require('../config/razorpay');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');


exports.createRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  const order = await Order.findByPk(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.userId !== req.user.id) {
    throw new ApiError(403, 'Not authorized to create payment for this order');
  }

  const isRazorpayConfigured = process.env.RAZORPAY_KEY_ID
    && process.env.RAZORPAY_KEY_SECRET
    && !process.env.RAZORPAY_KEY_ID.includes('XXXXXXXXXX')
    && !process.env.RAZORPAY_KEY_SECRET.includes('XXXXXXXXXXXXXXXX');

  if (!isRazorpayConfigured) {
    await order.update({
      paymentStatus: 'paid',
      razorpayOrderId: `demo_order_${Date.now()}`,
      razorpayPaymentId: `demo_pay_${Date.now()}`
    });

    return res.json({
      success: true,
      data: {
        razorpayOrderId: order.razorpayOrderId,
        amount: Math.round(order.totalPrice * 100),
        currency: 'INR',
        keyId: 'demo_mode',
        demo: true,
      },
      message: 'Razorpay not configured — payment simulated as successful',
    });
  }

  try {
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(order.totalPrice * 100), 
      currency: 'INR',
      receipt: `order_${order.id}`,
      notes: {
        orderId: order.id,
        userId: req.user.id,
      },
    });

    await order.update({ razorpayOrderId: razorpayOrder.id });

    res.json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error('❌ Razorpay order creation error:', error.message);
    throw new ApiError(500, 'Failed to create payment order. Please try again or use Cash on Delivery.');
  }
});


exports.verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

  const order = await Order.findByPk(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.userId !== req.user.id) {
    throw new ApiError(403, 'Not authorized');
  }

  if (razorpayOrderId && razorpayOrderId.startsWith('demo_')) {
    await order.update({
      paymentStatus: 'paid',
      razorpayPaymentId: razorpayPaymentId || `demo_pay_${Date.now()}`
    });

    return res.json({
      success: true,
      message: 'Payment verified (demo mode)',
      data: { orderId: order.id, paymentStatus: order.paymentStatus },
    });
  }

  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    await order.update({ paymentStatus: 'failed' });
    throw new ApiError(400, 'Payment verification failed');
  }

  await order.update({
    paymentStatus: 'paid',
    razorpayPaymentId: razorpayPaymentId,
    razorpaySignature: razorpaySignature
  });

  const io = req.app.get('io');
  if (io) {
    io.to(`order_${order.id}`).emit('paymentVerified', {
      orderId: order.id,
      paymentStatus: 'paid',
    });
  }

  res.json({
    success: true,
    message: 'Payment verified successfully',
    data: { orderId: order.id, paymentStatus: order.paymentStatus },
  });
});


exports.razorpayWebhook = asyncHandler(async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  if (!signature) {
    throw new ApiError(400, 'Missing webhook signature');
  }

  const rawBody = req.rawBody || req.body;
  const bodyStr = typeof rawBody === 'string' ? rawBody : (Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : JSON.stringify(rawBody));

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(bodyStr)
    .digest('hex');

  if (signature !== expectedSignature) {
    throw new ApiError(400, 'Webhook signature verification failed');
  }

  const payload = typeof rawBody === 'object' && !Buffer.isBuffer(rawBody) ? rawBody : JSON.parse(bodyStr);

  const event = payload.event;
  const payment = payload.payload?.payment?.entity;

  if (!payment) {
    return res.json({ success: true, message: 'No payment entity in webhook' });
  }

  if (event === 'payment.captured') {
    const order = await Order.findOne({ where: { razorpayOrderId: payment.order_id } });
    if (order) {
      await order.update({ paymentStatus: 'paid', razorpayPaymentId: payment.id });
    }
  } else if (event === 'payment.failed') {
    const order = await Order.findOne({ where: { razorpayOrderId: payment.order_id } });
    if (order) {
      await order.update({ paymentStatus: 'failed' });
    }
  }

  res.json({ success: true });
});
