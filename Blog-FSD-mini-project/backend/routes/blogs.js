const express = require('express');
const Blog = require('../models/Blog');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/blogs
// @desc    Get all published blogs with filters
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      mood,
      search,
      author,
      featured,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { status: 'published', isPublished: true };

    if (category && category !== 'all') query.category = category;
    if (mood) query.mood = mood;
    if (author) query.author = author;
    if (featured === 'true') query.featured = true;
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { title: regex },
        { content: regex },
        { tags: regex },
      ];
      // Find author by username
      const authorUser = await User.findOne({ username: regex });
      if (authorUser) {
        query.$or.push({ author: authorUser._id });
      }
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const blogs = await Blog.find(query)
      .populate('author', 'username avatar')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-content');

    const total = await Blog.countDocuments(query);

    // Update reading history if user is authenticated
    if (req.user) {
      const userId = req.user._id;
      await User.findByIdAndUpdate(userId, {
        $push: {
          readingHistory: {
            $each: blogs.map(blog => ({ blogId: blog._id })),
            $slice: -100 // Keep only last 100 blogs
          }
        }
      });
    }

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ message: 'Server error fetching blogs' });
  }
});

// @route   GET /api/blogs/mine
// @desc    Get current user's blogs (drafts or published)
// @access  Private
router.get('/mine', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { author: req.user._id };
    if (status) {
      query.status = status;
      if (status === 'published') {
        query.isPublished = true;
      }
    }

    const blogs = await Blog.find(query)
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Blog.countDocuments(query);

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get my blogs error:', error);
    res.status(500).json({ message: 'Server error fetching your blogs' });
  }
});

// @route   GET /api/blogs/recommendations
// @desc    Get personalized blog recommendations
// @access  Private
router.get('/recommendations', auth, async (req, res) => {
  try {
    const user = req.user;
    const { limit = 10 } = req.query;

    // Get user's reading history and preferences
    const readBlogIds = user.readingHistory.map(h => h.blogId);
    const userMood = user.preferences.mood;
    const userLikedCategories = user.readingHistory
      .filter(h => h.blogId)
      .map(h => h.blogId);

    // Get blogs based on user's mood and reading history
    const recommendations = await Blog.find({
      _id: { $nin: readBlogIds },
      status: 'published',
      isPublished: true,
      $or: [
        { mood: userMood },
        { category: { $in: ['technology', 'lifestyle', 'travel'] } } // Default categories
      ]
    })
      .populate('author', 'username avatar')
      .sort({ views: -1, publishedAt: -1 })
      .limit(limit)
      .select('-content');

    res.json({ recommendations });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Server error fetching recommendations' });
  }
});

// @route   GET /api/blogs/mood/:mood
// @desc    Get blogs by mood
// @access  Public
router.get('/mood/:mood', optionalAuth, async (req, res) => {
  try {
    const { mood } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const blogs = await Blog.find({
      mood,
      status: 'published',
      isPublished: true
    })
      .populate('author', 'username avatar')
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-content');

    const total = await Blog.countDocuments({
      mood,
      status: 'published',
      isPublished: true
    });

    res.json({
      blogs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get blogs by mood error:', error);
    res.status(500).json({ message: 'Server error fetching blogs by mood' });
  }
});

// @route   GET /api/blogs/:id
// @desc    Get single blog by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'username avatar bio')
      .populate('comments.user', 'username avatar');

    if (!blog || blog.status !== 'published' || !blog.isPublished) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Increment views
    await blog.incrementViews();

    // Update reading history if user is authenticated
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          readingHistory: {
            $each: [{ blogId: blog._id }],
            $slice: -100
          }
        }
      });
    }

    res.json({ blog });
  } catch (error) {
    console.error('Get blog error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(500).json({ message: 'Server error fetching blog' });
  }
});

// @route   GET /api/blogs/slug/:slug
// @desc    Get single blog by slug
// @access  Public
router.get('/slug/:slug', optionalAuth, async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug })
      .populate('author', 'username avatar bio')
      .populate('comments.user', 'username avatar');

    if (!blog || blog.status !== 'published' || !blog.isPublished) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    await blog.incrementViews();

    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          readingHistory: {
            $each: [{ blogId: blog._id }],
            $slice: -100
          }
        }
      });
    }

    res.json({ blog });
  } catch (error) {
    console.error('Get blog by slug error:', error);
    res.status(500).json({ message: 'Server error fetching blog' });
  }
});

// @route   GET /api/blogs/mine/:slug
// @desc    Get single blog by slug for the current owner (drafts allowed)
// @access  Private
router.get('/mine/:slug', auth, async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, author: req.user._id })
      .populate('author', 'username avatar bio')
      .populate('comments.user', 'username avatar');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    return res.json({ blog });
  } catch (error) {
    console.error('Get own blog by slug error:', error);
    return res.status(500).json({ message: 'Server error fetching blog' });
  }
});

// @route   POST /api/blogs/seed
// @desc    Seed database with sample blogs (dev only)
// @access  Public in development (blocked in production)
router.post('/seed', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Seeding is disabled in production' });
    }

    // Ensure there is at least one user to own the blogs
    let author = await User.findOne({ email: 'sample@demo.com' });
    if (!author) {
      author = new User({
        username: 'sampleuser',
        email: 'sample@demo.com',
        password: 'password123',
        bio: 'Demo user for sample content'
      });
      await author.save();
    }

    const existing = await Blog.countDocuments({});
    if (existing > 0) {
      return res.json({ message: 'Blogs already exist, skipping seed', count: existing });
    }

    const now = new Date();
    const samples = [
      {
        title: 'Welcome to BlogHub: Your place to write and read',
        excerpt: 'Discover how to create, publish, and share stories with our modern editor and community tools.',
        content: 'This is a sample post that explains the basics of BlogHub. Start by creating an account, then write your first story using the rich text editor. Add tags, choose a category, and publish to share with the community. You can also explore recommended stories tailored to your mood.',
        category: 'technology',
        tags: ['intro','platform'],
        coverImage: '',
        mood: 'happy',
        featured: true,
        status: 'published',
        isPublished: true,
        publishedAt: now,
        author: author._id
      },
      {
        title: 'Travel Tips for a Calm Journey',
        excerpt: 'A few practical tips to keep your next trip smooth and stress-free.',
        content: 'Packing light, planning buffers between connections, and having offline maps can dramatically reduce stress during travel. This sample blog demonstrates another category and mood.',
        category: 'travel',
        tags: ['travel','tips'],
        coverImage: '',
        mood: 'calm',
        featured: false,
        status: 'published',
        isPublished: true,
        publishedAt: now,
        author: author._id
      },
      {
        title: 'Healthy Eating on a Busy Schedule',
        excerpt: 'Quick strategies for staying on track with nutrition when life gets hectic.',
        content: 'Meal prepping on weekends, keeping healthy snacks handy, and choosing simple recipes are a few ways to eat well without spending hours in the kitchen. This sample blog is published and visible right away.',
        category: 'health',
        tags: ['health','food'],
        coverImage: '',
        mood: 'motivated',
        featured: false,
        status: 'published',
        isPublished: true,
        publishedAt: now,
        author: author._id
      }
    ];

    const created = await Blog.insertMany(samples);
    return res.status(201).json({ message: 'Seeded sample blogs', count: created.length });
  } catch (error) {
    console.error('Seed blogs error:', error);
    return res.status(500).json({ message: 'Failed to seed blogs' });
  }
});

// @route   POST /api/blogs
// @desc    Create a new blog
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, coverImage, mood, codeSnippets } = req.body || {};

    // Basic validation with helpful responses
    if (!title || !content || !excerpt || !category) {
      return res.status(400).json({ message: 'Missing required fields: title, content, excerpt, category' });
    }

    const allowedCategories = ['technology', 'lifestyle', 'travel', 'food', 'health', 'business', 'entertainment', 'education', 'other'];
    const normalizedCategory = String(category).toLowerCase();
    if (!allowedCategories.includes(normalizedCategory)) {
      return res.status(400).json({ message: `Invalid category. Allowed: ${allowedCategories.join(', ')}` });
    }

    const blog = new Blog({
      title,
      content,
      excerpt,
      category: normalizedCategory,
      tags,
      coverImage,
      mood,
      codeSnippets,
      author: req.user._id,
      status: 'draft'
    });

    await blog.save();
    await blog.populate('author', 'username avatar');

    res.status(201).json({
      message: 'Blog created successfully',
      blog
    });
  } catch (error) {
    console.error('Create blog error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).map((key) => ({ field: key, message: error.errors[key].message }));
      return res.status(400).json({ message: 'Validation error creating blog', errors });
    }
    res.status(500).json({ message: 'Server error creating blog', error: error.message });
  }
});

// @route   PUT /api/blogs/:id
// @desc    Update a blog
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this blog' });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'username avatar');

    res.json({
      message: 'Blog updated successfully',
      blog: updatedBlog
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ message: 'Server error updating blog' });
  }
});

// @route   DELETE /api/blogs/:id
// @desc    Delete a blog
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this blog' });
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ message: 'Server error deleting blog' });
  }
});

// @route   POST /api/blogs/:id/publish
// @desc    Publish a draft blog
// @access  Private
router.post('/:id/publish', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to publish this blog' });
    }

    blog.status = 'published';
    blog.isPublished = true;
    blog.publishedAt = new Date();
    await blog.save();

    res.json({
      message: 'Blog published successfully',
      blog
    });
  } catch (error) {
    console.error('Publish blog error:', error);
    res.status(500).json({ message: 'Server error publishing blog' });
  }
});

// @route   POST /api/blogs/:id/like
// @desc    Toggle like on a blog
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    await blog.toggleLike(req.user._id);

    // Update user's liked blogs
    const user = await User.findById(req.user._id);
    const isLiked = blog.likes.includes(req.user._id);
    
    if (isLiked) {
      user.likedBlogs = user.likedBlogs.filter(id => id.toString() !== blog._id.toString());
    } else {
      user.likedBlogs.push(blog._id);
    }
    await user.save();

    res.json({
      message: isLiked ? 'Blog unliked' : 'Blog liked',
      isLiked: !isLiked,
      likeCount: blog.likes.length
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error toggling like' });
  }
});

// @route   POST /api/blogs/:id/comments
// @desc    Add a comment to a blog
// @access  Private
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const comment = {
      user: req.user._id,
      content
    };

    blog.comments.push(comment);
    await blog.save();

    await blog.populate('comments.user', 'username avatar');

    const newComment = blog.comments[blog.comments.length - 1];

    res.status(201).json({
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error adding comment' });
  }
});

// @route   PUT /api/blogs/:id/comments/:commentId
// @desc    Update a comment
// @access  Private
router.put('/:id/comments/:commentId', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const comment = blog.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }

    comment.content = content;
    comment.isEdited = true;
    comment.editedAt = new Date();
    await blog.save();

    res.json({
      message: 'Comment updated successfully',
      comment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Server error updating comment' });
  }
});

// @route   DELETE /api/blogs/:id/comments/:commentId
// @desc    Delete a comment
// @access  Private
router.delete('/:id/comments/:commentId', auth, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const comment = blog.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    comment.isDeleted = true;
    comment.deletedAt = new Date();
    await blog.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error deleting comment' });
  }
});

module.exports = router;
