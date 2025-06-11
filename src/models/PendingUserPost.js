import mongoose from 'mongoose'

const PendingUserPostSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },
  url: {
    type: String,
    trim: true,
    default: null
  },
  body: {
    type: String,
    trim: true,
    default: null
  },
  adminCreator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  processed: {
    type: Boolean,
    default: false
  },
  processedAt: {
    type: Date,
    default: null
  },
  assignedPostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: null
  }
})

// Create indexes
PendingUserPostSchema.index({ email: 1 })
PendingUserPostSchema.index({ processed: 1 })
PendingUserPostSchema.index({ createdAt: 1 })

export default mongoose.models.PendingUserPost || mongoose.model('PendingUserPost', PendingUserPostSchema) 