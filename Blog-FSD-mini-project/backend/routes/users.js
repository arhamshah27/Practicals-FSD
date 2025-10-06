const express = require('express');
const User = require('../models/User');
const Blog = require('../models/Blog');
const { auth, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/users/profile/:username
// @desc    Get user profile by username
// @access  Public
router.get('/profile/:username', optionalAuth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password')
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's published blogs
    const blogs = await Blog.find({
      author: user._id,
      status: 'published',
      isPublished: true
    })
      .select('title excerpt coverImage publishedAt views likes category')
      .sort({ publishedAt: -1 })
      .limit(5);

    const profile = {
      ...user.toObject(),
      blogs,
      isFollowing: req.user ? user.followers.some(f => f._id.toString() === req.user._id.toString()) : false
    };

    res.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// @route   GET /api/users/search
// @desc    Search users by username
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const users = await User.find({
      username: { $regex: q, $options: 'i' }
    })
      .select('username avatar bio')
      .limit(limit);

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error searching users' });
  }
});

// @route   POST /api/users/follow/:userId
// @desc    Follow a user
// @access  Private
router.post('/follow/:userId', auth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    
    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(req.user._id);

    // Check if already following
    const isFollowing = currentUser.following.includes(targetUserId);
    
    if (isFollowing) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    // Add to following
    currentUser.following.push(targetUserId);
    await currentUser.save();

    // Add to target user's followers
    targetUser.followers.push(req.user._id);
    await targetUser.save();

    res.json({
      message: 'User followed successfully',
      isFollowing: true
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ message: 'Server error following user' });
  }
});

// @route   POST /api/users/unfollow/:userId
// @desc    Unfollow a user
// @access  Private
router.post('/unfollow/:userId', auth, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    
    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot unfollow yourself' });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentUser = await User.findById(req.user._id);

    // Check if following
    const isFollowing = currentUser.following.includes(targetUserId);
    
    if (!isFollowing) {
      return res.status(400).json({ message: 'Not following this user' });
    }

    // Remove from following
    currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
    await currentUser.save();

    // Remove from target user's followers
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== req.user._id.toString());
    await targetUser.save();

    res.json({
      message: 'User unfollowed successfully',
      isFollowing: false
    });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ message: 'Server error unfollowing user' });
  }
});

// @route   GET /api/users/following
// @desc    Get users that current user is following
// @access  Private
router.get('/following', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('following', 'username avatar bio');

    res.json({ following: user.following });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: 'Server error fetching following' });
  }
});

// @route   GET /api/users/followers
// @desc    Get users following current user
// @access  Private
router.get('/followers', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('followers', 'username avatar bio');

    res.json({ followers: user.followers });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: 'Server error fetching followers' });
  }
});

// @route   GET /api/users/liked-blogs
// @desc    Get blogs liked by current user
// @access  Private
router.get('/liked-blogs', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const user = await User.findById(req.user._id);
    const likedBlogIds = user.likedBlogs;

    const blogs = await Blog.find({
      _id: { $in: likedBlogIds },
      status: 'published',
      isPublished: true
    })
      .populate('author', 'username avatar')
      .select('title excerpt coverImage publishedAt views likes category')
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = likedBlogIds.length;

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get liked blogs error:', error);
    res.status(500).json({ message: 'Server error fetching liked blogs' });
  }
});

// @route   GET /api/users/reading-history
// @desc    Get user's reading history
// @access  Private
router.get('/reading-history', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const user = await User.findById(req.user._id);
    const historyBlogIds = user.readingHistory.map(h => h.blogId).filter(Boolean);

    const blogs = await Blog.find({
      _id: { $in: historyBlogIds },
      status: 'published',
      isPublished: true
    })
      .populate('author', 'username avatar')
      .select('title excerpt coverImage publishedAt views likes category')
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = historyBlogIds.length;

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get reading history error:', error);
    res.status(500).json({ message: 'Server error fetching reading history' });
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', auth, async (req, res) => {
  try {
    const { theme, mood, notifications } = req.body;
    const updateData = {};

    if (theme) updateData['preferences.theme'] = theme;
    if (mood) updateData['preferences.mood'] = mood;
    if (notifications) {
      updateData['preferences.notifications'] = { ...req.user.preferences.notifications, ...notifications };
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error updating preferences' });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Get blog statistics
    const totalBlogs = await Blog.countDocuments({ author: req.user._id });
    const publishedBlogs = await Blog.countDocuments({ 
      author: req.user._id, 
      status: 'published',
      isPublished: true 
    });
    const draftBlogs = await Blog.countDocuments({ 
      author: req.user._id, 
      status: 'draft' 
    });

    // Get total views and likes
    const blogs = await Blog.find({ author: req.user._id });
    const totalViews = blogs.reduce((sum, blog) => sum + blog.views, 0);
    const totalLikes = blogs.reduce((sum, blog) => sum + blog.likes.length, 0);

    const stats = {
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      totalViews,
      totalLikes,
      followers: user.followers.length,
      following: user.following.length,
      readingHistoryCount: user.readingHistory.length
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
});

module.exports = router;
