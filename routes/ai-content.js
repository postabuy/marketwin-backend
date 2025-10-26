const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const N8NAutomation = require('../services/n8nIntegration');

// Initialize N8N automation
const n8n = new N8NAutomation();

// POST /api/ai-content/generate
router.post('/generate', auth, async (req, res) => {
    try {
        // Get user from database
        const user = await User.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Check if user is on trial or has active subscription
        const trialEndDate = new Date(user.createdAt);
        trialEndDate.setDate(trialEndDate.getDate() + 7);
        const isTrialActive = new Date() < trialEndDate;
        
        if (!isTrialActive && user.subscription?.plan === 'free') {
            return res.status(403).json({
                success: false,
                error: 'Trial expired. Please upgrade to continue using AI features.',
                upgradeRequired: true
            });
        }

        // Get parameters from request
        const { 
            contentType,      // 'social', 'email', 'blog', 'review-response'
            businessContext,  // What the content is about
            tone,            // 'professional', 'casual', 'exciting', 'formal'
            platform         // 'instagram', 'facebook', 'twitter', 'linkedin', etc.
        } = req.body;

        // Validate required fields
        if (!contentType || !businessContext) {
            return res.status(400).json({
                success: false,
                error: 'Content type and business context are required'
            });
        }

        // Generate AI content through N8N
        const content = await n8n.generateAIContent({
            userId: user._id.toString(),
            businessName: user.businessName,
            businessType: user.businessType,
            contentType: contentType,
            businessContext: businessContext,
            tone: tone || 'professional',
            platform: platform || 'general'
        });

        // Update user's usage stats (if you're tracking)
        if (!user.usage) {
            user.usage = {};
        }
        user.usage.aiContentGenerated = (user.usage.aiContentGenerated || 0) + 1;
        user.usage.lastAIGeneration = new Date();
        await user.save();

        // Send successful response
        res.json({
            success: true,
            content: content.generatedContent || content,
            usage: {
                totalGenerated: user.usage.aiContentGenerated,
                isTrialUser: isTrialActive,
                daysRemaining: isTrialActive ? Math.ceil((trialEndDate - new Date()) / (1000 * 60 * 60 * 24)) : 0
            }
        });

    } catch (error) {
        console.error('AI content generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate content. Please try again.'
        });
    }
});

// GET /api/ai-content/history
router.get('/history', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // For now, return mock history
        // Later, you'll fetch from MongoDB activities collection
        const history = [
            {
                id: 1,
                contentType: 'social',
                platform: 'instagram',
                content: 'Previous generated content example...',
                createdAt: new Date(Date.now() - 86400000)
            }
        ];

        res.json({
            success: true,
            history: history
        });

    } catch (error) {
        console.error('History fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch history'
        });
    }
});

// POST /api/ai-content/templates
router.get('/templates', auth, async (req, res) => {
    try {
        // Return content templates
        const templates = [
            {
                id: 'social-promo',
                name: 'Social Media Promotion',
                description: 'Promote a special offer or event',
                contentType: 'social',
                prompts: [
                    'What are you promoting?',
                    'What\'s the special offer?',
                    'When does it end?'
                ]
            },
            {
                id: 'email-welcome',
                name: 'Welcome Email',
                description: 'Welcome new customers',
                contentType: 'email',
                prompts: [
                    'What\'s your welcome offer?',
                    'What makes your business special?'
                ]
            },
            {
                id: 'review-response',
                name: 'Review Response',
                description: 'Respond to customer reviews',
                contentType: 'review-response',
                prompts: [
                    'What\'s the review rating?',
                    'What did they say?',
                    'Any specific issues to address?'
                ]
            },
            {
                id: 'blog-post',
                name: 'Blog Post',
                description: 'Create a blog post for your website',
                contentType: 'blog',
                prompts: [
                    'What\'s the topic?',
                    'Who\'s your target audience?',
                    'What\'s the main message?'
                ]
            }
        ];

        res.json({
            success: true,
            templates: templates
        });

    } catch (error) {
        console.error('Templates fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch templates'
        });
    }
});

// POST /api/ai-content/improve
router.post('/improve', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        const { originalContent, improvementType } = req.body;

        // Improve content through N8N
        const improvedContent = await n8n.generateAIContent({
            userId: user._id.toString(),
            businessName: user.businessName,
            businessType: user.businessType,
            contentType: 'improve',
            businessContext: `Improve this content: ${originalContent}. Make it more ${improvementType}`,
            tone: improvementType,
            platform: 'general'
        });

        res.json({
            success: true,
            originalContent: originalContent,
            improvedContent: improvedContent.generatedContent || improvedContent
        });

    } catch (error) {
        console.error('Content improvement error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to improve content'
        });
    }
});

module.exports = router;
