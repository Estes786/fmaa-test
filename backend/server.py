from fastapi import FastAPI, HTTPException, Depends, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import os
import uuid
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title="FMAA Dashboard API",
    description="Federated Micro-Agents Architecture Dashboard API",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/fmaa_dashboard")
client = AsyncIOMotorClient(MONGO_URL)
db = client.get_database()

# Pydantic models
class SentimentAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)

class SentimentAnalysisResponse(BaseModel):
    id: str
    text: str
    sentiment: str
    score: float
    confidence: float
    keywords: List[Dict[str, str]]
    analysis_time: str

class RecommendationRequest(BaseModel):
    user_id: str
    category: str
    preferences: Optional[Dict[str, Any]] = {}

class PerformanceMetricRequest(BaseModel):
    service: str
    metric_type: str
    value: float
    metadata: Optional[Dict[str, Any]] = {}

class AgentRequest(BaseModel):
    name: str
    type: str
    description: Optional[str] = None
    config: Optional[Dict[str, Any]] = {}

class AgentUpdateRequest(BaseModel):
    id: str
    name: Optional[str] = None
    status: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    description: Optional[str] = None

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "fmaa-dashboard-api", "timestamp": datetime.now(timezone.utc).isoformat()}

# Sentiment Analysis Agent
@app.get("/api/sentiment-agent")
async def get_sentiment_analyses(
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    text_filter: Optional[str] = None
):
    try:
        query = {}
        if text_filter:
            query["text"] = {"$regex": text_filter, "$options": "i"}
        
        cursor = db.sentiment_analyses.find(query).sort("created_at", -1).skip(offset).limit(limit)
        data = await cursor.to_list(length=limit)
        
        # Convert ObjectId to string
        for item in data:
            item["_id"] = str(item["_id"])
        
        return {
            "status": "success",
            "data": data,
            "pagination": {
                "limit": limit,
                "offset": offset,
                "count": len(data)
            }
        }
    except Exception as e:
        logger.error(f"Error in get_sentiment_analyses: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/sentiment-agent")
async def analyze_sentiment(request: SentimentAnalysisRequest):
    try:
        # Perform sentiment analysis
        sentiment_result = analyze_text_sentiment(request.text)
        
        # Create document
        doc = {
            "_id": str(uuid.uuid4()),
            "text": request.text,
            "sentiment": sentiment_result["sentiment"],
            "score": sentiment_result["score"],
            "confidence": sentiment_result["confidence"],
            "keywords": sentiment_result["keywords"],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Save to database
        await db.sentiment_analyses.insert_one(doc)
        
        return {
            "status": "success",
            "data": {
                "id": doc["_id"],
                "text": request.text,
                "sentiment": sentiment_result["sentiment"],
                "score": sentiment_result["score"],
                "confidence": sentiment_result["confidence"],
                "keywords": sentiment_result["keywords"],
                "analysis_time": doc["created_at"]
            }
        }
    except Exception as e:
        logger.error(f"Error in analyze_sentiment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Recommendation Agent
@app.get("/api/recommendation-agent")
async def get_recommendations(
    category: Optional[str] = None,
    user_id: Optional[str] = None,
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0)
):
    try:
        query = {}
        if category:
            query["category"] = category
        if user_id:
            query["user_id"] = user_id
        
        cursor = db.user_recommendations.find(query).sort("rating", -1).skip(offset).limit(limit)
        data = await cursor.to_list(length=limit)
        
        # Convert ObjectId to string
        for item in data:
            item["_id"] = str(item["_id"])
        
        return {
            "status": "success",
            "data": data,
            "pagination": {
                "limit": limit,
                "offset": offset,
                "count": len(data)
            }
        }
    except Exception as e:
        logger.error(f"Error in get_recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recommendation-agent")
async def generate_recommendations(request: RecommendationRequest):
    try:
        # Generate recommendations
        recommendations = await generate_recommendation_data(request.category, request.preferences)
        
        # Prepare documents for insertion
        docs = []
        for rec in recommendations:
            doc = {
                "_id": str(uuid.uuid4()),
                "user_id": request.user_id,
                "item_id": rec["id"],
                "category": request.category,
                "title": rec.get("title", rec.get("name")),
                "description": rec["description"],
                "rating": rec["rating"],
                "price": rec.get("price"),
                "recommendation_score": rec["score"],
                "metadata": rec,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            docs.append(doc)
        
        # Save to database
        if docs:
            await db.user_recommendations.insert_many(docs)
        
        return {
            "status": "success",
            "message": f"Generated {len(recommendations)} recommendations",
            "data": {
                "user_id": request.user_id,
                "category": request.category,
                "recommendations": recommendations,
                "total_generated": len(recommendations)
            }
        }
    except Exception as e:
        logger.error(f"Error in generate_recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Performance Monitor
@app.get("/api/performance-monitor")
async def get_performance_metrics(
    service: Optional[str] = None,
    metric_type: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = Query(100, le=1000),
    offset: int = Query(0, ge=0)
):
    try:
        query = {}
        if service:
            query["service"] = service
        if metric_type:
            query["metric_type"] = metric_type
        if start_date:
            query["timestamp"] = {"$gte": start_date}
        if end_date:
            if "timestamp" not in query:
                query["timestamp"] = {}
            query["timestamp"]["$lte"] = end_date
        
        cursor = db.performance_metrics.find(query).sort("timestamp", -1).skip(offset).limit(limit)
        data = await cursor.to_list(length=limit)
        
        # Convert ObjectId to string
        for item in data:
            item["_id"] = str(item["_id"])
        
        # Calculate summary statistics
        summary = calculate_metrics_summary(data)
        
        return {
            "status": "success",
            "data": data,
            "summary": summary,
            "pagination": {
                "limit": limit,
                "offset": offset,
                "count": len(data)
            },
            "filters_applied": {
                "service": service,
                "metric_type": metric_type,
                "start_date": start_date,
                "end_date": end_date
            }
        }
    except Exception as e:
        logger.error(f"Error in get_performance_metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/performance-monitor")
async def record_performance_metric(request: PerformanceMetricRequest):
    try:
        timestamp = datetime.now(timezone.utc).isoformat()
        
        doc = {
            "_id": str(uuid.uuid4()),
            "service": request.service,
            "metric_type": request.metric_type,
            "value": request.value,
            "timestamp": timestamp,
            "metadata": {
                **request.metadata,
                "recorded_at": timestamp,
                "source": "api",
                "version": "1.0"
            }
        }
        
        # Save to database
        await db.performance_metrics.insert_one(doc)
        
        # Check for performance alerts
        await check_performance_alerts(request.service, request.metric_type, request.value)
        
        return {
            "status": "success",
            "message": "Performance metric recorded successfully",
            "data": {
                "id": doc["_id"],
                "service": request.service,
                "metric_type": request.metric_type,
                "value": request.value,
                "timestamp": timestamp,
                "metadata": doc["metadata"]
            }
        }
    except Exception as e:
        logger.error(f"Error in record_performance_metric: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Agent Factory
@app.get("/api/agent-factory")
async def get_agents(
    type: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = Query(50, le=100),
    offset: int = Query(0, ge=0),
    include_stats: bool = False
):
    try:
        query = {}
        if type:
            query["type"] = type
        if status:
            query["status"] = status
        
        cursor = db.agents.find(query).sort("created_at", -1).skip(offset).limit(limit)
        data = await cursor.to_list(length=limit)
        
        # Convert ObjectId to string
        for item in data:
            item["_id"] = str(item["_id"])
        
        # Add statistics if requested
        if include_stats:
            for agent in data:
                agent["stats"] = await get_agent_stats(agent["_id"])
        
        # Calculate summary
        summary = calculate_agent_summary(data)
        
        return {
            "status": "success",
            "data": data,
            "summary": summary,
            "pagination": {
                "limit": limit,
                "offset": offset,
                "count": len(data)
            }
        }
    except Exception as e:
        logger.error(f"Error in get_agents: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/agent-factory")
async def create_agent(request: AgentRequest):
    try:
        # Validate agent type
        valid_types = ['sentiment', 'recommendation', 'performance', 'custom']
        if request.type not in valid_types:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid agent type. Must be one of: {', '.join(valid_types)}"
            )
        
        agent_id = str(uuid.uuid4())
        timestamp = datetime.now(timezone.utc).isoformat()
        
        doc = {
            "_id": agent_id,
            "name": request.name,
            "type": request.type,
            "description": request.description or f"{request.type} agent created via API",
            "config": {
                **get_default_config(request.type),
                **request.config
            },
            "status": "created",
            "created_at": timestamp,
            "updated_at": timestamp
        }
        
        # Save to database
        await db.agents.insert_one(doc)
        
        # Initialize agent tasks
        await initialize_agent_tasks(agent_id)
        
        return {
            "status": "success",
            "message": "Agent created successfully",
            "data": doc
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in create_agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Helper functions
def analyze_text_sentiment(text: str) -> Dict[str, Any]:
    """Simple sentiment analysis function"""
    positive_words = [
        'good', 'great', 'excellent', 'amazing', 'awesome', 'fantastic', 'wonderful',
        'happy', 'joy', 'love', 'best', 'perfect', 'outstanding', 'brilliant',
        'superb', 'marvelous', 'incredible', 'terrific', 'fabulous', 'impressive'
    ]
    
    negative_words = [
        'bad', 'worst', 'terrible', 'awful', 'horrible', 'disgusting', 'hate',
        'sad', 'angry', 'frustrated', 'disappointed', 'poor', 'pathetic',
        'useless', 'worthless', 'disaster', 'nightmare', 'ridiculous', 'annoying'
    ]
    
    neutral_words = [
        'okay', 'fine', 'normal', 'average', 'standard', 'typical', 'regular',
        'moderate', 'acceptable', 'adequate'
    ]
    
    score = 0
    total_words = 0
    keywords = []
    words = text.lower().split()
    
    for word in words:
        clean_word = ''.join(c for c in word if c.isalnum())
        total_words += 1
        
        if clean_word in positive_words:
            score += 1
            keywords.append({"word": clean_word, "sentiment": "positive"})
        elif clean_word in negative_words:
            score -= 1
            keywords.append({"word": clean_word, "sentiment": "negative"})
        elif clean_word in neutral_words:
            keywords.append({"word": clean_word, "sentiment": "neutral"})
    
    normalized_score = score / total_words if total_words > 0 else 0
    
    if normalized_score > 0.1:
        sentiment = "positive"
        confidence = min(normalized_score * 100, 95)
    elif normalized_score < -0.1:
        sentiment = "negative"
        confidence = min(abs(normalized_score) * 100, 95)
    else:
        sentiment = "neutral"
        confidence = 60 + (hash(text) % 20)  # Deterministic "random" confidence
    
    return {
        "score": round(normalized_score, 3),
        "sentiment": sentiment,
        "confidence": round(confidence, 1),
        "keywords": keywords[:10]  # Limit to top 10 keywords
    }

async def generate_recommendation_data(category: str, preferences: Dict[str, Any] = {}) -> List[Dict[str, Any]]:
    """Generate recommendation data based on category"""
    recommendations = {
        'technology': [
            {
                "id": "tech_001",
                "name": "iPhone 15 Pro Max",
                "title": "Latest iPhone with Advanced Camera",
                "description": "Experience the most advanced iPhone with pro camera system and A17 Pro chip",
                "price": 1199,
                "rating": 4.8,
                "category": "smartphone",
                "score": 95,
                "features": ["A17 Pro Chip", "48MP Camera", "Titanium Design"]
            },
            {
                "id": "tech_002",
                "name": "MacBook Air M3",
                "title": "Ultra-thin Laptop with M3 Chip",
                "description": "Incredibly thin and powerful laptop for professionals and students",
                "price": 1299,
                "rating": 4.7,
                "category": "laptop",
                "score": 92,
                "features": ["M3 Chip", "18hr Battery", "Liquid Retina Display"]
            }
        ],
        'fashion': [
            {
                "id": "fashion_001",
                "name": "Nike Air Jordan 1",
                "title": "Classic Basketball Shoes",
                "description": "Iconic basketball shoes with timeless style and comfort",
                "price": 170,
                "rating": 4.5,
                "category": "shoes",
                "score": 88,
                "features": ["Leather Upper", "Air Sole Unit", "Classic Design"]
            }
        ],
        'food': [
            {
                "id": "food_001",
                "name": "Margherita Pizza",
                "title": "Classic Italian Pizza",
                "description": "Traditional pizza with fresh mozzarella, tomato sauce, and basil",
                "price": 16,
                "rating": 4.5,
                "category": "italian",
                "score": 87,
                "features": ["Fresh Mozzarella", "San Marzano Tomatoes", "Fresh Basil"]
            }
        ]
    }
    
    category_recs = recommendations.get(category, [])
    
    # Apply preferences filtering
    if preferences.get("max_price"):
        category_recs = [item for item in category_recs if not item.get("price") or item["price"] <= preferences["max_price"]]
    
    if preferences.get("min_rating"):
        category_recs = [item for item in category_recs if item["rating"] >= preferences["min_rating"]]
    
    return sorted(category_recs, key=lambda x: x["score"], reverse=True)

def calculate_metrics_summary(data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Calculate summary statistics for metrics"""
    if not data:
        return {
            "total_records": 0,
            "average_value": 0,
            "min_value": 0,
            "max_value": 0
        }
    
    values = [item["value"] for item in data if isinstance(item.get("value"), (int, float))]
    
    if not values:
        return {
            "total_records": len(data),
            "average_value": 0,
            "min_value": 0,
            "max_value": 0
        }
    
    return {
        "total_records": len(data),
        "average_value": round(sum(values) / len(values), 2),
        "min_value": min(values),
        "max_value": max(values),
        "latest_timestamp": data[0].get("timestamp") if data else None,
        "oldest_timestamp": data[-1].get("timestamp") if data else None
    }

async def check_performance_alerts(service: str, metric_type: str, value: float):
    """Check for performance alerts and log them"""
    thresholds = {
        'response_time': {'warning': 1000, 'critical': 3000},
        'cpu_usage': {'warning': 70, 'critical': 90},
        'memory_usage': {'warning': 80, 'critical': 95},
        'error_rate': {'warning': 5, 'critical': 10}
    }
    
    threshold = thresholds.get(metric_type)
    if not threshold:
        return
    
    alert_level = None
    if value >= threshold['critical']:
        alert_level = 'critical'
    elif value >= threshold['warning']:
        alert_level = 'warning'
    
    if alert_level:
        logger.warning(f"PERFORMANCE ALERT [{alert_level.upper()}]: {service} {metric_type} = {value}")
        
        # Log to system_logs collection
        await db.system_logs.insert_one({
            "_id": str(uuid.uuid4()),
            "level": alert_level,
            "service": service,
            "message": f"Performance alert: {metric_type} = {value}",
            "metadata": {"metric_type": metric_type, "value": value, "threshold": threshold},
            "created_at": datetime.now(timezone.utc).isoformat()
        })

def get_default_config(agent_type: str) -> Dict[str, Any]:
    """Get default configuration for agent type"""
    configs = {
        'sentiment': {
            "max_concurrent_tasks": 5,
            "timeout_ms": 30000,
            "confidence_threshold": 0.6,
            "language": "en"
        },
        'recommendation': {
            "max_concurrent_tasks": 10,
            "timeout_ms": 45000,
            "max_recommendations": 20,
            "categories": ["technology", "fashion", "food", "entertainment"]
        },
        'performance': {
            "max_concurrent_tasks": 15,
            "timeout_ms": 15000,
            "alert_thresholds": {
                "response_time": 3000,
                "cpu_usage": 90,
                "memory_usage": 95
            },
            "aggregation_interval": 300000
        },
        'custom': {
            "max_concurrent_tasks": 5,
            "timeout_ms": 30000
        }
    }
    return configs.get(agent_type, configs['custom'])

async def initialize_agent_tasks(agent_id: str):
    """Initialize agent tasks tracking"""
    try:
        await db.agent_tasks.insert_one({
            "_id": str(uuid.uuid4()),
            "agent_id": agent_id,
            "tasks_completed": 0,
            "tasks_failed": 0,
            "average_response_time": 0,
            "last_activity": datetime.now(timezone.utc).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    except Exception as e:
        logger.error(f"Error initializing agent tasks: {e}")

async def get_agent_stats(agent_id: str) -> Optional[Dict[str, Any]]:
    """Get agent statistics"""
    try:
        data = await db.agent_tasks.find_one({"agent_id": agent_id})
        if not data:
            return None
        
        return {
            "tasks_completed": data.get("tasks_completed", 0),
            "tasks_failed": data.get("tasks_failed", 0),
            "success_rate": calculate_success_rate(
                data.get("tasks_completed", 0),
                data.get("tasks_failed", 0)
            ),
            "average_response_time": data.get("average_response_time", 0),
            "last_activity": data.get("last_activity"),
            "uptime_percentage": calculate_uptime(
                data.get("created_at"),
                data.get("last_activity")
            )
        }
    except Exception as e:
        logger.error(f"Error getting agent stats: {e}")
        return None

def calculate_success_rate(completed: int, failed: int) -> float:
    """Calculate success rate percentage"""
    total = completed + failed
    if total == 0:
        return 0.0
    return round((completed / total) * 100, 1)

def calculate_uptime(created_at: str, last_activity: str) -> float:
    """Calculate uptime percentage"""
    if not created_at or not last_activity:
        return 0.0
    
    try:
        from dateutil.parser import parse
        now = datetime.now(timezone.utc)
        created = parse(created_at)
        last_active = parse(last_activity)
        
        total_time = (now - created).total_seconds()
        active_time = (last_active - created).total_seconds()
        
        if total_time <= 0:
            return 0.0
        
        return min(100.0, round((active_time / total_time) * 100, 1))
    except Exception:
        return 0.0

def calculate_agent_summary(agents: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Calculate summary statistics for agents"""
    if not agents:
        return {
            "total_agents": 0,
            "active_agents": 0,
            "inactive_agents": 0,
            "types": {}
        }
    
    summary = {
        "total_agents": len(agents),
        "active_agents": len([a for a in agents if a.get("status") == "active"]),
        "inactive_agents": len([a for a in agents if a.get("status") == "inactive"]),
        "error_agents": len([a for a in agents if a.get("status") == "error"]),
        "types": {}
    }
    
    # Count by type
    for agent in agents:
        agent_type = agent.get("type", "unknown")
        summary["types"][agent_type] = summary["types"].get(agent_type, 0) + 1
    
    return summary

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)