import mongoose, { Document, Schema } from 'mongoose'

export interface IToken extends Document {
  mintAddress: string
  name: string
  symbol: string
  supply: string
  decimals: number
  uri?: string
  freezeAuthority?: string
  mintAuthority: string
  updateAuthority: string
  isFrozen: boolean
  isInitialized: boolean
  programId: string
  creator: mongoose.Types.ObjectId
  transactionSignature: string
  createdAt: Date
  metadata?: {
    name: string
    symbol: string
    uri?: string
    updateAuthority: string
    additionalMetadata?: any[]
  }
}

const TokenSchema = new Schema<IToken>({
  mintAddress: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  supply: {
    type: String,
    required: true
  },
  decimals: {
    type: Number,
    required: true
  },
  uri: String,
  freezeAuthority: String,
  mintAuthority: {
    type: String,
    required: true
  },
  updateAuthority: {
    type: String,
    required: true
  },
  isFrozen: {
    type: Boolean,
    default: false
  },
  isInitialized: {
    type: Boolean,
    default: true
  },
  programId: {
    type: String,
    required: true
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  transactionSignature: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    name: String,
    symbol: String,
    uri: String,
    updateAuthority: String,
    additionalMetadata: [Schema.Types.Mixed]
  }
}, {
  timestamps: true
})

// Index for efficient queries
TokenSchema.index({ creator: 1, createdAt: -1 })
TokenSchema.index({ name: 'text', symbol: 'text' })

export default mongoose.models.Token || mongoose.model<IToken>('Token', TokenSchema)
