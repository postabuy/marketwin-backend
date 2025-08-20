const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// ADD N8N INTEGRATION
const N8NAutomation = require('../services/n8nIntegration');
const n8n = new N8NAutomation();

// ============ EXISTING ENDPOINTS (Keep these) ============

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

// ============ NEW N8N INTEGRATED ENDPOINTS ============

// @route   POST /api/features/generate-content
// @desc    Generate AI content for social media
router.post('/generate-content', protect, async (req, res) => {
  try {
    const { contentType, tone, platforms } = req.body;
    
    // Get user to check plan limits
    const user = await User.findById(req.user.id);
    
    // Check if user can use AI content feature based on plan
    if (!user.canUseFeature('aiContent')) {
      return res.status(403).json({ 
        success: false,
        error: 'AI content limit reached for your plan. Please upgrade.' 
      });
    }
    
    // Trigger N8N workflow
    const result = await n8n.triggerContentGeneration({
      userId: req.user.id,
      contentType,
      businessInfo: {
        name: user.businessName,
        type: user.businessType || 'other',
        description: user.businessDescription || ''
      },
      platforms: platforms || ['facebook', 'instagram'],
      tone: tone || 'professional'
    });
    
    // Update usage counter
    await user.incrementUsage('aiContent');
    
    res.json({ 
      success: true, 
      content: result,
      remainingCredits: user.getRemainingCredits('aiContent')
    });
  } catch (error) {
    console.error('Content generation error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to generate content' 
    });
  }
});

// @route   POST /api/features/multi-platform-post
// @desc    Post to multiple social platforms
router.post('/multi-platform-post', protect, async (req, res) => {
  try {
    const { content, platforms, mediaUrls, scheduledTime } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user.canUseFeature('socialPosts')) {
      return res.status(403).json({ 
        success: false,
        error: 'Social post limit reached. Please upgrade.' 
      });
    }
    
    // Platform-specific content adjustments
    const platformSpecific = {
      twitter: content.substring(0, 280),
      linkedin: {
        content: content,
        visibility: 'PUBLIC'
      },
      tiktok: {
        caption: content.substring(0, 150),
        hashtags: extractHashtags(content)
      },
      threads: {
        content: content.substring(0, 500),
        hashtags: extractHashtags(content)
      },
      facebook: content,
      instagram: {
        caption: content,
        hashtags: extractHashtags(content)
      }
    };
    
    // Trigger N8N workflow
    const result = await n8n.triggerMultiPlatformPost({
      userId: req.user.id,
      content,
      platforms,
      mediaUrls,
      scheduledTime,
      platformSpecific
    });
    
    await user.incrementUsage('socialPosts');
    
    res.json({ 
      success: true, 
      posts: result,
      remainingPosts: user.getRemainingCredits('socialPosts')
    });
  } catch (error) {
    console.error('Multi-platform post error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to post to platforms' 
    });
  }
});

// @route   POST /api/features/linkedin-post
// @desc    Post specifically to LinkedIn
router.post('/linkedin-post', protect, async (req, res) => {
  try {
    const { content, mediaUrls, scheduledTime } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user.canUseFeature('socialPosts')) {
      return res.status(403).json({ 
        success: false,
        error: 'Social post limit reached. Please upgrade.' 
      });
    }
    
    if (!user.linkedinConnected) {
      return res.status(400).json({ 
        success: false,
        error: 'LinkedIn account not connected. Please connect your LinkedIn account first.' 
      });
    }
    
    const result = await n8n.triggerLinkedInPost({
      userId: req.user.id,
      content,
      businessInfo: {
        name: user.businessName,
        type: user.businessType
      },
      mediaUrls,
      scheduledTime
    });
    
    await user.incrementUsage('socialPosts');
    
    res.json({ 
      success: true, 
      post: result,
      remainingPosts: user.getRemainingCredits('socialPosts')
    });
  } catch (error) {
    console.error('LinkedIn post error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to post to LinkedIn' 
    });
  }
});

// @route   POST /api/features/tiktok-post
// @desc    Post video to TikTok
router.post('/tiktok-post', protect, async (req, res) => {
  try {
    const { videoUrl, caption, hashtags, scheduledTime } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user.canUseFeature('socialPosts')) {
      return res.status(403).json({ 
        success: false,
        error: 'Social post limit reached. Please upgrade.' 
      });
    }
    
    if (!user.tiktokConnected) {
      return res.status(400).json({ 
        success: false,
        error: 'TikTok account not connected. Please connect your TikTok account first.' 
      });
    }
    
    const result = await n8n.triggerTikTokPost({
      userId: req.user.id,
      videoUrl,
      caption,
      hashtags: hashtags || extractHashtags(caption),
      scheduledTime
    });
    
    await user.incrementUsage('socialPosts');
    
    res.json({ 
      success: true, 
      post: result,
      remainingPosts: user.getRemainingCredits('socialPosts')
    });
  } catch (error) {
    console.error('TikTok post error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to post to TikTok' 
    });
  }
});

// @route   POST /api/features/threads-post
// @desc    Post specifically to Threads
router.post('/threads-post', protect, async (req, res) => {
  try {
    const { content, mediaUrls, scheduledTime } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user.canUseFeature('socialPosts')) {
      return res.status(403).json({ 
        success: false,
        error: 'Social post limit reached. Please upgrade.' 
      });
    }
    
    if (!user.threadsConnected) {
      return res.status(400).json({ 
        success: false,
        error: 'Threads account not connected. Please connect your Threads account first.' 
      });
    }
    
    const result = await n8n.triggerThreadsPost({
      userId: req.user.id,
      content,
      mediaUrls,
      scheduledTime
    });
    
    await user.incrementUsage('socialPosts');
    
    res.json({ 
      success: true, 
      post: result,
      remainingPosts: user.getRemainingCredits('socialPosts')
    });
  } catch (error) {
    console.error('Threads post error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to post to Threads' 
    });
  }
});

// @route   POST /api/features/email-campaign
// @desc    Create and send email campaign
router.post('/email-campaign', protect, async (req, res) => {
  try {
    const { name, recipients, template, scheduledTime } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user.canUseFeature('emailCampaigns')) {
      return res.status(403).json({ 
        success: false,
        error: 'Email campaign limit reached. Please upgrade.' 
      });
    }
    
    const result = await n8n.triggerEmailCampaign({
      userId: req.user.id,
      name,
      recipients,
      template,
      scheduledTime
    });
    
    await user.incrementUsage('emailCampaigns');
    
    res.json({ 
      success: true, 
      campaign: result,
      remainingCampaigns: user.getRemainingCredits('emailCampaigns')
    });
  } catch (error) {
    console.error('Email campaign error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create campaign' 
    });
  }
});

// @route   POST /api/features/check-reviews
// @desc    Check for new reviews across platforms
router.post('/check-reviews', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.googlePlaceId) {
      return res.status(400).json({ 
        success: false,
        error: 'Google Place ID not configured. Please set up your business listing first.' 
      });
    }
    
    const result = await n8n.triggerReviewCheck({
      businessId: req.user.id,
      googlePlaceId: user.googlePlaceId,
      platforms: user.connectedPlatforms || ['google'],
      lastCheck: user.lastReviewCheck
    });
    
    // Update last check time
    user.lastReviewCheck = new Date();
    await user.save();
    
    res.json({ 
      success: true, 
      reviews: result 
    });
  } catch (error) {
    console.error('Review check error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to check reviews' 
    });
  }
});

// ============ HELPER FUNCTIONS ============

// Extract hashtags from text
function extractHashtags(text) {
  if (!text) return [];
  const hashtags = text.match(/#[a-zA-Z0-9_]+/g) || [];
  return hashtags.map(tag => tag.substring(1));
}

module.exports = router;
