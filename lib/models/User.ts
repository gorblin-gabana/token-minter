import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  walletAddress: string
  isNewUser: boolean
  createdAt: Date
  lastLoginAt: Date
  tokensLaunched: mongoose.Types.ObjectId[]
  nftsLaunched: mongoose.Types.ObjectId[]
  totalTokensLaunched: number
  totalNftsLaunched: number
  profile?: {
    username?: string
    bio?: string
    avatar?: string
  }
}

const UserSchema = new Schema<IUser>({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  isNewUser: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  tokensLaunched: [{
    type: Schema.Types.ObjectId,
    ref: 'Token'
  }],
  nftsLaunched: [{
    type: Schema.Types.ObjectId,
    ref: 'NFT'
  }],
  totalTokensLaunched: {
    type: Number,
    default: 0
  },
  totalNftsLaunched: {
    type: Number,
    default: 0
  },
  profile: {
    username: String,
    bio: String,
    avatar: String
  }
}, {
  timestamps: true
})

// Update lastLoginAt on save
UserSchema.pre('save', function(next) {
  if (this.isModified('lastLoginAt')) {
    this.lastLoginAt = new Date()
  }
  next()
})

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
