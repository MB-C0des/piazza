const Post = require('../models/Post');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { title, body, topics, expirationMinutes } = req.body;
    const now = new Date();
    const expirationTime = expirationMinutes
      ? new Date(now.getTime() + expirationMinutes * 60000)
      : new Date(now.getTime() + 60 * 60000); // default 60 minutes

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

// @desc    Get posts by topic
// @route   GET /api/posts/topic/:topic
// @access  Private
const getPostsByTopic = async (req, res) => {
  try {
    const topic = req.params.topic;
    const posts = await Post.find({ topics: topic })
      .sort({ createdAt: -1 })
      .populate('owner', 'name email');

    // Note: not running a global updateExpiredPosts() here (expensive on every request).
    // If you need immediate status consistency, run a scheduled job to flip expired posts.
    res.status(200).json({
      success: true,
      count: posts.length,
      data: { posts }
    });
  } catch (error) {
    console.error('Get posts by topic error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching posts by topic'
    });
  }
};

// @desc    Get expired posts by topic
// @route   GET /api/posts/topic/:topic/expired
// @access  Private
const getExpiredPostsByTopic = async (req, res) => {
  try {
    const topic = req.params.topic;
    const posts = await Post.find({ topics: topic, status: 'Expired' })
      .sort({ expirationTime: -1 })
      .populate('owner', 'name email');

    res.status(200).json({
      success: true,
      count: posts.length,
      data: { posts }
    });
  } catch (error) {
    console.error('Get expired posts by topic error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching expired posts'
    });
  }
};

// @desc    Get most active post in topic
// @route   GET /api/posts/topic/:topic/most-active
// @access  Private
const getMostActivePost = async (req, res) => {
  try {
    const topic = req.params.topic;

    // Define "activity" as likes + dislikes + comments count
    const posts = await Post.find({ topics: topic, status: 'Live' })
      .populate('owner', 'name email');

    if (!posts.length) {
      return res.status(404).json({
        success: false,
        error: 'No posts found for this topic'
      });
    }

    let mostActive = null;
    let highestScore = -1;

    posts.forEach((p) => {
      const score = (p.likes || 0) + (p.dislikes || 0) + (p.comments ? p.comments.length : 0);
      if (score > highestScore) {
        highestScore = score;
        mostActive = p;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        post: mostActive,
        activityScore: highestScore
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

    // Update status if expired (single-post fetch is a good place to ensure status is current)
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
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('owner', 'name email');

    // Not updating all expired posts on every request for performance reasons.
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