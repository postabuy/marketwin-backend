const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// @route   GET /api/features/gmb
router.get('/gmb', protect, async (req, res) => {
  res.json({
    success: true,
    connected: false,
    metrics: {
      views: 0,
      clicks: 0,
      calls: 0
    }
  });
});

// @route   GET /api/features/social
router.get('/social', protect, async (req, res) => {
  res.json({
    success: true,
    connected: []
  });
});

// @route   GET /api/features/reviews
router.get('/reviews', protect, async (req, res) => {
  res.json({
    success: true,
    totalReviews: 248,
    averageRating: 4.8,
    responseRate: '95%',
    recentReviews: []
  });
});

// @route   GET /api/features/email/stats
router.get('/email/stats', protect, async (req, res) => {
  res.json({
    success: true,
    subscribers: 1245,
    openRate: '32%',
    clickRate: '12%'
  });
});

module.exports = router;