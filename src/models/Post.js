import mongoose from 'mongoose'

const PostSchema = new mongoose.Schema({
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
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  votes: {
    type: Number,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  hotScore: {
    type: Number,
    default: 0
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
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'offensive', 'harassment', 'misinformation', 'illegal', 'other'],
      default: 'other'
    },
    additionalInfo: {
      type: String,
      trim: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdByAdmin: {
    type: Boolean,
    default: false
  },
  adminCreator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  targetUserEmail: {
    type: String,
    trim: true,
    lowercase: true,
    default: null
  },
  pendingPostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PendingUserPost',
    default: null
  }
}, {
  timestamps: true
})

// Indexes
PostSchema.index({ createdAt: -1 })
PostSchema.index({ hotScore: -1 })
PostSchema.index({ votes: -1 })
PostSchema.index({ author: 1 })
PostSchema.index({ isDeleted: 1 })
PostSchema.index({ createdByAdmin: 1 })
PostSchema.index({ flagCount: -1 })
PostSchema.index({ targetUserEmail: 1 })

// Virtual for post type
PostSchema.virtual('type').get(function() {
  return this.url ? 'link' : 'text'
})

// Virtual for domain extraction
PostSchema.virtual('domain').get(function() {
  if (!this.url) return null
  try {
    return new URL(this.url).hostname.replace('www.', '')
  } catch {
    return null
  }
})

// Ensure virtual fields are serialized
PostSchema.set('toJSON', { virtuals: true })

// Pre-save hook to calculate hot score
PostSchema.pre('save', function(next) {
  if (this.isModified('votes') || this.isModified('commentCount') || this.isNew) {
    const ageInHours = (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60)
    const gravity = 1.8
    this.hotScore = (this.votes + this.commentCount * 0.5) / Math.pow(ageInHours + 2, gravity)
  }
  
  // Update flagCount when flags change
  if (this.isModified('flags')) {
    this.flagCount = this.flags.length
  }
  
  next()
})

export default mongoose.models.Post || mongoose.model('Post', PostSchema) 