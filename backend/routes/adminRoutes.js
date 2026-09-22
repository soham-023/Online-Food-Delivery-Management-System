const express = require('express');
const router = express.Router();
const { getDashboardStats, getAllUsers, toggleBlockUser } = require('../controllers/adminController');
const protect = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// Dashboard accessible by both admin and restaurant owners
router.get('/dashboard', protect, roleGuard('admin', 'restaurant'), getDashboardStats);

// User management — admin only
router.get('/users', protect, roleGuard('admin'), getAllUsers);
router.put('/users/:id/block', protect, roleGuard('admin'), toggleBlockUser);

module.exports = router;
