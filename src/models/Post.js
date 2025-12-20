const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a post title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  body: {
    type: String,
    required: [true, 'Please provide post content'],
    trim: true,
    maxlength: [5000, 'Post content cannot exceed 5000 characters']
  },
  topics: [{
    type: String,
    enum: ['Politics', 'Health', 'Sport', 'Tech'],
    required: [true, 'Please select at least one topic']
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Live', 'Expired'],
    default: 'Live'
  },
  expirationTime: {
    type: Date,
    required: [true, 'Please provide an expiration time']
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    text: {
      type: String,
      required: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  // Track which users have liked/disliked to prevent duplicates
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index for efficient topic queries
postSchema.index({ topics: 1, status: 1 });
postSchema.index({ expirationTime: 1 });

// Virtual to check if post is expired
postSchema.virtual('isExpired').get(function() {
  return new Date() > this.expirationTime;
});

// Method to update status based on expiration
postSchema.methods.updateStatus = function() {
  if (this.isExpired && this.status === 'Live') {
    this.status = 'Expired';
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to update all expired posts
postSchema.statics.updateExpiredPosts = async function() {
  const now = new Date();
  return await this.updateMany(
    { expirationTime: { $lt: now }, status: 'Live' },
    { $set: { status: 'Expired' } }
  );
};

module.exports = mongoose.model('Post', postSchema);