import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: null,
    maxlength: 500
  },
  location: {
    type: String,
    default: null,
    maxlength: 100
  },
  socialLinks: {
    github: { type: String, default: null },
    linkedin: { type: String, default: null },
    twitter: { type: String, default: null },
    website: { type: String, default: null }
  },
  auraPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  suspendedUntil: {
    type: Date,
    default: null
  },
  suspensionReason: {
    type: String,
    default: null
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Indexes
UserSchema.index({ auraPoints: -1 })
UserSchema.index({ joinedAt: -1 })

// Virtual for username from email
UserSchema.virtual('username').get(function() {
  return this.email.split('@')[0]
})

// Ensure virtual fields are serialized
UserSchema.set('toJSON', { virtuals: true })

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next()
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.models.User || mongoose.model('User', UserSchema) 