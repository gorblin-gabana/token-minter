import mongoose, { Document, Schema } from 'mongoose'

export interface INFT extends Document {
  mintAddress: string
  name: string
  symbol: string
  uri: string
  description: string
  freezeAuthority?: string
  mintAuthority?: string
  updateAuthority?: string
  isFrozen: boolean
  isInitialized: boolean
  programId: string
  creator: mongoose.Types.ObjectId
  transactionSignature: string
  royaltyFee: number
  createdAt: Date
  metadata?: {
    name: string
    symbol: string
    uri: string
    description: string
    updateAuthority?: string
    additionalMetadata?: any[]
  }
}

const NFTSchema = new Schema<INFT>({
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
  uri: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  freezeAuthority: String,
  mintAuthority: String,
  updateAuthority: String,
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
  royaltyFee: {
    type: Number,
    default: 5.0 // Fixed at 5% for all NFTs
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    name: String,
    symbol: String,
    uri: String,
    description: String,
    updateAuthority: String,
    additionalMetadata: [Schema.Types.Mixed]
  }
}, {
  timestamps: true
})

// Index for efficient queries
NFTSchema.index({ creator: 1, createdAt: -1 })
NFTSchema.index({ name: 'text', symbol: 'text', description: 'text' })

export default mongoose.models.NFT || mongoose.model<INFT>('NFT', NFTSchema)
