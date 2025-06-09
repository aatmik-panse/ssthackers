import mongoose from 'mongoose'
import crypto from 'crypto'

const VerificationTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['email_verification', 'password_reset'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      // Default expiration is 24 hours from now
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  }
}, {
  timestamps: true
})

// Indexes
VerificationTokenSchema.index({ userId: 1, type: 1 })
VerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // TTL index for automatic deletion

// Static method to generate a new token
VerificationTokenSchema.statics.generateToken = function(userId, type) {
  return new this({
    userId,
    token: crypto.randomBytes(32).toString('hex'),
    type
  })
}

export default mongoose.models.VerificationToken || mongoose.model('VerificationToken', VerificationTokenSchema) 