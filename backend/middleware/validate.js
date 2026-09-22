const { body, validationResult } = require('express-validator');


const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array().map((e) => e.msg).join(', '),
      errors: errors.array(),
    });
  }
  next();
};


const signupRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['customer', 'restaurant', 'admin']).withMessage('Invalid role'),
];

const loginRules = [
  body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const updateProfileRules = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').optional().trim().isEmail().withMessage('Invalid email').normalizeEmail(),
  body('phone').optional().trim().isMobilePhone('any').withMessage('Invalid phone number'),
];

const updatePasswordRules = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

const addressRules = [
  body('street').trim().notEmpty().withMessage('Street is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('pincode').trim().notEmpty().withMessage('Pincode is required').isLength({ min: 5, max: 6 }).withMessage('Invalid pincode'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
];

const placeOrderRules = [
  body('deliveryAddress').notEmpty().withMessage('Delivery address is required'),
  body('deliveryAddress.street').trim().notEmpty().withMessage('Street is required'),
  body('deliveryAddress.city').trim().notEmpty().withMessage('City is required'),
  body('paymentMethod').isIn(['razorpay', 'cod']).withMessage('Invalid payment method'),
  body('scheduledFor').optional({ nullable: true }).isISO8601().withMessage('Invalid scheduled date format'),
  body('isScheduled').optional().isBoolean().withMessage('isScheduled must be a boolean'),
];

const updateOrderStatusRules = [
  body('status').isIn(['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled']).withMessage('Invalid order status'),
];

const reviewRules = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment must be under 500 characters'),
];

const applyCouponRules = [
  body('code').trim().notEmpty().withMessage('Coupon code is required'),
  body('orderTotal').isNumeric().withMessage('Order total must be a number'),
];

const createCouponRules = [
  body('code').trim().notEmpty().withMessage('Coupon code is required'),
  body('discountType').isIn(['percentage', 'flat']).withMessage('Invalid discount type'),
  body('discountValue').isNumeric().withMessage('Discount value must be a number'),
  body('expiresAt').isISO8601().withMessage('Invalid expiry date'),
];

const addToCartRules = [
  body('menuItemId').notEmpty().withMessage('Menu item ID is required').isUUID(4).withMessage('Invalid menu item ID'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

const createPaymentRules = [
  body('orderId').notEmpty().withMessage('Order ID is required').isUUID(4).withMessage('Invalid order ID'),
];

const verifyPaymentRules = [
  body('razorpayOrderId').notEmpty().withMessage('Razorpay order ID is required'),
  body('razorpayPaymentId').notEmpty().withMessage('Razorpay payment ID is required'),
  body('razorpaySignature').notEmpty().withMessage('Razorpay signature is required'),
  body('orderId').notEmpty().withMessage('Order ID is required'),
];

module.exports = {
  validate,
  signupRules,
  loginRules,
  updateProfileRules,
  updatePasswordRules,
  addressRules,
  placeOrderRules,
  updateOrderStatusRules,
  reviewRules,
  applyCouponRules,
  createCouponRules,
  addToCartRules,
  createPaymentRules,
  verifyPaymentRules,
};
