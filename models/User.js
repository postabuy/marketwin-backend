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
    }
  },
  features: {
    googleMyBusiness: { type: Boolean, default: false },
    socialMediaPlatforms: { type: Number, default: 0 },
    reviewManagement: { type: Boolean, default: false },
    emailMarketing: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

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

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
  
  // Business Profile (for AI analysis)
  businessProfile: {
    industry: String,
    targetAudience: {
      ageRange: { min: Number, max: Number },
      gender: [String],
      interests: [String],
      location: {
        radius: Number,
        city: String,
        state: String,
        zip: String
      }
    },
    competitors: [String],
    uniqueSellingPoints: [String],
    businessGoals: [String],
    monthlyBudget: Number,
    currentChallenges: [String]
  },

  // Google My Business Integration
  integrations: {
    googleMyBusiness: {
      connected: { type: Boolean, default: false },
      accessToken: String,
      refreshToken: String,
      businessId: String,
      locationId: String,
      metrics: {
        views: Number,
        searches: Number,
        actions: Number,
        calls: Number,
        directions: Number,
        websiteClicks: Number,
        photos: Number,
        lastUpdated: Date
      }
    },
    
    // Social Media Integrations
    facebook: {
      connected: { type: Boolean, default: false },
      accessToken: String,
      pageId: String,
      pageName: String,
      metrics: {
        followers: Number,
        engagement: Number,
        reach: Number,
        impressions: Number
      }
    },
    instagram: {
      connected: { type: Boolean, default: false },
      accessToken: String,
      businessAccountId: String,
      username: String,
      metrics: {
        followers: Number,
        engagement: Number,
        reach: Number,
        impressions: Number
      }
    },
    twitter: {
      connected: { type: Boolean, default: false },
      accessToken: String,
      accessTokenSecret: String,
      userId: String,
      username: String,
      metrics: {
        followers: Number,
        engagement: Number,
        impressions: Number
      }
    },
    tiktok: {
      connected: { type: Boolean, default: false },
      accessToken: String,
      openId: String,
      username: String
    },
    
    // Email Marketing
    email: {
      provider: String, // 'sendgrid', 'mailchimp', 'internal'
      apiKey: String,
      listId: String,
      subscribers: [{ email: String, name: String, subscribedAt: Date }],
      metrics: {
        totalSubscribers: Number,
        avgOpenRate: Number,
        avgClickRate: Number
      }
    }
  },

  // AI Agent Configuration
  aiAgent: {
    enabled: { type: Boolean, default: true },
    personality: String, // 'professional', 'friendly', 'casual', 'luxury'
    tone: String,
    autoPosting: { type: Boolean, default: true },
    postingSchedule: {
      facebook: [{ day: Number, time: String }],
      instagram: [{ day: Number, time: String }],
      twitter: [{ day: Number, time: String }],
      email: [{ day: Number, time: String }]
    },
    contentPreferences: {
      includeEmojis: Boolean,
      hashtagCount: Number,
      preferredTopics: [String]
    }
  },

  // Campaign History
  campaigns: [{
    type: String,
    platform: String,
    content: String,
    scheduledFor: Date,
    status: String,
    performance: {
      impressions: Number,
      clicks: Number,
      conversions: Number,
      cost: Number
    },
    aiGenerated: Boolean,
    createdAt: Date
  }],

  // AI Insights
  insights: [{
    date: Date,
    type: String, // 'optimization', 'warning', 'opportunity', 'success'
    message: String,
    actionTaken: String,
    impact: String
  }]
});

// ... rest of your existing User model code ...

module.exports = mongoose.model('User', UserSchema);
