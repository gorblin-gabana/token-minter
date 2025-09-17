# GorbPad Database Setup Guide

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 22+ installed
- MongoDB running locally or MongoDB Atlas account
- Git repository cloned

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/gorbpad

# Alternative for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gorbpad

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here

# Gorbchain RPC
GORB_RPC_URL=https://rpc.gorbchain.xyz
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start MongoDB (if running locally)
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or using system MongoDB
sudo systemctl start mongod
```

### 5. Run the Application
```bash
npm run dev
```

## 🗄️ Database Schema Verification

### Check Collections
Connect to MongoDB and verify collections:

```javascript
// Connect to MongoDB
use gorbpad

// Check collections
show collections

// Verify indexes
db.users.getIndexes()
db.tokens.getIndexes()
db.nfts.getIndexes()
```

### Sample Data Verification
```javascript
// Check user count
db.users.countDocuments()

// Check token count
db.tokens.countDocuments()

// Check NFT count
db.nfts.countDocuments()

// Sample user document
db.users.findOne()

// Sample token document
db.tokens.findOne()
```

## 🔧 Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running and accessible on port 27017

#### 2. Environment Variables Not Loaded
```
Error: Please define the MONGODB_URI environment variable
```
**Solution**: Create `.env.local` file with proper MongoDB URI

#### 3. Redux Store Not Working
```
Error: Cannot read properties of undefined
```
**Solution**: Ensure ReduxProvider is properly wrapped around the app in `layout.tsx`

#### 4. API Endpoints Not Responding
```
Error: 500 Internal Server Error
```
**Solution**: Check MongoDB connection and ensure all required fields are provided

### Debug Mode

Enable debug logging by adding to `.env.local`:
```env
DEBUG=mongodb:*
NODE_ENV=development
```

## 📊 Database Monitoring

### MongoDB Compass
1. Download MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Navigate to `gorbpad` database
4. Monitor collections and documents

### Application Logs
Check console for database operations:
```bash
npm run dev
# Look for: "✅ Connected to MongoDB"
```

## 🧪 Testing the Implementation

### 1. Test User Creation
1. Connect wallet
2. Check console for "Welcome to GorbPad!" message
3. Verify user created in `users` collection

### 2. Test Token Creation
1. Fill token form
2. Click "Launch Token"
3. Check database for new token document
4. Verify statistics update

### 3. Test NFT Creation
1. Fill NFT form
2. Click "Mint NFT"
3. Check database for new NFT document
4. Verify statistics update

### 4. Test Token Balances
1. Connect wallet with tokens
2. Open wallet dropdown
3. Verify tokens are displayed with scroll

## 🔄 Data Migration (if needed)

### Backup Database
```bash
mongodump --db gorbpad --out backup/
```

### Restore Database
```bash
mongorestore --db gorbpad backup/gorbpad/
```

## 📈 Performance Optimization

### Index Optimization
The following indexes are automatically created:
- `users.walletAddress` (unique)
- `tokens.mintAddress` (unique)
- `tokens.creator` + `tokens.createdAt`
- `nfts.mintAddress` (unique)
- `nfts.creator` + `nfts.createdAt`

### Query Optimization
- Use pagination for large datasets
- Implement search with text indexes
- Cache frequently accessed data

## 🚨 Production Considerations

### Security
1. Use strong MongoDB credentials
2. Enable authentication
3. Use connection string with credentials
4. Set up proper firewall rules

### Scaling
1. Use MongoDB Atlas for production
2. Implement connection pooling
3. Add database monitoring
4. Set up automated backups

### Monitoring
1. Monitor database performance
2. Set up alerts for errors
3. Track user activity
4. Monitor API response times

## 📝 Maintenance

### Regular Tasks
1. Monitor database size
2. Check index performance
3. Clean up old data if needed
4. Update dependencies

### Backup Strategy
1. Daily automated backups
2. Test restore procedures
3. Store backups securely
4. Document recovery process

This setup ensures your GorbPad application runs smoothly with full database integration and state management!
