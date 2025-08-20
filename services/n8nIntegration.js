const axios = require('axios');

class N8NAutomation {
  constructor() {
    // REPLACE WITH YOUR N8N WEBHOOK URL
    this.webhookBase = process.env.N8N_WEBHOOK_URL || 'https://your-workspace.app.n8n.cloud/webhook';
  }

  async triggerOnboarding(userData) {
    try {
      const response = await axios.post(`${this.webhookBase}/onboarding`, {
        userId: userData.userId,
        email: userData.email,
        businessName: userData.businessName,
        businessType: userData.businessType,
        plan: userData.plan || 'free'
      });
      console.log('Onboarding workflow triggered:', response.data);
      return response.data;
    } catch (error) {
      console.error('N8N onboarding trigger error:', error.message);
      throw error;
    }
  }

  async triggerDailyAutomation(userId) {
    try {
      const response = await axios.post(`${this.webhookBase}/daily-automation`, { 
        userId,
        timestamp: new Date().toISOString()
      });
      console.log('Daily automation triggered for user:', userId);
      return response.data;
    } catch (error) {
      console.error('N8N daily automation error:', error.message);
      throw error;
    }
  }

  async triggerReviewCheck(businessData) {
    try {
      const response = await axios.post(`${this.webhookBase}/review-check`, {
        businessId: businessData.businessId,
        googlePlaceId: businessData.googlePlaceId,
        platforms: businessData.platforms || ['google'],
        lastCheck: businessData.lastCheck
      });
      console.log('Review check triggered');
      return response.data;
    } catch (error) {
      console.error('Review check error:', error.message);
      throw error;
    }
  }

  async triggerContentGeneration(requestData) {
    try {
      const response = await axios.post(`${this.webhookBase}/generate-content`, {
        userId: requestData.userId,
        contentType: requestData.contentType,
        businessInfo: requestData.businessInfo,
        platforms: requestData.platforms || ['facebook', 'instagram'],
        tone: requestData.tone || 'professional'
      });
      console.log('Content generation triggered');
      return response.data;
    } catch (error) {
      console.error('Content generation error:', error.message);
      throw error;
    }
  }

  async triggerEmailCampaign(campaignData) {
    try {
      const response = await axios.post(`${this.webhookBase}/email-campaign`, {
        userId: campaignData.userId,
        campaignName: campaignData.name,
        recipients: campaignData.recipients,
        template: campaignData.template,
        scheduledTime: campaignData.scheduledTime
      });
      console.log('Email campaign triggered');
      return response.data;
    } catch (error) {
      console.error('Email campaign error:', error.message);
      throw error;
    }
  }

  async triggerLinkedInPost(postData) {
    try {
      const response = await axios.post(`${this.webhookBase}/linkedin-post`, {
        userId: postData.userId,
        content: postData.content,
        businessInfo: postData.businessInfo,
        mediaUrls: postData.mediaUrls || [],
        scheduledTime: postData.scheduledTime || null
      });
      console.log('LinkedIn post triggered');
      return response.data;
    } catch (error) {
      console.error('LinkedIn post error:', error.message);
      throw error;
    }
  }

  async triggerTikTokPost(postData) {
    try {
      const response = await axios.post(`${this.webhookBase}/tiktok-post`, {
        userId: postData.userId,
        videoUrl: postData.videoUrl,
        caption: postData.caption,
        hashtags: postData.hashtags || [],
        scheduledTime: postData.scheduledTime || null
      });
      console.log('TikTok post triggered');
      return response.data;
    } catch (error) {
      console.error('TikTok post error:', error.message);
      throw error;
    }
  }

  async triggerThreadsPost(postData) {
    try {
      const response = await axios.post(`${this.webhookBase}/threads-post`, {
        userId: postData.userId,
        content: postData.content,
        mediaUrls: postData.mediaUrls || [],
        scheduledTime: postData.scheduledTime || null
      });
      console.log('Threads post triggered');
      return response.data;
    } catch (error) {
      console.error('Threads post error:', error.message);
      throw error;
    }
  }

  async triggerMultiPlatformPost(postData) {
    try {
      const response = await axios.post(`${this.webhookBase}/multi-platform-post`, {
        userId: postData.userId,
        content: postData.content,
        platforms: postData.platforms,
        mediaUrls: postData.mediaUrls || [],
        scheduledTime: postData.scheduledTime || null,
        platformSpecific: postData.platformSpecific || {}
      });
      console.log('Multi-platform post triggered for:', postData.platforms);
      return response.data;
    } catch (error) {
      console.error('Multi-platform post error:', error.message);
      throw error;
    }
  }
}

module.exports = N8NAutomation;
