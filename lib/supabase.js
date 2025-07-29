// lib/supabase.js
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

// Supabase URL and Anon Key from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Verify that environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Supabase URL or Anon Key not found in environment variables');
  console.error('Please make sure SUPABASE_URL and SUPABASE_ANON_KEY are set');
}

// Create Supabase client with enhanced configuration
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'x-application-name': 'ffma-dashboard'
    }
  }
});

// Test connection function
async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Supabase connection test failed:', error.message);
      return false;
    }

    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error.message);
    return false;
  }
}

// Initialize connection test in development
if (process.env.NODE_ENV !== 'production') {
  testConnection();
}

module.exports = supabase;