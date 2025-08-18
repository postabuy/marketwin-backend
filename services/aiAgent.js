// services/aiAgent.js
const axios = require('axios');
const User = require('../models/User');
const Campaign = require('../models/Campaign');

class AIMarketingAgent {
  constructor(userId) {
    this.userId = userId;
    this.openaiApiKey = process.env.OPENAI_API_KEY;
  }

  // Analyze business and create marketing strategy
  async analyzeBusinessAndCreateStrategy(businessData) {
    try {
      const prompt = `
        As a marketing expert, analyze this business and create a comprehensive marketing strategy:
        
        Business: ${businessData.businessName}
        Industry: ${businessData.businessType}
        Target Audience: ${JSON.stringify(businessData.targetAudience)}
        Budget: $${businessData.monthlyBudget}/month
        Goals: ${businessData.businessGoals.join(', ')}
        Challenges: ${businessData.currentChallenges.join(', ')}
        
        Provide a detailed marketing strategy including:
        1. Key messaging and value propositions
        2. Best social media platforms to focus on
        3. Content calendar recommendations
        4. Optimal posting times
        5. Campaign ideas
        6. Expected ROI
        
        Format as JSON.
      `;

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an expert marketing strategist specializing in local businesses.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const strategy = JSON.parse(response.data.choices[0].message.content);
      
      // Save strategy to user profile
      await User.findByIdAndUpdate(this.userId, {
        'aiAgent.strategy': strategy,
        'aiAgent.strategyCreatedAt': new Date()
      });

      return strategy;
    } catch (error) {
      console.error('AI Strategy Generation Error:', error);
      throw error;
    }
  }

  // Generate social media content
  async generateSocialContent(platform, context) {
    try {
      const user = await User.findById(this.userId);
      const strategy = user.aiAgent.strategy;

      const prompt = `
        Create a ${platform} post for:
        Business: ${user.businessName}
        Industry: ${user.businessType}
        Tone: ${user.aiAgent.tone || 'professional'}
        
        Context: ${context || 'Regular promotional post'}
        Key Message: ${strategy?.keyMessaging || 'Promote our services'}
        
        Requirements:
        - Optimal length for ${platform}
        - Include relevant hashtags (${user.aiAgent.contentPreferences.hashtagCount || 3})
        - ${user.aiAgent.contentPreferences.includeEmojis ? 'Include emojis' : 'No emojis'}
        - Include a call to action
        
        Return as JSON with fields: content, hashtags[], callToAction
      `;

      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: `You are a social media expert specializing in ${platform} marketing.` },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 500
      }, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('Content Generation Error:', error);
      throw error;
    }
  }

  // Auto-post to social media
  async autoPostToSocial(platform, content) {
    const user = await User.findById(this.userId);
    
    switch(platform) {
      case 'facebook':
        return await this.postToFacebook(user, content);
      case 'instagram':
        return await this.postToInstagram(user, content);
      case 'twitter':
        return await this.postToTwitter(user, content);
      default:
        throw new Error('Platform not supported');
    }
  }

  async postToFacebook(user, content) {
    if (!user.integrations.facebook.connected) {
      throw new Error('Facebook not connected');
    }

    const response = await axios.post(
      `https://graph.facebook.com/v12.0/${user.integrations.facebook.pageId}/feed`,
      {
        message: content.content + '\n\n' + content.hashtags.join(' '),
        access_token: user.integrations.facebook.accessToken
      }
    );

    // Log campaign
    await this.logCampaign({
      type: 'social_post',
      platform: 'facebook',
      content: content.content,
      status: 'published',
      aiGenerated: true
    });

    return response.data;
  }

  // Optimize campaigns based on performance
  async optimizeCampaigns() {
    const user = await User.findById(this.userId);
    const recentCampaigns = await Campaign.find({
      user: this.userId,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    // Analyze performance
    const insights = [];
    
    for (const campaign of recentCampaigns) {
      if (campaign.performance.clicks < campaign.performance.impressions * 0.01) {
        insights.push({
          type: 'optimization',
          message: `Low click rate on ${campaign.platform}. Adjusting content strategy.`,
          actionTaken: 'Modify content tone and CTA placement',
          impact: 'pending'
        });
      }
    }

    // Save insights
    user.insights.push(...insights);
    await user.save();

    return insights;
  }

  async logCampaign(campaignData) {
    const campaign = new Campaign({
      user: this.userId,
      ...campaignData,
      createdAt: new Date()
    });
    await campaign.save();
  }
}

module.exports = AIMarketingAgent;