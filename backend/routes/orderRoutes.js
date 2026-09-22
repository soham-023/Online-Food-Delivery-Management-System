const express = require('express');
const router = express.Router();
const { placeOrder, getMyOrders, getOrder, updateOrderStatus, getAllOrders, reorder } = require('../controllers/orderController');
const protect = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { validate, placeOrderRules, updateOrderStatusRules } = require('../middleware/validate');

router.use(protect);

router.post('/', placeOrderRules, validate, placeOrder);
router.get('/', getMyOrders);
router.get('/admin/all', roleGuard('admin', 'restaurant'), getAllOrders);
router.get('/:id', getOrder);
router.put('/:id/status', roleGuard('admin', 'restaurant'), updateOrderStatusRules, validate, updateOrderStatus);
router.post('/:id/reorder', reorder);

module.exports = router;
