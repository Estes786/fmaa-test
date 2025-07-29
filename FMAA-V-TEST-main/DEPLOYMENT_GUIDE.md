# 🚀 FFMA Dashboard - Complete Deployment Guide

## 📋 Pre-Deployment Checklist

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Vercel CLI installed (`npm i -g vercel`)
- [ ] Supabase account created
- [ ] GitHub account (for repository)

## 🗄️ Step 1: Database Setup (Supabase)

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and fill project details
4. Wait for project initialization (~2 minutes)

### 1.2 Setup Database Schema
1. Go to Supabase Dashboard → SQL Editor
2. Copy content from `database/schema.sql`
3. Paste and run the SQL script
4. Verify tables are created in Table Editor

### 1.3 Get Database Credentials
```bash
# From Supabase Dashboard → Settings → API
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

## 📁 Step 2: Repository Setup

### 2.1 Create GitHub Repository
1. Create new repository: `ffma-dashboard-v1`
2. Clone to local machine:
```bash
git clone https://github.com/yourusername/ffma-dashboard-v1.git
cd ffma-dashboard-v1
```

### 2.2 Upload Project Files
```bash
# Copy all files from ffma-dashboard-v1-complete/ to your repo
# Make sure you have all these files:
api/
├── sentiment-agent.js
├── recommendation-agent.js
├── performance-monitor.js
└── agent-factory.js

lib/
├── cors.js
├── supabase.js
└── utils.js

database/
└── schema.sql

package.json
vercel.json
.env.example
README.md
```

### 2.3 Initialize Git
```bash
git add .
git commit -m "Initial commit: FFMA Dashboard with fixed API endpoints"
git push origin main
```

## ⚙️ Step 3: Environment Configuration

### 3.1 Local Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### 3.2 Install Dependencies
```bash
npm install
```

### 3.3 Test Locally
```bash
# Start local development server
npm run dev

# Test endpoints
curl http://localhost:3000/api/sentiment-agent
curl http://localhost:3000/api/agent-factory
```

## 🚀 Step 4: Vercel Deployment

### 4.1 Login to Vercel
```bash
vercel login
```

### 4.2 Link Project
```bash
vercel
# Choose:
# - Link to existing project? N
# - Project name: ffma-dashboard-v1
# - Directory: ./
```

### 4.3 Configure Environment Variables in Vercel
```bash
# Method 1: Via CLI
vercel env add SUPABASE_URL production
vercel env add SUPABASE_ANON_KEY production

# Method 2: Via Dashboard
# Go to Vercel Dashboard → Project → Settings → Environment Variables
# Add:
# - SUPABASE_URL (Production, Preview, Development)
# - SUPABASE_ANON_KEY (Production, Preview, Development)
```

### 4.4 Deploy to Production
```bash
vercel --prod
```

## 🧪 Step 5: Post-Deployment Testing

### 5.1 Test All Endpoints
```bash
# Replace YOUR_VERCEL_URL with your actual deployment URL
export API_BASE="https://your-app.vercel.app"

# Test Sentiment Agent
curl -X POST $API_BASE/api/sentiment-agent \
  -H "Content-Type: application/json" \
  -d '{"text": "This is an amazing product!"}'

# Test Recommendation Agent
curl -X POST $API_BASE/api/recommendation-agent \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user", "category": "technology"}'

# Test Performance Monitor
curl -X POST $API_BASE/api/performance-monitor \
  -H "Content-Type: application/json" \
  -d '{"service": "api", "metric_type": "response_time", "value": 120}'

# Test Agent Factory
curl $API_BASE/api/agent-factory
```

### 5.2 Expected Responses

#### Sentiment Agent Response:
```json
{
  "status": "success",
  "data": {
    "sentiment": "positive",
    "score": 0.85,
    "confidence": 92.5,
    "keywords": [
      {"word": "amazing", "sentiment": "positive"}
    ],
    "analysis_time": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Agent Factory Response:
```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid-here",
      "name": "Sentiment Analyzer Pro",
      "type": "sentiment",
      "status": "active",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

## 📊 Step 6: Monitoring & Verification

### 6.1 Check Vercel Function Logs
1. Go to Vercel Dashboard → Your Project → Functions
2. Click on any function to see logs
3. Monitor for errors or warnings

### 6.2 Verify Database Connections
1. Go to Supabase Dashboard → Table Editor
2. Check if sample data exists in tables:
   - `agents`
   - `sentiment_analyses`
   - `user_recommendations`
   - `performance_metrics`

### 6.3 Performance Testing
```bash
# Test response times
time curl $API_BASE/api/sentiment-agent

# Test concurrent requests
for i in {1..5}; do
  curl -X POST $API_BASE/api/sentiment-agent \
    -H "Content-Type: application/json" \
    -d '{"text": "Test message '$i'"}' &
done
wait
```

## 🔧 Step 7: Troubleshooting

### 7.1 Common Issues & Solutions

#### Issue: "Module not found"
```bash
# Solution: Make sure all dependencies are installed
npm install
vercel --prod
```

#### Issue: "CORS Error"
```bash
# Solution: Check lib/cors.js is present and vercel.json has CORS config
cat lib/cors.js
cat vercel.json
```

#### Issue: "Supabase connection failed"
```bash
# Solution: Verify environment variables
vercel env ls
# Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set
```

#### Issue: "500 Internal Server Error"
```bash
# Solution: Check Vercel function logs
vercel logs
```

### 7.2 Debug Commands
```bash
# Check deployment status
vercel ls

# View recent deployments
vercel --help

# Check environment variables
vercel env ls

# View function logs
vercel logs --follow
```

## 🔄 Step 8: Continuous Deployment

### 8.1 Auto-Deploy Setup
1. Connect GitHub repository to Vercel
2. Enable auto-deploy on push to main branch
3. Configure build settings:
   ```
   Build Command: npm run build
   Output Directory: (leave empty for serverless)
   Install Command: npm install
   ```

### 8.2 Environment-Specific Deployments
```bash
# Deploy to preview
git push origin feature-branch

# Deploy to production
git push origin main

# Manual production deploy
vercel --prod
```

## 📈 Step 9: Performance Optimization

### 9.1 Function Configuration
```json
// vercel.json - already configured
{
  "functions": {
    "api/*.js": {
      "maxDuration": 10,
      "memory": 512
    }
  }
}
```

### 9.2 Database Optimization
```sql
-- Run in Supabase SQL Editor for better performance
CREATE INDEX IF NOT EXISTS idx_sentiment_analyses_created_at 
ON sentiment_analyses(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp 
ON performance_metrics(timestamp DESC);
```

## 🛡️ Step 10: Security Configuration

### 10.1 Supabase RLS Policies
```sql
-- Run in Supabase SQL Editor
-- Policies are already created in schema.sql
-- Verify they exist:
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 10.2 API Rate Limiting
Rate limiting is implemented in `lib/utils.js`. Monitor usage:
```bash
# Check for rate limit headers in responses
curl -I $API_BASE/api/sentiment-agent
```

## ✅ Step 11: Final Verification

### 11.1 Complete System Test
```bash
#!/bin/bash
# Create test script: test-deployment.sh

API_BASE="https://your-app.vercel.app"

echo "🧪 Testing FFMA Dashboard Deployment..."

# Test 1: Sentiment Agent
echo "1. Testing Sentiment Agent..."
RESPONSE=$(curl -s -X POST $API_BASE/api/sentiment-agent \
  -H "Content-Type: application/json" \
  -d '{"text": "This is amazing!"}')
echo "Response: $RESPONSE"

# Test 2: Agent Factory
echo "2. Testing Agent Factory..."
RESPONSE=$(curl -s $API_BASE/api/agent-factory)
echo "Response: $RESPONSE"

# Test 3: Recommendation Agent
echo "3. Testing Recommendation Agent..."
RESPONSE=$(curl -s -X POST $API_BASE/api/recommendation-agent \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "category": "technology"}')
echo "Response: $RESPONSE"

# Test 4: Performance Monitor
echo "4. Testing Performance Monitor..."
RESPONSE=$(curl -s -X POST $API_BASE/api/performance-monitor \
  -H "Content-Type: application/json" \
  -d '{"service": "api", "metric_type": "test", "value": 100}')
echo "Response: $RESPONSE"

echo "✅ All tests completed!"
```

### 11.2 Run Test Script
```bash
chmod +x test-deployment.sh
./test-deployment.sh
```

## 🎉 Deployment Complete!

Your FFMA Dashboard is now fully deployed and functional. You should have:

- ✅ All 4 API endpoints working
- ✅ Database connected and populated
- ✅ CORS issues resolved
- ✅ Error handling implemented
- ✅ Environment variables configured
- ✅ Auto-deployment setup

## 📞 Support

If you encounter issues:
1. Check Vercel function logs
2. Verify Supabase database connection
3. Test environment variables
4. Review this guide step-by-step

**Your FFMA Dashboard should now be running at: `https://your-app.vercel.app`**

---

*Happy deploying! 🚀*