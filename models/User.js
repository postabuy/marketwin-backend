const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please add a first name'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  businessName: {
    type: String,
    required: [true, 'Please add a business name']
  },
  businessType: {
    type: String,
    enum: ['restaurant', 'retail', 'healthcare', 'fitness', 'beauty', 'automotive', 'professional', 'home-services', 'education', 'entertainment', 'other'],
    default: 'other'
  },
  businessDescription: {
    type: String,
    maxlength: 500
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'local_boost', 'growth_accelerator', 'scale', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'past_due'],
      default: 'active'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    stripeCustomerId: String,
    stripeSubscriptionId: String
  },
  features: {
    googleMyBusiness: { type: Boolean, default: false },
    socialMediaPlatforms: { type: Number, default: 0 },
    reviewManagement: { type: Boolean, default: false },
    emailMarketing: { type: Boolean, default: false }
  },
  // Usage tracking for plan limits
  usage: {
    aiContent: { type: Number, default: 0 },
    socialPosts: { type: Number, default: 0 },
    emailCampaigns: { type: Number, default: 0 },
    reviewsMonitored: { type: Number, default: 0 },
    lastUpdated: Date,
    resetDate: Date
  },
  // Social platform connections
  socialConnections: {
    linkedinConnected: { type: Boolean, default: false },
    linkedinAccessToken: String,
    linkedinProfileId: String,
    linkedinTokenExpiry: Date,
    tiktokConnected: { type: Boolean, default: false },
    tiktokAccessToken: String,
    tiktokUserId: String,
    tiktokTokenExpiry: Date,
    facebookConnected: { type: Boolean, default: false },
    facebookAccessToken: String,
    facebookPageId: String,
    instagramConnected: { type: Boolean, default: false },
    instagramAccessToken: String,
    instagramBusinessId: String,
    twitterConnected: { type: Boolean, default: false },
    twitterAccessToken: String,
    twitterUserId: String,
    threadsConnected: { type: Boolean, default: false },
    threadsAccessToken: String,
    threadsUserId: String
  },
  // Business integrations
  googlePlaceId: String,
  connectedPlatforms: [String],
  lastReviewCheck: Date,
  // Automation settings
  automation: {
    enabled: { type: Boolean, default: false },
    dailyPostTime: { type: String, default: '09:00' },
    contentPreferences: {
      tone: {
        type: String,
        enum: ['professional', 'casual', 'friendly', 'authoritative', 'humorous'],
        default: 'professional'
      },
      topics: [String],
      hashtags: [String]
    }
  },
  // Target audience for AI content
  targetAudience: {
    type: String,
    default: 'Local customers and businesses'
  },
  createdAt: { type: Date, default: Date.now },
  lastLogin: Date
});

// Plan limits configuration
const PLAN_LIMITS = {
  free: {
    aiContent: 0,
    socialPosts: 0,
    emailCampaigns: 0,
    reviewsMonitored: 10
  },
  local_boost: {
    aiContent: 10,
    socialPosts: 30,
    emailCampaigns: 10,
    reviewsMonitored: 100
  },
  growth_accelerator: {
    aiContent: 50,
    socialPosts: 100,
    emailCampaigns: 50,
    reviewsMonitored: 500
  },
  scale: {
    aiContent: 200,
    socialPosts: 500,
    emailCampaigns: 200,
    reviewsMonitored: 2000
  },
  enterprise: {
    aiContent: -1, // unlimited
    socialPosts: -1,
    emailCampaigns: -1,
    reviewsMonitored: -1
  }
};

// Check if user can use a feature based on plan limits
UserSchema.methods.canUseFeature = function(feature) {
  const plan = this.subscription?.plan || 'free';
  const limit = PLAN_LIMITS[plan][feature];
  
  if (limit === -1) return true; // unlimited
  if (limit === 0) return false; // not available
  
  const currentUsage = this.usage?.[feature] || 0;
  return currentUsage < limit;
};

// Increment usage counter
UserSchema.methods.incrementUsage = async function(feature) {
  if (!this.usage) {
    this.usage = {};
  }
  
  this.usage[feature] = (this.usage[feature] || 0) + 1;
  this.usage.lastUpdated = new Date();
  
  // Check if we need to reset monthly usage
  const now = new Date();
  const resetDate = this.usage.resetDate;
  
  if (!resetDate || now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
    // Reset monthly counters
    this.usage.aiContent = feature === 'aiContent' ? 1 : 0;
    this.usage.socialPosts = feature === 'socialPosts' ? 1 : 0;
    this.usage.emailCampaigns = feature === 'emailCampaigns' ? 1 : 0;
    this.usage.reviewsMonitored = feature === 'reviewsMonitored' ? 1 : 0;
    this.usage.resetDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  
  await this.save();
};

// Get remaining credits for a feature
UserSchema.methods.getRemainingCredits = function(feature) {
  const plan = this.subscription?.plan || 'free';
  const limit = PLAN_LIMITS[plan][feature];
  
  if (limit === -1) return 'unlimited';
  if (limit === 0) return 0;
  
  const currentUsage = this.usage?.[feature] || 0;
  return Math.max(0, limit - currentUsage);
};

// Get all plan features and limits
UserSchema.methods.getPlanDetails = function() {
  const plan = this.subscription?.plan || 'free';
  return {
    plan: plan,
    limits: PLAN_LIMITS[plan],
    usage: this.usage || {},
    remaining: {
      aiContent: this.getRemainingCredits('aiContent'),
      socialPosts: this.getRemainingCredits('socialPosts'),
      emailCampaigns: this.getRemainingCredits('emailCampaigns'),
      reviewsMonitored: this.getRemainingCredits('reviewsMonitored')
    }
  };
};

// Check if a social platform is connected
UserSchema.methods.isPlatformConnected = function(platform) {
  const platformMap = {
    'linkedin': 'linkedinConnected',
    'tiktok': 'tiktokConnected',
    'facebook': 'facebookConnected',
    'instagram': 'instagramConnected',
    'twitter': 'twitterConnected',
    'threads': 'threadsConnected'
  };
  
  const connectionField = platformMap[platform.toLowerCase()];
  return this.socialConnections?.[connectionField] || false;
};

// Update social platform connection
UserSchema.methods.connectPlatform = async function(platform, tokenData) {
  if (!this.socialConnections) {
    this.socialConnections = {};
  }
  
  switch(platform.toLowerCase()) {
    case 'linkedin':
      this.socialConnections.linkedinConnected = true;
      this.socialConnections.linkedinAccessToken = tokenData.accessToken;
      this.socialConnections.linkedinProfileId = tokenData.profileId;
      this.socialConnections.linkedinTokenExpiry = tokenData.expiry;
      break;
    case 'tiktok':
      this.socialConnections.tiktokConnected = true;
      this.socialConnections.tiktokAccessToken = tokenData.accessToken;
      this.socialConnections.tiktokUserId = tokenData.userId;
      this.socialConnections.tiktokTokenExpiry = tokenData.expiry;
      break;
    case 'facebook':
      this.socialConnections.facebookConnected = true;
      this.socialConnections.facebookAccessToken = tokenData.accessToken;
      this.socialConnections.facebookPageId = tokenData.pageId;
      break;
    case 'instagram':
      this.socialConnections.instagramConnected = true;
      this.socialConnections.instagramAccessToken = tokenData.accessToken;
      this.socialConnections.instagramBusinessId = tokenData.businessId;
      break;
    case 'twitter':
      this.socialConnections.twitterConnected = true;
      this.socialConnections.twitterAccessToken = tokenData.accessToken;
      this.socialConnections.twitterUserId = tokenData.userId;
      break;
    case 'threads':
      this.socialConnections.threadsConnected = true;
      this.socialConnections.threadsAccessToken = tokenData.accessToken;
      this.socialConnections.threadsUserId = tokenData.userId;
      break;
  }
  
  // Update connected platforms array
  if (!this.connectedPlatforms) {
    this.connectedPlatforms = [];
  }
  if (!this.connectedPlatforms.includes(platform)) {
    this.connectedPlatforms.push(platform);
  }
  
  await this.save();
};

// Disconnect social platform
UserSchema.methods.disconnectPlatform = async function(platform) {
  if (!this.socialConnections) return;
  
  switch(platform.toLowerCase()) {
    case 'linkedin':
      this.socialConnections.linkedinConnected = false;
      this.socialConnections.linkedinAccessToken = undefined;
      this.socialConnections.linkedinProfileId = undefined;
      break;
    case 'tiktok':
      this.socialConnections.tiktokConnected = false;
      this.socialConnections.tiktokAccessToken = undefined;
      this.socialConnections.tiktokUserId = undefined;
      break;
    case 'facebook':
      this.socialConnections.facebookConnected = false;
      this.socialConnections.facebookAccessToken = undefined;
      this.socialConnections.facebookPageId = undefined;
      break;
    case 'instagram':
      this.socialConnections.instagramConnected = false;
      this.socialConnections.instagramAccessToken = undefined;
      this.socialConnections.instagramBusinessId = undefined;
      break;
    case 'twitter':
      this.socialConnections.twitterConnected = false;
      this.socialConnections.twitterAccessToken = undefined;
      this.socialConnections.twitterUserId = undefined;
      break;
    case 'threads':
      this.socialConnections.threadsConnected = false;
      this.socialConnections.threadsAccessToken = undefined;
      this.socialConnections.threadsUserId = undefined;
      break;
  }
  
  // Update connected platforms array
  if (this.connectedPlatforms) {
    this.connectedPlatforms = this.connectedPlatforms.filter(p => p !== platform);
  }
  
  await this.save();
};

// Encrypt password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
