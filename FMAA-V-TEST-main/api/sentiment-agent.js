// api/sentiment-agent.js
const handleCors = require('../lib/cors');
const supabase = require('../lib/supabase');

module.exports = async (req, res) => {
  // Handle CORS
  if (handleCors(req, res)) return;

  try {
    // Handle based on HTTP method
    if (req.method === 'GET') {
      // Get sentiment data with optional filtering
      const { limit = 50, offset = 0, text_filter } = req.query;

      let query = supabase
        .from('sentiment_analyses')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (text_filter) {
        query = query.ilike('text', `%${text_filter}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return res.status(200).json({
        status: 'success',
        data,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          count: data ? data.length : 0
        }
      });
    } 
    else if (req.method === 'POST') {
      // Validate request body
      const { text } = req.body;
      if (!text || text.trim().length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Text is required and cannot be empty'
        });
      }

      if (text.length > 5000) {
        return res.status(400).json({
          status: 'error',
          message: 'Text cannot exceed 5000 characters'
        });
      }

      // Perform sentiment analysis
      const sentiment = analyzeSentiment(text);

      // Save to database
      const { data, error } = await supabase
        .from('sentiment_analyses')
        .insert([{ 
          text, 
          sentiment: sentiment.sentiment,
          score: sentiment.score,
          confidence: sentiment.confidence,
          keywords: sentiment.keywords,
          created_at: new Date().toISOString() 
        }])
        .select();

      if (error) throw error;

      return res.status(200).json({
        status: 'success',
        data: {
          id: data[0]?.id,
          text,
          sentiment: sentiment.sentiment,
          score: sentiment.score,
          confidence: sentiment.confidence,
          keywords: sentiment.keywords,
          analysis_time: new Date().toISOString()
        }
      });
    } 
    else {
      return res.status(405).json({
        status: 'error',
        message: 'Method not allowed. Use GET or POST'
      });
    }
  } catch (error) {
    console.error('Sentiment Agent Error:', error);

    return res.status(500).json({
      status: 'error',
      message: error.message || 'An error occurred processing your request',
      error_code: 'SENTIMENT_ANALYSIS_ERROR'
    });
  }
};

// Enhanced sentiment analysis function
function analyzeSentiment(text) {
  const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'awesome', 'fantastic', 'wonderful',
    'happy', 'joy', 'love', 'best', 'perfect', 'outstanding', 'brilliant',
    'superb', 'marvelous', 'incredible', 'terrific', 'fabulous', 'impressive'
  ];

  const negativeWords = [
    'bad', 'worst', 'terrible', 'awful', 'horrible', 'disgusting', 'hate',
    'sad', 'angry', 'frustrated', 'disappointed', 'poor', 'pathetic',
    'useless', 'worthless', 'disaster', 'nightmare', 'ridiculous', 'annoying'
  ];

  const neutralWords = [
    'okay', 'fine', 'normal', 'average', 'standard', 'typical', 'regular',
    'moderate', 'acceptable', 'adequate'
  ];

  let score = 0;
  let totalWords = 0;
  const keywords = [];
  const words = text.toLowerCase().split(/\s+/);

  words.forEach(word => {
    // Remove punctuation
    const cleanWord = word.replace(/[^\w]/g, '');
    totalWords++;

    if (positiveWords.includes(cleanWord)) {
      score += 1;
      keywords.push({ word: cleanWord, sentiment: 'positive' });
    } else if (negativeWords.includes(cleanWord)) {
      score -= 1;
      keywords.push({ word: cleanWord, sentiment: 'negative' });
    } else if (neutralWords.includes(cleanWord)) {
      keywords.push({ word: cleanWord, sentiment: 'neutral' });
    }
  });

  // Normalize score
  const normalizedScore = totalWords > 0 ? score / totalWords : 0;

  // Determine sentiment
  let sentiment;
  let confidence;

  if (normalizedScore > 0.1) {
    sentiment = 'positive';
    confidence = Math.min(normalizedScore * 100, 95);
  } else if (normalizedScore < -0.1) {
    sentiment = 'negative';
    confidence = Math.min(Math.abs(normalizedScore) * 100, 95);
  } else {
    sentiment = 'neutral';
    confidence = 60 + Math.random() * 20; // Random confidence for neutral
  }

  return {
    score: parseFloat(normalizedScore.toFixed(3)),
    sentiment,
    confidence: parseFloat(confidence.toFixed(1)),
    keywords: keywords.slice(0, 10) // Limit to top 10 keywords
  };
}