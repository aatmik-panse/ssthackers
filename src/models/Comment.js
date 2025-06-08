import mongoose from 'mongoose'

const CommentSchema = new mongoose.Schema({
  body: {
    type: String,
    required: true,
    trim: true,
    maxlength: 10000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  votes: {
    type: Number,
    default: 0
  },
  depth: {
    type: Number,
    default: 0,
    min: 0
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  flagCount: {
    type: Number,
    default: 0
  },
  flags: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
})

// Indexes
CommentSchema.index({ post: 1, createdAt: 1 })
CommentSchema.index({ parent: 1 })
CommentSchema.index({ author: 1 })
CommentSchema.index({ votes: -1 })
CommentSchema.index({ isDeleted: 1 })

// Pre-save hook to set depth based on parent
CommentSchema.pre('save', async function(next) {
  if (this.isNew && this.parent) {
    try {
      const parentComment = await this.constructor.findById(this.parent)
      if (parentComment) {
        this.depth = parentComment.depth + 1
      }
    } catch (error) {
      console.error('Error setting comment depth:', error)
    }
  }
  next()
})

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema) 