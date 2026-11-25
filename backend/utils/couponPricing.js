function calculateCouponDiscount(coupon, orderTotal) {
  let discount = coupon.discountType === 'percentage'
    ? Math.round((orderTotal * coupon.discountValue) / 100)
    : coupon.discountValue;

  if (coupon.discountType === 'percentage' && coupon.maxDiscount > 0) {
    discount = Math.min(discount, coupon.maxDiscount);
  }

  return Math.min(Math.max(0, discount), orderTotal);
}

module.exports = { calculateCouponDiscount };
