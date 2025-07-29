# FFMA Dashboard v1 - Enhanced API Endpoints

![FFMA Dashboard](https://img.shields.io/badge/FFMA-Dashboard-blue.svg)
![Version](https://img.shields.io/badge/version-2.0.0-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🚀 Overview

FFMA (Federated Micro-Agents Architecture) Dashboard v1 adalah sistem manajemen dan analitik berbasis micro-agents yang telah diperbaiki dengan API endpoints yang berfungsi penuh. Sistem ini menggunakan arsitektur serverless dengan Vercel dan database Supabase untuk memberikan performa tinggi dan skalabilitas.

## ✨ Fitur Utama yang Diperbaiki

### 🔧 API Endpoints yang Berfungsi 100%
- ✅ **Sentiment Analysis Agent** (`/api/sentiment-agent`)
- ✅ **Recommendation Engine** (`/api/recommendation-agent`)
- ✅ **Performance Monitor** (`/api/performance-monitor`)
- ✅ **Agent Factory** (`/api/agent-factory`)

### 🛠️ Perbaikan Teknis
- ✅ **CORS Issues Resolved** - Konfigurasi CORS yang tepat untuk semua endpoints
- ✅ **Database Integration** - Koneksi Supabase yang stabil dan optimized
- ✅ **Error Handling** - Comprehensive error handling dengan logging
- ✅ **Environment Variables** - Konfigurasi environment yang proper
- ✅ **Vercel Deployment** - Struktur project sesuai standar Vercel serverless

## 🏗️ Arsitektur

```
FFMA Dashboard v1
├── api/                    # API Endpoints (Vercel Serverless Functions)
│   ├── sentiment-agent.js
│   ├── recommendation-agent.js
│   ├── performance-monitor.js
│   └── agent-factory.js
├── lib/                    # Shared Libraries
│   ├── supabase.js
│   ├── cors.js
│   └── utils.js
├── database/               # Database Schema
│   └── schema.sql
├── docs/                   # Documentation
├── package.json
├── vercel.json
├── .env.example
└── README.md
```

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/Estes786/ffma-dashboard-v1.git
cd ffma-dashboard-v1
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
```bash
# Copy environment template
cp .env.example .env

# Edit .env dengan nilai yang sesuai
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Setup Database
```bash
# Jalankan schema.sql di Supabase SQL Editor
# File: database/schema.sql
```

### 5. Local Development
```bash
npm run dev
```

### 6. Deploy to Vercel
```bash
npm run deploy
```

## 📊 API Endpoints

### 1. Sentiment Analysis Agent
- **Endpoint**: `/api/sentiment-agent`
- **Methods**: GET, POST
- **Description**: Analisis sentiment dari teks input

#### POST Request Example:
```bash
curl -X POST https://your-app.vercel.app/api/sentiment-agent \
  -H "Content-Type: application/json" \
  -d '{"text": "I love this amazing product!"}'
```

#### Response:
```json
{
  "status": "success",
  "data": {
    "sentiment": "positive",
    "score": 0.85,
    "confidence": 92.5,
    "keywords": [
      {"word": "love", "sentiment": "positive"},
      {"word": "amazing", "sentiment": "positive"}
    ]
  }
}
```

### 2. Recommendation Agent
- **Endpoint**: `/api/recommendation-agent`
- **Methods**: GET, POST
- **Description**: Generate rekomendasi berdasarkan kategori

#### POST Request Example:
```bash
curl -X POST https://your-app.vercel.app/api/recommendation-agent \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_001", "category": "technology"}'
```

### 3. Performance Monitor
- **Endpoint**: `/api/performance-monitor`
- **Methods**: GET, POST
- **Description**: Monitor performa sistem real-time

#### POST Request Example:
```bash
curl -X POST https://your-app.vercel.app/api/performance-monitor \
  -H "Content-Type: application/json" \
  -d '{"service": "api", "metric_type": "response_time", "value": 150.5}'
```

### 4. Agent Factory
- **Endpoint**: `/api/agent-factory`
- **Methods**: GET, POST, PUT, DELETE
- **Description**: Manajemen agent (CRUD operations)

#### GET Request Example:
```bash
curl https://your-app.vercel.app/api/agent-factory
```

## 🗄️ Database Schema

Database menggunakan PostgreSQL (Supabase) dengan 7 tabel utama:

1. **agents** - Master data semua agent
2. **sentiment_analyses** - Data analisis sentiment
3. **user_recommendations** - Rekomendasi personal user
4. **performance_metrics** - Metrics performa sistem
5. **agent_tasks** - Task management untuk agent
6. **system_logs** - System logging
7. **api_usage_stats** - Statistik penggunaan API

## ⚙️ Environment Variables

### Required Variables:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Optional Variables:
```env
HUGGINGFACE_API_KEY=your-huggingface-api-key
JWT_SECRET=your-jwt-secret
API_BASE_URL=http://localhost:3000
NODE_ENV=development
```

## 🚀 Deployment

### Vercel Deployment:

1. **Setup Environment Variables di Vercel Dashboard:**
   ```
   Project Settings > Environment Variables
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Verify Deployment:**
   ```bash
   curl https://your-app.vercel.app/api/sentiment-agent
   ```

## 🧪 Testing

### Test All Endpoints:
```bash
# Test Sentiment Agent
curl -X POST https://your-app.vercel.app/api/sentiment-agent \
  -H "Content-Type: application/json" \
  -d '{"text": "This is amazing!"}'

# Test Recommendation Agent
curl "https://your-app.vercel.app/api/recommendation-agent?category=technology"

# Test Performance Monitor
curl -X POST https://your-app.vercel.app/api/performance-monitor \
  -H "Content-Type: application/json" \
  -d '{"service": "api", "metric_type": "response_time", "value": 120}'

# Test Agent Factory
curl https://your-app.vercel.app/api/agent-factory
```

## 🔧 Troubleshooting

### Common Issues:

1. **CORS Error:**
   - Pastikan `lib/cors.js` sudah diimplementasikan
   - Check `vercel.json` CORS configuration

2. **Supabase Connection Error:**
   - Verify environment variables
   - Check Supabase project status
   - Validate RLS policies

3. **500 Internal Server Error:**
   - Check Vercel function logs
   - Verify database schema
   - Check error handling in endpoints

## 📈 Performance Features

- **Rate Limiting**: Built-in rate limiting per endpoint
- **Error Handling**: Comprehensive error handling dengan logging
- **Database Optimization**: Indexed queries untuk performance
- **Caching**: Response caching untuk frequently accessed data
- **Monitoring**: Real-time performance monitoring

## 🔒 Security Features

- **CORS Configuration**: Proper CORS setup untuk web security
- **Input Validation**: Sanitization dan validation semua input
- **Rate Limiting**: Protection against abuse
- **Environment Variables**: Secure configuration management
- **Row Level Security**: Database-level security dengan RLS

## 📚 Documentation

- **API Documentation**: Detailed API docs untuk setiap endpoint
- **Database Schema**: Complete database documentation
- **Deployment Guide**: Step-by-step deployment instructions
- **Troubleshooting**: Common issues dan solutions

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

- **GitHub Issues**: [Create Issue](https://github.com/Estes786/ffma-dashboard-v1/issues)
- **Documentation**: [Wiki](https://github.com/Estes786/ffma-dashboard-v1/wiki)
- **Email**: support@ffma-dashboard.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Achievements

- ✅ 100% API Endpoints Functional
- ✅ CORS Issues Completely Resolved
- ✅ Database Integration Working Perfectly
- ✅ Comprehensive Error Handling
- ✅ Production-Ready Deployment Configuration
- ✅ Full Documentation Complete

---

**Made with ❤️ by FFMA Team**

*FFMA Dashboard v1 - Empowering Analytics with Intelligent Micro-Agents*