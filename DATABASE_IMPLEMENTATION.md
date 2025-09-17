# GorbPad Database Implementation Guide

## 🗄️ Overview

This document provides a comprehensive guide to the database implementation and state management system for the GorbPad Token & NFT Launchpad. The application now features a complete MongoDB integration with Redux state management, real-time statistics, and enhanced user experience.

## 📊 Database Architecture

### MongoDB Collections

#### 1. Users Collection
**Purpose**: Store user information and track their activity on the platform.

```typescript
interface IUser {
  walletAddress: string        // Unique wallet address (Primary Key)
  isNewUser: boolean          // Flag for first-time users
  createdAt: Date             // Account creation timestamp
  lastLoginAt: Date           // Last login timestamp
  tokensLaunched: ObjectId[]  // References to created tokens
  nftsLaunched: ObjectId[]    // References to created NFTs
  totalTokensLaunched: number // Count of tokens created
  totalNftsLaunched: number   // Count of NFTs created
  profile?: {                 // Optional user profile
    username?: string
    bio?: string
    avatar?: string
  }
}
```

**Key Features**:
- Automatic user creation on wallet connection
- Welcome message system for new vs returning users
- Activity tracking and statistics
- Profile management capabilities

#### 2. Tokens Collection
**Purpose**: Store all token creation data and metadata.

```typescript
interface IToken {
  mintAddress: string         // Unique token mint address
  name: string               // Token name
  symbol: string             // Token symbol
  supply: string             // Total supply
  decimals: number           // Decimal places
  uri?: string               // Metadata URI
  freezeAuthority?: string   // Freeze authority public key
  mintAuthority: string      // Mint authority public key
  updateAuthority: string    // Update authority public key
  isFrozen: boolean          // Freeze status
  isInitialized: boolean     // Initialization status
  programId: string          // Program ID (Token22)
  creator: ObjectId          // Reference to creator user
  transactionSignature: string // Creation transaction hash
  createdAt: Date            // Creation timestamp
  metadata?: {               // Token metadata
    name: string
    symbol: string
    uri?: string
    updateAuthority: string
    additionalMetadata?: any[]
  }
}
```

#### 3. NFTs Collection
**Purpose**: Store all NFT creation data and metadata.

```typescript
interface INFT {
  mintAddress: string         // Unique NFT mint address
  name: string               // NFT name
  symbol: string             // NFT symbol
  uri: string                // Metadata URI
  description: string        // NFT description
  freezeAuthority?: string   // Freeze authority public key
  mintAuthority?: string     // Mint authority public key
  updateAuthority?: string   // Update authority public key
  isFrozen: boolean          // Freeze status
  isInitialized: boolean     // Initialization status
  programId: string          // Program ID (Token22)
  creator: ObjectId          // Reference to creator user
  transactionSignature: string // Creation transaction hash
  royaltyFee: number         // Royalty fee (fixed at 5%)
  createdAt: Date            // Creation timestamp
  metadata?: {               // NFT metadata
    name: string
    symbol: string
    uri: string
    description: string
    updateAuthority?: string
    additionalMetadata?: any[]
  }
}
```

## 🔄 State Management (Redux)

### Store Structure

```typescript
interface RootState {
  user: UserState
  tokens: TokenState
  nfts: NFTState
  stats: StatsState
}
```

### Redux Slices

#### 1. User Slice (`userSlice.ts`)
**Actions**:
- `createOrLoginUser` - Async thunk for user creation/login
- `updateUserProfile` - Async thunk for profile updates
- `setUser` - Set current user
- `clearUser` - Clear user data
- `updateUserStats` - Update user statistics

**State**:
```typescript
interface UserState {
  currentUser: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
```

#### 2. Token Slice (`tokenSlice.ts`)
**Actions**:
- `fetchAllTokens` - Get all platform tokens
- `fetchUserTokens` - Get user's tokens
- `createToken` - Create new token
- `addToken` - Add token to state
- `clearTokens` - Clear token data

**State**:
```typescript
interface TokenState {
  tokens: Token[]
  userTokens: Token[]
  isLoading: boolean
  error: string | null
  totalCount: number
}
```

#### 3. NFT Slice (`nftSlice.ts`)
**Actions**:
- `fetchAllNFTs` - Get all platform NFTs
- `fetchUserNFTs` - Get user's NFTs
- `createNFT` - Create new NFT
- `addNFT` - Add NFT to state
- `clearNFTs` - Clear NFT data

**State**:
```typescript
interface NFTState {
  nfts: NFT[]
  userNfts: NFT[]
  isLoading: boolean
  error: string | null
  totalCount: number
}
```

#### 4. Stats Slice (`statsSlice.ts`)
**Actions**:
- `fetchPlatformStats` - Get platform statistics
- `updateStats` - Update statistics

**State**:
```typescript
interface StatsState {
  platformStats: PlatformStats | null
  isLoading: boolean
  error: string | null
}

interface PlatformStats {
  totalTokens: number
  totalNFTs: number
  totalUsers: number
  networkTVL: number
  lastUpdated: string
}
```

## 🌐 API Endpoints

### User Management

#### `POST /api/users/create-or-login`
**Purpose**: Create new user or login existing user
**Request Body**:
```json
{
  "walletAddress": "string"
}
```
**Response**:
```json
{
  "user": {
    "_id": "string",
    "walletAddress": "string",
    "isNewUser": "boolean",
    "createdAt": "string",
    "lastLoginAt": "string",
    "totalTokensLaunched": "number",
    "totalNftsLaunched": "number",
    "profile": "object"
  },
  "isNewUser": "boolean",
  "message": "string"
}
```

#### `PUT /api/users/[userId]/profile`
**Purpose**: Update user profile
**Request Body**:
```json
{
  "profile": {
    "username": "string",
    "bio": "string",
    "avatar": "string"
  }
}
```

### Token Management

#### `GET /api/tokens`
**Purpose**: Get all tokens with pagination and search
**Query Parameters**:
- `page` (optional): Page number
- `limit` (optional): Items per page
- `search` (optional): Search term

#### `POST /api/tokens`
**Purpose**: Create new token
**Request Body**: Complete token object

#### `GET /api/tokens/user/[userId]`
**Purpose**: Get user's tokens

### NFT Management

#### `GET /api/nfts`
**Purpose**: Get all NFTs with pagination and search
**Query Parameters**: Same as tokens

#### `POST /api/nfts`
**Purpose**: Create new NFT
**Request Body**: Complete NFT object

#### `GET /api/nfts/user/[userId]`
**Purpose**: Get user's NFTs

### Statistics

#### `GET /api/stats/platform`
**Purpose**: Get platform statistics
**Response**:
```json
{
  "totalTokens": "number",
  "totalNFTs": "number",
  "totalUsers": "number",
  "networkTVL": "number",
  "lastUpdated": "string"
}
```

### Token Balances

#### `GET /api/tokens/balances/[walletAddress]`
**Purpose**: Fetch token balances from GorbScan API
**Response**: Array of token balance objects with metadata

## 🔧 Database Connection

### MongoDB Setup

1. **Connection String**: Configure in `.env.local`
```env
MONGODB_URI=mongodb://localhost:27017/gorbpad
```

2. **Connection Management**: Uses connection pooling and caching
```typescript
// lib/database.ts
const cached = global.mongoose = { conn: null, promise: null }

async function connectDB() {
  if (cached.conn) return cached.conn
  
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, opts)
  }
  
  cached.conn = await cached.promise
  return cached.conn
}
```

## 🎯 Key Features Implementation

### 1. Automatic User Management
- **Wallet Connection**: Users are automatically created when they connect their wallet
- **Welcome Messages**: New users get welcome toast, returning users get welcome back message
- **Activity Tracking**: All user actions are tracked and stored

### 2. Real-time Statistics
- **Platform Stats**: Total tokens, NFTs, users, and TVL
- **Auto-update**: Statistics refresh when new items are created
- **Dashboard Integration**: Real-time display in the main dashboard

### 3. Enhanced Token Balances
- **GorbScan Integration**: Fetches real token data from `https://api.gorbscan.com/api/tokens/{walletAddress}/mints`
- **Rich Display**: Shows token logos, names, symbols, balances, and status
- **Scrollable Interface**: Handles large numbers of tokens with smooth scrolling

### 4. Database Integration
- **Automatic Saving**: All token and NFT creations are saved to database
- **User Relationships**: Proper foreign key relationships between users and their creations
- **Metadata Storage**: Complete token and NFT metadata is preserved

## 🚀 Usage Examples

### Creating a Token
```typescript
// When user creates a token, it's automatically saved to database
const result = await createTokenWithWallet({...})

// Save to database via Redux
await dispatch(createToken({
  mintAddress: result.tokenAddress,
  name: tokenForm.name,
  symbol: tokenForm.symbol,
  // ... other fields
  creator: currentUser._id!,
  transactionSignature: result.signature
}))

// Statistics are automatically updated
dispatch(fetchPlatformStats())
```

### Fetching User Data
```typescript
// Get current user from Redux store
const { currentUser, isAuthenticated } = useUser()

// Fetch user's tokens
const { userTokens } = useAppSelector(state => state.tokens)
```

### Real-time Statistics
```typescript
// Platform statistics are automatically fetched and updated
const { platformStats } = useAppSelector(state => state.stats)

// Display in dashboard
<p className="text-3xl font-bold">
  {platformStats?.totalTokens || 0}
</p>
```

## 🔍 Database Indexes

### Performance Optimizations
```typescript
// User collection indexes
UserSchema.index({ walletAddress: 1 }, { unique: true })

// Token collection indexes
TokenSchema.index({ creator: 1, createdAt: -1 })
TokenSchema.index({ name: 'text', symbol: 'text' })
TokenSchema.index({ mintAddress: 1 }, { unique: true })

// NFT collection indexes
NFTSchema.index({ creator: 1, createdAt: -1 })
NFTSchema.index({ name: 'text', symbol: 'text', description: 'text' })
NFTSchema.index({ mintAddress: 1 }, { unique: true })
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 22+
- MongoDB (local or cloud)
- Wallet with GORB tokens for testing

### Environment Variables
Create `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/gorbpad
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
GORB_RPC_URL=https://rpc.gorbchain.xyz
```

### Installation
```bash
npm install
npm run dev
```

## 📈 Monitoring and Analytics

### User Activity Tracking
- Login timestamps
- Token creation count
- NFT creation count
- Platform engagement metrics

### Platform Statistics
- Total tokens created
- Total NFTs minted
- Active users count
- Network TVL (ready for implementation)

### Error Handling
- Comprehensive error logging
- User-friendly error messages
- Graceful fallbacks for API failures

## 🔒 Security Considerations

### Data Validation
- Input sanitization on all API endpoints
- Type validation using TypeScript interfaces
- MongoDB schema validation

### Access Control
- Wallet-based authentication
- User data isolation
- Secure API endpoints

### Data Integrity
- Unique constraints on critical fields
- Foreign key relationships
- Transaction rollback on failures

## 🎉 Benefits of This Implementation

1. **Scalability**: MongoDB handles large datasets efficiently
2. **Real-time Updates**: Redux provides instant UI updates
3. **User Experience**: Smooth, responsive interface with real data
4. **Data Persistence**: All user actions are permanently stored
5. **Analytics Ready**: Built-in tracking for future analytics features
6. **Performance**: Optimized queries and caching
7. **Maintainability**: Clean, well-documented code structure

This implementation provides a solid foundation for a production-ready token and NFT launchpad with comprehensive database integration and state management.
