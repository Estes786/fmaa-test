// api/recommendation-agent.js
const handleCors = require('../lib/cors');
const supabase = require('../lib/supabase');

module.exports = async (req, res) => {
  // Handle CORS
  if (handleCors(req, res)) return;

  try {
    // Handle based on HTTP method
    if (req.method === 'GET') {
      // Get category parameter
      const { category, user_id, limit = 20, offset = 0 } = req.query;

      // Get recommendations, filter by category if provided
      let query = supabase.from('user_recommendations').select(`
        *,
        agents!inner(name, type, status)
      `);

      if (category) {
        query = query.eq('category', category);
      }

      if (user_id) {
        query = query.eq('user_id', user_id);
      }

      const { data, error } = await query
        .order('rating', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

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
      const { user_id, item_id, category, preferences = {} } = req.body;

      if (!user_id || !category) {
        return res.status(400).json({
          status: 'error',
          message: 'user_id and category are required'
        });
      }

      // Generate recommendations
      const recommendations = await generateRecommendation(category, preferences);

      // Save to database
      const insertData = recommendations.map(rec => ({
        user_id,
        item_id: rec.id,
        category,
        title: rec.title || rec.name,
        description: rec.description,
        rating: rec.rating,
        price: rec.price || null,
        recommendation_score: rec.score,
        metadata: rec,
        created_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('user_recommendations')
        .insert(insertData)
        .select();

      if (error) throw error;

      return res.status(200).json({
        status: 'success',
        message: `Generated ${recommendations.length} recommendations`,
        data: {
          user_id,
          category,
          recommendations,
          total_generated: recommendations.length
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
    console.error('Recommendation Agent Error:', error);

    return res.status(500).json({
      status: 'error',
      message: error.message || 'An error occurred processing your request',
      error_code: 'RECOMMENDATION_ERROR'
    });
  }
};

// Enhanced recommendation generation function
async function generateRecommendation(category, preferences = {}) {
  const recommendations = {
    'technology': [
      { 
        id: 'tech_001', 
        name: 'iPhone 15 Pro Max', 
        title: 'Latest iPhone with Advanced Camera',
        description: 'Experience the most advanced iPhone with pro camera system and A17 Pro chip',
        price: 1199, 
        rating: 4.8, 
        category: 'smartphone',
        score: 95,
        features: ['A17 Pro Chip', '48MP Camera', 'Titanium Design']
      },
      { 
        id: 'tech_002', 
        name: 'MacBook Air M3', 
        title: 'Ultra-thin Laptop with M3 Chip',
        description: 'Incredibly thin and powerful laptop for professionals and students',
        price: 1299, 
        rating: 4.7, 
        category: 'laptop',
        score: 92,
        features: ['M3 Chip', '18hr Battery', 'Liquid Retina Display']
      },
      { 
        id: 'tech_003', 
        name: 'iPad Pro 12.9"', 
        title: 'Professional Tablet for Creative Work',
        description: 'The ultimate iPad for creative professionals and power users',
        price: 1099, 
        rating: 4.6, 
        category: 'tablet',
        score: 89,
        features: ['M2 Chip', 'Liquid Retina XDR', 'Apple Pencil Support']
      }
    ],
    'fashion': [
      { 
        id: 'fashion_001', 
        name: 'Nike Air Jordan 1', 
        title: 'Classic Basketball Shoes',
        description: 'Iconic basketball shoes with timeless style and comfort',
        price: 170, 
        rating: 4.5, 
        category: 'shoes',
        score: 88,
        features: ['Leather Upper', 'Air Sole Unit', 'Classic Design']
      },
      { 
        id: 'fashion_002', 
        name: 'Levi\'s 501 Original', 
        title: 'Classic Straight Leg Jeans',
        description: 'The original straight leg jeans that started it all',
        price: 98, 
        rating: 4.4, 
        category: 'jeans',
        score: 85,
        features: ['100% Cotton', 'Button Fly', 'Classic Fit']
      },
      { 
        id: 'fashion_003', 
        name: 'Ray-Ban Aviator', 
        title: 'Classic Aviator Sunglasses',
        description: 'Iconic sunglasses worn by pilots and style icons',
        price: 154, 
        rating: 4.6, 
        category: 'accessories',
        score: 90,
        features: ['UV Protection', 'Metal Frame', 'Classic Design']
      }
    ],
    'food': [
      { 
        id: 'food_001', 
        name: 'Margherita Pizza', 
        title: 'Classic Italian Pizza',
        description: 'Traditional pizza with fresh mozzarella, tomato sauce, and basil',
        price: 16, 
        rating: 4.5, 
        category: 'italian',
        score: 87,
        features: ['Fresh Mozzarella', 'San Marzano Tomatoes', 'Fresh Basil']
      },
      { 
        id: 'food_002', 
        name: 'Salmon Sushi Set', 
        title: 'Premium Sushi Selection',
        description: 'Fresh salmon sushi and sashimi with wasabi and pickled ginger',
        price: 32, 
        rating: 4.8, 
        category: 'japanese',
        score: 93,
        features: ['Fresh Salmon', 'Sushi Rice', 'Traditional Preparation']
      },
      { 
        id: 'food_003', 
        name: 'Wagyu Burger', 
        title: 'Premium Beef Burger',
        description: 'Gourmet burger made with premium wagyu beef and artisanal bun',
        price: 28, 
        rating: 4.7, 
        category: 'american',
        score: 91,
        features: ['Wagyu Beef', 'Artisanal Bun', 'Gourmet Toppings']
      }
    ],
    'entertainment': [
      { 
        id: 'ent_001', 
        name: 'Netflix Premium', 
        title: 'Unlimited Streaming Service',
        description: 'Access to thousands of movies, TV shows, and documentaries',
        price: 15.99, 
        rating: 4.3, 
        category: 'streaming',
        score: 85,
        features: ['4K Streaming', 'Multiple Devices', 'Original Content']
      },
      { 
        id: 'ent_002', 
        name: 'Spotify Premium', 
        title: 'Music Streaming Service',
        description: 'Ad-free music streaming with offline downloads',
        price: 9.99, 
        rating: 4.5, 
        category: 'music',
        score: 88,
        features: ['Ad-Free', 'Offline Mode', '70M+ Songs']
      }
    ]
  };

  let categoryRecommendations = recommendations[category] || [];

  // Apply preferences filtering
  if (preferences.max_price) {
    categoryRecommendations = categoryRecommendations.filter(item => 
      !item.price || item.price <= preferences.max_price
    );
  }

  if (preferences.min_rating) {
    categoryRecommendations = categoryRecommendations.filter(item => 
      item.rating >= preferences.min_rating
    );
  }

  // Sort by score (highest first)
  categoryRecommendations.sort((a, b) => b.score - a.score);

  return categoryRecommendations;
}