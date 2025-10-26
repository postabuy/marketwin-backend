const axios = require('axios');

class N8NAutomation {
  constructor() {
    // Your N8N webhook URL - fixed the quotes issue
    this.webhookBase = process.env.N8N_WEBHOOK_URL || 'https://marketwin.app.n8n.cloud/webhook';
  }

  // ============= EXISTING METHODS (KEPT AS-IS) =============
  
  async triggerOnboarding(userData) {
    try {
      const response = await axios.post(`${this.webhookBase}/onboarding`, {
        userId: userData.userId,
        email: userData.email,
        businessName: userData.businessName,
        businessType: userData.businessType,
        plan: userData.plan || 'trial'  // Changed default from 'free' to 'trial'
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

  // ============= NEW METHODS FOR 7-DAY TRIAL FEATURES =============

  // AI Content Generation (enhanced version of existing)
  async generateAIContent(data) {
    try {
      const response = await axios.post(`${this.webhookBase}/ai-content`, {
        userId: data.userId,
        businessName: data.businessName,
        businessType: data.businessType,
        contentType: data.contentType,  // social, email, blog, review-response
        businessContext: data.businessContext,
        tone: data.tone || 'professional',
        platform: data.platform || 'general',
        length: data.length || 'medium'
      });
      console.log('AI content generation triggered');
      return response.data;
    } catch (error) {
      console.error('AI content generation error:', error.message);
      throw error;
    }
  }

  // Social Media Posting (unified method)
  async postToSocial(data) {
    try {
      const response = await axios.post(`${this.webhookBase}/social-post`, {
        userId: data.userId,
        content: data.content,
        platforms: data.platforms,  // ['facebook', 'instagram', 'twitter', etc.]
        mediaUrls: data.mediaUrls || [],
        hashtags: data.hashtags || [],
        scheduleTime: data.scheduleTime || null,
        autoGenerate: data.autoGenerate || false  // Let N8N generate content if needed
      });
      console.log('Social post triggered for platforms:', data.platforms);
      return response.data;
    } catch (error) {
      console.error('Social posting error:', error.message);
      throw error;
    }
  }

  // Email Campaign (enhanced version)
  async sendEmailCampaign(data) {
    try {
      const response = await axios.post(`${this.webhookBase}/email-campaign-enhanced`, {
        userId: data.userId,
        campaignName: data.campaignName,
        subject: data.subject,
        content: data.content,
        recipients: data.recipients,
        templateId: data.templateId || null,
        personalize: data.personalize || false,
        scheduleTime: data.scheduleTime || null,
        trackingEnabled: data.trackingEnabled || true
      });
      console.log('Enhanced email campaign triggered');
      return response.data;
    } catch (error) {
      console.error('Email campaign error:', error.message);
      throw error;
    }
  }

  // Review Response with AI
  async respondToReview(data) {
    try {
      const response = await axios.post(`${this.webhookBase}/review-response`, {
        userId: data.userId,
        reviewId: data.reviewId,
        reviewText: data.reviewText,
        reviewRating: data.reviewRating,
        platform: data.platform,  // google, yelp, facebook, etc.
        useAI: data.useAI || true,
        suggestedResponse: data.suggestedResponse || null,
        businessName: data.businessName,
        tone: data.tone || 'professional'
      });
      console.log('Review response triggered');
      return response.data;
    } catch (error) {
      console.error('Review response error:', error.message);
      throw error;
    }
  }

  // Analytics Data Collection
  async trackAnalytics(data) {
    try {
      const response = await axios.post(`${this.webhookBase}/analytics-track`, {
        userId: data.userId,
        eventType: data.eventType,  // pageview, conversion, signup, etc.
        eventData: data.eventData,
        timestamp: data.timestamp || new Date().toISOString(),
        source: data.source || 'website',
        metadata: data.metadata || {}
      });
      console.log('Analytics tracked:', data.eventType);
      return response.data;
    } catch (error) {
      console.error('Analytics tracking error:', error.message);
      throw error;
    }
  }

  // Get Analytics Report
  async getAnalyticsReport(data) {
    try {
      const response = await axios.post(`${this.webhookBase}/analytics-report`, {
        userId: data.userId,
        startDate: data.startDate,
        endDate: data.endDate,
        metrics: data.metrics || ['views', 'engagement', 'conversions'],
        groupBy: data.groupBy || 'day'
      });
      console.log('Analytics report requested');
      return response.data;
    } catch (error) {
      console.error('Analytics report error:', error.message);
      throw error;
    }
  }

  // SEO Audit
  async performSEOAudit(data) {
    try {
      const response = await axios.post(`${this.webhookBase}/seo-audit`, {
        userId: data.userId,
        businessName: data.businessName,
        website: data.website || null,
        googleBusinessProfile: data.googleBusinessProfile || null,
        competitors: data.competitors || [],
        auditType: data.auditType || 'basic'  // basic, detailed, competitive
      });
      console.log('SEO audit triggered');
      return response.data;
    } catch (error) {
      console.error('SEO audit error:', error.message);
      throw error;
    }
  }

  // Local SEO Optimization
  async optimizeLocalSEO(data) {
    try {
      const response = await axios.post(`${this.webhookBase}/local-seo-optimize`, {
        userId: data.userId,
        optimizationType: data.optimizationType,  // keywords, gmb, citations
        businessInfo: data.businessInfo,
        targetKeywords: data.targetKeywords || [],
        locations: data.locations || []
      });
      console.log('Local SEO optimization triggered');
      return response.data;
    } catch (error) {
      console.error('Local SEO optimization error:', error.message);
      throw error;
    }
  }

  // Trial Status Check
  async checkTrialStatus(userId) {
    try {
      const response = await axios.post(`${this.webhookBase}/trial-status`, {
        userId: userId,
        checkType: 'status'
      });
      console.log('Trial status checked for user:', userId);
      return response.data;
    } catch (error) {
      console.error('Trial status check error:', error.message);
      throw error;
    }
  }

  // Trial Expiry Notification
  async sendTrialExpiryNotification(data) {
    try {
      const response = await axios.post(`${this.webhookBase}/trial-expiry`, {
        userId: data.userId,
        daysRemaining: data.daysRemaining,
        email: data.email,
        businessName: data.businessName
      });
      console.log('Trial expiry notification sent');
      return response.data;
    } catch (error) {
      console.error('Trial expiry notification error:', error.message);
      throw error;
    }
  }

  // Bulk Operations
  async bulkOperation(data) {
    try {
      const response = await axios.post(`${this.webhookBase}/bulk-operation`, {
        userId: data.userId,
        operationType: data.operationType,  // bulk-email, bulk-social, bulk-content
        operations: data.operations,
        schedule: data.schedule || null
      });
      console.log('Bulk operation triggered:', data.operationType);
      return response.data;
    } catch (error) {
      console.error('Bulk operation error:', error.message);
      throw error;
    }
  }

  // Generic Webhook Trigger (for flexibility)
  async triggerWorkflow(workflow, data) {
    try {
      const response = await axios.post(`${this.webhookBase}/${workflow}`, data);
      console.log(`Workflow ${workflow} triggered`);
      return response.data;
    } catch (error) {
      console.error(`Workflow ${workflow} error:`, error.message);
      throw error;
    }
  }

  // ============= UTILITY METHODS =============

  // Test N8N Connection
  async testConnection() {
    try {
      const response = await axios.post(`${this.webhookBase}/test`, {
        timestamp: new Date().toISOString(),
        message: 'Testing N8N connection'
      });
      console.log('N8N connection test successful');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('N8N connection test failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Get Workflow Status
  async getWorkflowStatus(workflowId) {
    try {
      const response = await axios.post(`${this.webhookBase}/workflow-status`, {
        workflowId: workflowId
      });
      return response.data;
    } catch (error) {
      console.error('Get workflow status error:', error.message);
      throw error;
    }
  }
}

module.exports = N8NAutomation;
