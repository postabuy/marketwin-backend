const N8NAutomation = require('../services/n8nIntegration');
const n8n = new N8NAutomation();
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName, businessName, phone, businessType } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Create user
    user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      businessName,
      businessType: businessType || 'other'
    });

    // Create token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        businessName: user.businessName,
        subscription: user.subscription,
        features: user.features
      }
    });
 } catch (err) {
    console.error('Registration error:', err.message);
    console.error('Full error:', err);
    
    // Check for duplicate email
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }
    
    // Check for validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: Object.values(err.errors).map(e => e.message).join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error during registration. Please try again.',
      details: err.message // Temporarily show error details
    });
}
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Create token
    const token = user.getSignedJwtToken();

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        businessName: user.businessName,
        subscription: user.subscription,
        features: user.features
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
});

module.exports = router;
