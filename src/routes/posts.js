const express = require('express');
const router = express.Router();
const {
  createPost,
  getPostsByTopic,
  getExpiredPostsByTopic,
  getMostActivePost,
  getPost,
  getAllPosts
} = require('../controllers/postController');
const {
  likePost,
  dislikePost,
  commentOnPost
} = require('../controllers/interactionController');
const { protect } = require('../middleware/auth');
const { validatePost, validateComment, validateTopic } = require('../middleware/validation');


// General post routes
router.post('/', protect, validatePost, createPost);
router.get('/', protect, getAllPosts);

// Topic-based routes (specific routes must be declared before generic '/:id' to avoid shadowing)
router.get('/topic/:topic', protect, validateTopic, getPostsByTopic);
router.get('/topic/:topic/expired', protect, validateTopic, getExpiredPostsByTopic);
router.get('/topic/:topic/most-active', protect, validateTopic, getMostActivePost);

// Single post route (generic param after specific topic routes)
router.get('/:id', protect, getPost);

// Interaction routes
router.post('/:id/like', protect, likePost);
router.post('/:id/dislike', protect, dislikePost);
router.post('/:id/comment', protect, validateComment, commentOnPost);

module.exports = router;