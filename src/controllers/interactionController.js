const Post = require('../models/Post');


// @desc    Like a post
// @route   POST /api/posts/:id/like
// @access  Private
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Update status if expired
    await post.updateStatus();

    // Check if post is expired
    if (post.status === 'Expired') {
      return res.status(400).json({
        success: false,
        error: 'Cannot like an expired post'
      });
    }

    // Check if user is post owner
    if (post.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'You cannot like your own post'
      });
    }

    // Check if user already liked
    if (post.likedBy.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        error: 'You have already liked this post'
      });
    }

    // Remove dislike if exists
    if (post.dislikedBy.includes(req.user._id)) {
      post.dislikedBy = post.dislikedBy.filter(
        userId => userId.toString() !== req.user._id.toString()
      );
      post.dislikes -= 1;
    }

    // Add like
    post.likedBy.push(req.user._id);
    post.likes += 1;

    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post liked successfully',
      data: {
        likes: post.likes,
        dislikes: post.dislikes
      }
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while liking post'
    });
  }
};

// @desc    Dislike a post
// @route   POST /api/posts/:id/dislike
// @access  Private
const dislikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Update status if expired
    await post.updateStatus();

    // Check if post is expired
    if (post.status === 'Expired') {
      return res.status(400).json({
        success: false,
        error: 'Cannot dislike an expired post'
      });
    }

    // Check if user is post owner
    if (post.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'You cannot dislike your own post'
      });
    }

    // Check if user already disliked
    if (post.dislikedBy.includes(req.user._id)) {
      return res.status(400).json({
        success: false,
        error: 'You have already disliked this post'
      });
    }

    // Remove like if exists
    if (post.likedBy.includes(req.user._id)) {
      post.likedBy = post.likedBy.filter(
        userId => userId.toString() !== req.user._id.toString()
      );
      post.likes -= 1;
    }

    // Add dislike
    post.dislikedBy.push(req.user._id);
    post.dislikes += 1;

    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post disliked successfully',
      data: {
        likes: post.likes,
        dislikes: post.dislikes
      }
    });
  } catch (error) {
    console.error('Dislike post error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while disliking post'
    });
  }
};

// @desc    Comment on a post
// @route   POST /api/posts/:id/comment
// @access  Private
const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Update status if expired
    await post.updateStatus();

    // Check if post is expired
    if (post.status === 'Expired') {
      return res.status(400).json({
        success: false,
        error: 'Cannot comment on an expired post'
      });
    }

    // Add comment
    const comment = {
      user: req.user._id,
      userName: req.user.name,
      text,
      timestamp: new Date()
    };

    post.comments.push(comment);
    await post.save();

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment,
        totalComments: post.comments.length
      }
    });
  } catch (error) {
    console.error('Comment on post error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while adding comment'
    });
  }
};

module.exports = {
  likePost,
  dislikePost,
  commentOnPost
};