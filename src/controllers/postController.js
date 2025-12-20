const Post = require('../models/Post');


// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { title, body, topics, expirationMinutes } = req.body;

    // Calculate expiration time (default 5 minutes)
    const expirationTime = new Date();
    expirationTime.setMinutes(
      expirationTime.getMinutes() + (expirationMinutes || parseInt(process.env.DEFAULT_POST_EXPIRATION) || 5)
    );

    // Create post
    const post = await Post.create({
      title,
      body,
      topics,
      owner: req.user._id,
      ownerName: req.user.name,
      expirationTime
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while creating post'
    });
  }
};

// @desc    Get all posts by topic
// @route   GET /api/posts/topic/:topic
// @access  Private
const getPostsByTopic = async (req, res) => {
  try {
    const { topic } = req.params;
    const { includeExpired } = req.query;

    // Update expired posts first
    await Post.updateExpiredPosts();

    // Build query
    const query = { topics: topic };
    
    // Filter by status if not including expired
    if (includeExpired !== 'true') {
      query.status = 'Live';
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .populate('owner', 'name email');

    res.status(200).json({
      success: true,
      count: posts.length,
      data: { posts }
    });
  } catch (error) {
    console.error('Get posts by topic error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching posts'
    });
  }
};

// @desc    Get expired posts by topic
// @route   GET /api/posts/topic/:topic/expired
// @access  Private
const getExpiredPostsByTopic = async (req, res) => {
  try {
    const { topic } = req.params;

    // Update expired posts first
    await Post.updateExpiredPosts();

    const posts = await Post.find({
      topics: topic,
      status: 'Expired'
    })
      .sort({ expirationTime: -1 })
      .populate('owner', 'name email');

    res.status(200).json({
      success: true,
      count: posts.length,
      data: { posts }
    });
  } catch (error) {
    console.error('Get expired posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching expired posts'
    });
  }
};

// @desc    Get most active post by topic
// @route   GET /api/posts/topic/:topic/most-active
// @access  Private
const getMostActivePost = async (req, res) => {
  try {
    const { topic } = req.params;

    // Update expired posts first
    await Post.updateExpiredPosts();

    // Find most active live post (highest likes + dislikes)
    const posts = await Post.find({
      topics: topic,
      status: 'Live'
    });

    if (posts.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No active posts found for this topic'
      });
    }

    // Calculate activity score for each post
    const mostActive = posts.reduce((max, post) => {
      const currentActivity = post.likes + post.dislikes;
      const maxActivity = max.likes + max.dislikes;
      return currentActivity > maxActivity ? post : max;
    });

    res.status(200).json({
      success: true,
      data: { 
        post: mostActive,
        activityScore: mostActive.likes + mostActive.dislikes
      }
    });
  } catch (error) {
    console.error('Get most active post error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching most active post'
    });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Private
const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('comments.user', 'name');

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Update status if expired
    await post.updateStatus();

    res.status(200).json({
      success: true,
      data: { post }
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching post'
    });
  }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Private
const getAllPosts = async (req, res) => {
  try {
    // Update expired posts first
    await Post.updateExpiredPosts();

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('owner', 'name email');

    res.status(200).json({
      success: true,
      count: posts.length,
      data: { posts }
    });
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching posts'
    });
  }
};

module.exports = {
  createPost,
  getPostsByTopic,
  getExpiredPostsByTopic,
  getMostActivePost,
  getPost,
  getAllPosts
};