const express = require('express');
const router = express.Router();
const { createReview, getRestaurantReviews, getFoodReviews, deleteReview } = require('../controllers/reviewController');
const protect = require('../middleware/auth');
const { validate, reviewRules } = require('../middleware/validate');

router.post('/', protect, reviewRules, validate, createReview);
router.get('/restaurant/:id', getRestaurantReviews);
router.get('/food/:id', getFoodReviews);
router.delete('/:id', protect, deleteReview);

module.exports = router;
