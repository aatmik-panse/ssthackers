import mongoose from 'mongoose'

const VoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: null
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  type: {
    type: String,
    enum: ['upvote', 'downvote'],
    required: true
  }
}, {
  timestamps: true
})

// Compound indexes to prevent duplicate votes
VoteSchema.index({ user: 1, post: 1 }, { unique: true, sparse: true })
VoteSchema.index({ user: 1, comment: 1 }, { unique: true, sparse: true })

// Ensure either post or comment is specified, but not both
VoteSchema.pre('save', function(next) {
  const hasPost = !!this.post
  const hasComment = !!this.comment
  
  if (hasPost && hasComment) {
    next(new Error('Vote cannot be for both post and comment'))
  } else if (!hasPost && !hasComment) {
    next(new Error('Vote must be for either a post or comment'))
  } else {
    next()
  }
})

export default mongoose.models.Vote || mongoose.model('Vote', VoteSchema) 