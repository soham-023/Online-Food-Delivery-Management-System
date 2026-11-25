const DEFAULT_GST_RATE = 0.05;

function calculateOrderTotals({ itemsPrice, deliveryCharge, discount = 0, gstRate = DEFAULT_GST_RATE }) {
  const subtotal = Math.max(0, Number(itemsPrice) || 0);
  const delivery = Math.max(0, Number(deliveryCharge) || 0);
  const discountAmount = Math.min(subtotal, Math.max(0, Number(discount) || 0));
  const taxPrice = Math.round(subtotal * gstRate);

  return {
    itemsPrice: subtotal,
    taxPrice,
    deliveryCharge: delivery,
    discount: discountAmount,
    totalPrice: subtotal + taxPrice + delivery - discountAmount,
  };
}

module.exports = { calculateOrderTotals };
