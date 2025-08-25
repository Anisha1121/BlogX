const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Blog = require('../models/Blog');
const generateToken = require('../utils/generateToken');
const { protect, admin } = require('../middleware/auth');
const mongoose = require('mongoose');

const router = express.Router();

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    const user = await User.create({ username, email, password });
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Register Admin (temporary endpoint for testing)
router.post('/register-admin', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    const user = await User.create({ username, email, password, role: 'admin' });
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      // Check if user is blocked
      if (user.isBlocked) {
        return res.status(403).json({ 
          message: 'Your account has been blocked by the administrator. Please contact support.',
          isBlocked: true 
        });
      }
      
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Google Authentication
router.post('/google-auth', async (req, res) => {
  const { credential, type } = req.body;
  
  console.log('Google auth request received:', { type, credentialLength: credential?.length });
  
  try {
    // Verify Google token
    console.log('Verifying Google token...');
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;
    console.log('Google payload received:', { googleId, email, name });
    
    // Check if user exists
    let user = await User.findOne({ email });
    console.log('Existing user found:', !!user);
    
    if (type === 'register') {
      // Registration flow
      if (user) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }
      
      // Create new user
      user = await User.create({
        username: name.replace(/\s+/g, '').toLowerCase() + Date.now().toString().slice(-4),
        email,
        password: 'google_oauth_' + googleId, // Placeholder password
        avatar: picture,
        googleId
      });
    } else {
      // Login flow
      if (!user) {
        return res.status(404).json({ message: 'No account found with this email. Please register first.' });
      }
      
      // Check if user is blocked
      if (user.isBlocked) {
        return res.status(403).json({ 
          message: 'Your account has been blocked by the administrator. Please contact support.',
          isBlocked: true 
        });
      }
      
      // Update user's Google ID and avatar if not set
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = picture;
        await user.save();
      }
    }
    
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
      token: generateToken(user._id, user.role),
    });
    
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ 
      message: 'Google authentication failed',
      error: error.message 
    });
  }
});

// Get current user profile
router.get('/profile', protect, async (req, res) => {
  res.json(req.user);
});

// Get user's blogs
router.get('/my-blogs', protect, async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user._id })
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: get all users
router.get('/', protect, admin, async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// Admin: delete user
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: block user
router.patch('/:id/block', protect, admin, async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent blocking admin users
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot block admin users' });
    }
    
    user.isBlocked = true;
    await user.save();
    
    res.json({ message: 'User blocked successfully', user: { ...user.toObject(), password: undefined } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: unblock user
router.patch('/:id/unblock', protect, admin, async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.isBlocked = false;
    await user.save();
    
    res.json({ message: 'User unblocked successfully', user: { ...user.toObject(), password: undefined } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
