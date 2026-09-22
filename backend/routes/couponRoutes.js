const express = require('express');
const router = express.Router();
const { applyCoupon, getActiveCoupons, createCoupon, updateCoupon, deleteCoupon } = require('../controllers/couponController');
const protect = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { validate, applyCouponRules, createCouponRules } = require('../middleware/validate');

router.get('/', getActiveCoupons);
router.post('/apply', protect, applyCouponRules, validate, applyCoupon);
router.post('/', protect, roleGuard('admin'), createCouponRules, validate, createCoupon);
router.put('/:id', protect, roleGuard('admin'), updateCoupon);
router.delete('/:id', protect, roleGuard('admin'), deleteCoupon);

module.exports = router;
