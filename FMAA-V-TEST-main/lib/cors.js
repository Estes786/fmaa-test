// lib/cors.js
module.exports = (req, res) => {
  // Allow origins - in production, specify your domain
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://ffma-dashboard-v1.vercel.app',
    'https://your-domain.com'
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    // For development, allow all origins - change this for production
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  // Allow methods
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, DELETE, PATCH'
  );

  // Allow headers
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With, Content-Type, Accept, Authorization, X-API-Key'
  );

  // Allow credentials
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }

  return false;
};