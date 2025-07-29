// API configuration and helper functions
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';

class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Sentiment Analysis API
  async getSentimentAnalyses(params = {}) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/api/sentiment-agent?${searchParams}`);
  }

  async analyzeSentiment(text) {
    return this.request('/api/sentiment-agent', {
      method: 'POST',
      body: { text },
    });
  }

  // Recommendations API
  async getRecommendations(params = {}) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/api/recommendation-agent?${searchParams}`);
  }

  async generateRecommendations(data) {
    return this.request('/api/recommendation-agent', {
      method: 'POST',
      body: data,
    });
  }

  // Performance Metrics API
  async getPerformanceMetrics(params = {}) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/api/performance-monitor?${searchParams}`);
  }

  async recordPerformanceMetric(data) {
    return this.request('/api/performance-monitor', {
      method: 'POST',
      body: data,
    });
  }

  // Agent Factory API
  async getAgents(params = {}) {
    const searchParams = new URLSearchParams(params);
    return this.request(`/api/agent-factory?${searchParams}`);
  }

  async createAgent(data) {
    return this.request('/api/agent-factory', {
      method: 'POST',
      body: data,
    });
  }

  async updateAgent(data) {
    return this.request('/api/agent-factory', {
      method: 'PUT',
      body: data,
    });
  }

  async deleteAgent(id) {
    return this.request('/api/agent-factory', {
      method: 'DELETE',
      body: { id },
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/api/health');
  }
}

export const apiClient = new ApiClient();
export default apiClient;