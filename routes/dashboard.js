const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// GET /api/dashboard/stats
router.get('/stats', auth, async (req, res) => {
    try {
        // Get user data
        const user = await User.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Define plan limits
        const planLimits = {
            free: { 
                posts: 10, 
                emails: 100,
                campaigns: 1 
            },
            starter: { 
                posts: 50, 
                emails: 1000,
                campaigns: 5 
            },
            professional: { 
                posts: -1,  // unlimited
                emails: -1,
                campaigns: -1 
            },
            enterprise: { 
                posts: -1, 
                emails: -1,
                campaigns: -1 
            }
        };

        // For now, return placeholder data
        // Later, you'll query real data from MongoDB
        const stats = {
            leads: Math.floor(Math.random() * 100),  // Random for testing
            posts: Math.floor(Math.random() * 20),
            emails: Math.floor(Math.random() * 50),
            rating: (4 + Math.random()).toFixed(1),  // 4.0 - 5.0 rating
            campaigns: 0,
            reviews: 0
        };

        res.json({
            success: true,
            stats: stats,
            limits: planLimits[user.subscription?.plan || 'free'],
            user: {
                plan: user.subscription?.plan || 'free',
                businessName: user.businessName,
                businessType: user.businessType
            }
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to load dashboard data' 
        });
    }
});

// GET /api/dashboard/activity
router.get('/activity', auth, async (req, res) => {
    try {
        // Placeholder for recent activity
        const recentActivity = [
            { type: 'email', message: 'Welcome email sent', date: new Date() },
            { type: 'account', message: 'Account created', date: new Date() }
        ];

        res.json({
            success: true,
            activities: recentActivity
        });

    } catch (error) {
        console.error('Activity error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to load activity' 
        });
    }
});

// GET /api/dashboard/campaigns
router.get('/campaigns', auth, async (req, res) => {
    try {
        // Placeholder for campaigns
        res.json({
            success: true,
            campaigns: [],
            message: 'No campaigns yet. Create your first campaign!'
        });

    } catch (error) {
        console.error('Campaigns error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to load campaigns' 
        });
    }
});

module.exports = router;
