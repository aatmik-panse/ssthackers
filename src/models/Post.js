import mongoose from 'mongoose'

// Utility function to generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .substring(0, 50) // Limit to 50 characters
}

// Utility function to generate random string
function generateRandomString(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },
  slug: {
    type: String,
    unique: true,
    index: true
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
    // Allow null for posts waiting to be assigned to users
    required: false,
    default: null
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

// Pre-save hook to generate slug and calculate hot score
PostSchema.pre('save', async function(next) {
  // Generate slug if new post or title changed
  if (this.isNew || this.isModified('title')) {
    const baseSlug = generateSlug(this.title)
    let finalSlug = `${baseSlug}-${generateRandomString()}`
    
    // Ensure uniqueness (in rare case of collision)
    let counter = 0
    while (await mongoose.models.Post.findOne({ slug: finalSlug, _id: { $ne: this._id } })) {
      finalSlug = `${baseSlug}-${generateRandomString()}`
      counter++
      if (counter > 5) {
        // After 5 attempts, add timestamp to ensure uniqueness
        finalSlug = `${baseSlug}-${Date.now().toString(36)}`
        break
      }
    }
    
    this.slug = finalSlug
  }
  
  // Calculate hot score
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