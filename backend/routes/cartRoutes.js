const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controllers/cartController');
const protect = require('../middleware/auth');
const { validate, addToCartRules } = require('../middleware/validate');

router.use(protect);

router.get('/', getCart);
router.post('/', addToCartRules, validate, addToCart);
router.put('/:itemId', updateCartItem);
router.delete('/:itemId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;
