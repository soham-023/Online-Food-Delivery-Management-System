const { Coupon, Sequelize: { Op } } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { calculateCouponDiscount } = require('../utils/couponPricing');


exports.applyCoupon = asyncHandler(async (req, res) => {
  const { code, orderTotal } = req.body;
  

  const coupon = await Coupon.findOne({ where: { code: code.toUpperCase(), isActive: true } });

  if (!coupon) {
    throw new ApiError(404, 'Invalid or expired coupon code');
  }

  if (new Date(coupon.expiresAt) < new Date()) {
    throw new ApiError(400, 'Coupon has expired');
    
  }

  if (coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, 'Coupon usage limit reached');
    
  }

  if (orderTotal < coupon.minOrder) {
    throw new ApiError(400, `Minimum order amount is ₹${coupon.minOrder}`);
    
  }

  const discount = calculateCouponDiscount(coupon, orderTotal);

  res.json({
    success: true,
    data: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount,
      description: coupon.description,
    },
  });
});


exports.getActiveCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.findAll({
    where: {
      isActive: true,
      expiresAt: { [Op.gte]: new Date() },
    },
    attributes: ['code', 'discountType', 'discountValue', 'minOrder', 'maxDiscount', 'description', 'expiresAt']
  });

  res.json({ success: true, data: coupons });
});


exports.createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, data: coupon });
});


exports.updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByPk(req.params.id);
  if (!coupon) {
    throw new ApiError(404, 'Coupon not found');
  }
  await coupon.update(req.body);
  res.json({ success: true, data: coupon });
});


exports.deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByPk(req.params.id);
  if (coupon) {
    await coupon.destroy();
  }
  res.json({ success: true, message: 'Coupon deleted' });
});
