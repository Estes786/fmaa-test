// api/agent-factory.js
const handleCors = require('../lib/cors');
const supabase = require('../lib/supabase');

module.exports = async (req, res) => {
  // Handle CORS
  if (handleCors(req, res)) return;

  try {
    // Handle based on HTTP method
    if (req.method === 'GET') {
      // Get agents with optional filtering
      const { 
        type, 
        status, 
        limit = 50, 
        offset = 0,
        include_stats = false 
      } = req.query;

      let query = supabase.from('agents').select('*');

      // Apply filters
      if (type) {
        query = query.eq('type', type);
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Enhance data with statistics if requested
      let enhancedData = data;
      if (include_stats === 'true' && data && data.length > 0) {
        enhancedData = await Promise.all(
          data.map(async (agent) => {
            const stats = await getAgentStats(agent.id);
            return {
              ...agent,
              stats
            };
          })
        );
      }

      // Calculate summary
      const summary = calculateAgentSummary(enhancedData);

      return res.status(200).json({
        status: 'success',
        data: enhancedData,
        summary,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          count: enhancedData ? enhancedData.length : 0
        }
      });
    } 
    else if (req.method === 'POST') {
      // Validate request body
      const { name, type, config = {}, description } = req.body;

      if (!name || !type) {
        return res.status(400).json({
          status: 'error',
          message: 'name and type are required'
        });
      }

      // Validate agent type
      const validTypes = ['sentiment', 'recommendation', 'performance', 'custom'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid agent type. Must be one of: ${validTypes.join(', ')}`
        });
      }

      // Create agent with enhanced configuration
      const agentData = {
        name,
        type,
        description: description || `${type} agent created via API`,
        config: {
          ...getDefaultConfig(type),
          ...config
        },
        status: 'created',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('agents')
        .insert([agentData])
        .select();

      if (error) throw error;

      // Initialize agent tasks table entry
      await initializeAgentTasks(data[0].id);

      return res.status(201).json({
        status: 'success',
        message: 'Agent created successfully',
        data: data[0]
      });
    }
    else if (req.method === 'PUT') {
      // Update agent
      const { id, name, status, config, description } = req.body;

      if (!id) {
        return res.status(400).json({
          status: 'error',
          message: 'Agent ID is required'
        });
      }

      // Validate status if provided
      if (status) {
        const validStatuses = ['created', 'active', 'inactive', 'error', 'maintenance'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            status: 'error',
            message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
          });
        }
      }

      // Build update object
      const updateData = {
        updated_at: new Date().toISOString()
      };

      if (name) updateData.name = name;
      if (status) updateData.status = status;
      if (config) updateData.config = config;
      if (description) updateData.description = description;

      const { data, error } = await supabase
        .from('agents')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Agent not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Agent updated successfully',
        data: data[0]
      });
    }
    else if (req.method === 'DELETE') {
      // Delete agent (soft delete)
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({
          status: 'error',
          message: 'Agent ID is required'
        });
      }

      // Soft delete by setting status to 'deleted'
      const { data, error } = await supabase
        .from('agents')
        .update({ 
          status: 'deleted',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Agent not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Agent deleted successfully'
      });
    }
    else {
      return res.status(405).json({
        status: 'error',
        message: 'Method not allowed. Use GET, POST, PUT, or DELETE'
      });
    }
  } catch (error) {
    console.error('Agent Factory Error:', error);

    return res.status(500).json({
      status: 'error',
      message: error.message || 'An error occurred processing your request',
      error_code: 'AGENT_FACTORY_ERROR'
    });
  }
};

// Get default configuration based on agent type
function getDefaultConfig(type) {
  const defaultConfigs = {
    sentiment: {
      max_concurrent_tasks: 5,
      timeout_ms: 30000,
      confidence_threshold: 0.6,
      language: 'en'
    },
    recommendation: {
      max_concurrent_tasks: 10,
      timeout_ms: 45000,
      max_recommendations: 20,
      categories: ['technology', 'fashion', 'food', 'entertainment']
    },
    performance: {
      max_concurrent_tasks: 15,
      timeout_ms: 15000,
      alert_thresholds: {
        response_time: 3000,
        cpu_usage: 90,
        memory_usage: 95
      },
      aggregation_interval: 300000 // 5 minutes
    },
    custom: {
      max_concurrent_tasks: 5,
      timeout_ms: 30000
    }
  };

  return defaultConfigs[type] || defaultConfigs.custom;
}

// Initialize agent tasks tracking
async function initializeAgentTasks(agentId) {
  try {
    await supabase
      .from('agent_tasks')
      .insert([{
        agent_id: agentId,
        tasks_completed: 0,
        tasks_failed: 0,
        average_response_time: 0,
        last_activity: new Date().toISOString(),
        created_at: new Date().toISOString()
      }]);
  } catch (error) {
    console.error('Error initializing agent tasks:', error);
  }
}

// Get agent statistics
async function getAgentStats(agentId) {
  try {
    const { data, error } = await supabase
      .from('agent_tasks')
      .select('*')
      .eq('agent_id', agentId)
      .single();

    if (error) {
      console.error('Error fetching agent stats:', error);
      return null;
    }

    return {
      tasks_completed: data.tasks_completed || 0,
      tasks_failed: data.tasks_failed || 0,
      success_rate: data.tasks_completed > 0 
        ? ((data.tasks_completed / (data.tasks_completed + data.tasks_failed)) * 100).toFixed(1)
        : 0,
      average_response_time: data.average_response_time || 0,
      last_activity: data.last_activity,
      uptime_percentage: calculateUptime(data.created_at, data.last_activity)
    };
  } catch (error) {
    console.error('Error in getAgentStats:', error);
    return null;
  }
}

// Calculate agent uptime percentage
function calculateUptime(createdAt, lastActivity) {
  if (!createdAt || !lastActivity) return 0;

  const now = new Date();
  const created = new Date(createdAt);
  const lastActive = new Date(lastActivity);

  const totalTime = now - created;
  const activeTime = lastActive - created;

  if (totalTime <= 0) return 0;

  return Math.min(100, (activeTime / totalTime) * 100).toFixed(1);
}

// Calculate summary statistics for agents
function calculateAgentSummary(agents) {
  if (!agents || agents.length === 0) {
    return {
      total_agents: 0,
      active_agents: 0,
      inactive_agents: 0,
      types: {}
    };
  }

  const summary = {
    total_agents: agents.length,
    active_agents: agents.filter(a => a.status === 'active').length,
    inactive_agents: agents.filter(a => a.status === 'inactive').length,
    error_agents: agents.filter(a => a.status === 'error').length,
    types: {}
  };

  // Count by type
  agents.forEach(agent => {
    summary.types[agent.type] = (summary.types[agent.type] || 0) + 1;
  });

  return summary;
}