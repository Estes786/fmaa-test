// api/performance-monitor.js
const handleCors = require('../lib/cors');
const supabase = require('../lib/supabase');

module.exports = async (req, res) => {
  // Handle CORS
  if (handleCors(req, res)) return;

  try {
    // Handle based on HTTP method
    if (req.method === 'GET') {
      // Get metrics data with filtering options
      const { 
        service, 
        metric_type, 
        start_date, 
        end_date, 
        limit = 100, 
        offset = 0,
        aggregation = 'raw' // raw, hourly, daily
      } = req.query;

      let query = supabase.from('performance_metrics').select('*');

      // Apply filters
      if (service) {
        query = query.eq('service', service);
      }

      if (metric_type) {
        query = query.eq('metric_type', metric_type);
      }

      if (start_date) {
        query = query.gte('timestamp', start_date);
      }

      if (end_date) {
        query = query.lte('timestamp', end_date);
      }

      const { data, error } = await query
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Process data based on aggregation type
      let processedData = data;
      if (aggregation !== 'raw' && data && data.length > 0) {
        processedData = aggregateMetrics(data, aggregation);
      }

      // Calculate summary statistics
      const summary = calculateSummaryStats(processedData);

      return res.status(200).json({
        status: 'success',
        data: processedData,
        summary,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          count: processedData ? processedData.length : 0
        },
        filters_applied: {
          service,
          metric_type,
          start_date,
          end_date,
          aggregation
        }
      });
    } 
    else if (req.method === 'POST') {
      // Validate request body
      const { service, metric_type, value, metadata = {} } = req.body;

      if (!service || !metric_type || value === undefined) {
        return res.status(400).json({
          status: 'error',
          message: 'service, metric_type, and value are required'
        });
      }

      // Validate value is numeric
      if (typeof value !== 'number') {
        return res.status(400).json({
          status: 'error',
          message: 'value must be a number'
        });
      }

      const timestamp = new Date().toISOString();

      // Calculate additional metrics
      const enhancedMetadata = {
        ...metadata,
        recorded_at: timestamp,
        source: 'api',
        version: '1.0'
      };

      // Save to database
      const { data, error } = await supabase
        .from('performance_metrics')
        .insert([{ 
          service, 
          metric_type, 
          value,
          timestamp,
          metadata: enhancedMetadata
        }])
        .select();

      if (error) throw error;

      // Update real-time alerts if needed
      await checkPerformanceAlerts(service, metric_type, value);

      return res.status(200).json({
        status: 'success',
        message: 'Performance metric recorded successfully',
        data: {
          id: data[0]?.id,
          service,
          metric_type,
          value,
          timestamp,
          metadata: enhancedMetadata
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
    console.error('Performance Monitor Error:', error);

    return res.status(500).json({
      status: 'error',
      message: error.message || 'An error occurred processing your request',
      error_code: 'PERFORMANCE_MONITOR_ERROR'
    });
  }
};

// Aggregate metrics by time period
function aggregateMetrics(data, aggregation) {
  if (!data || data.length === 0) return [];

  const grouped = {};

  data.forEach(metric => {
    const date = new Date(metric.timestamp);
    let groupKey;

    if (aggregation === 'hourly') {
      groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
    } else if (aggregation === 'daily') {
      groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    if (!grouped[groupKey]) {
      grouped[groupKey] = {
        timestamp: groupKey,
        service: metric.service,
        metric_type: metric.metric_type,
        values: [],
        count: 0
      };
    }

    grouped[groupKey].values.push(metric.value);
    grouped[groupKey].count++;
  });

  // Calculate aggregated values
  return Object.values(grouped).map(group => ({
    ...group,
    value: group.values.reduce((sum, val) => sum + val, 0) / group.values.length, // Average
    min_value: Math.min(...group.values),
    max_value: Math.max(...group.values),
    sum_value: group.values.reduce((sum, val) => sum + val, 0)
  }));
}

// Calculate summary statistics
function calculateSummaryStats(data) {
  if (!data || data.length === 0) {
    return {
      total_records: 0,
      average_value: 0,
      min_value: 0,
      max_value: 0
    };
  }

  const values = data.map(d => d.value).filter(v => typeof v === 'number');

  if (values.length === 0) {
    return {
      total_records: data.length,
      average_value: 0,
      min_value: 0,
      max_value: 0
    };
  }

  return {
    total_records: data.length,
    average_value: parseFloat((values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(2)),
    min_value: Math.min(...values),
    max_value: Math.max(...values),
    latest_timestamp: data[0]?.timestamp,
    oldest_timestamp: data[data.length - 1]?.timestamp
  };
}

// Check for performance alerts
async function checkPerformanceAlerts(service, metric_type, value) {
  // Define alert thresholds
  const thresholds = {
    'response_time': { warning: 1000, critical: 3000 },
    'cpu_usage': { warning: 70, critical: 90 },
    'memory_usage': { warning: 80, critical: 95 },
    'error_rate': { warning: 5, critical: 10 },
    'throughput': { warning: 10, critical: 5 } // Lower is worse for throughput
  };

  const threshold = thresholds[metric_type];
  if (!threshold) return;

  let alertLevel = null;

  if (metric_type === 'throughput') {
    // For throughput, lower values are worse
    if (value <= threshold.critical) alertLevel = 'critical';
    else if (value <= threshold.warning) alertLevel = 'warning';
  } else {
    // For other metrics, higher values are worse
    if (value >= threshold.critical) alertLevel = 'critical';
    else if (value >= threshold.warning) alertLevel = 'warning';
  }

  if (alertLevel) {
    console.warn(`PERFORMANCE ALERT [${alertLevel.toUpperCase()}]: ${service} ${metric_type} = ${value}`);

    // Here you could implement additional alerting logic:
    // - Send notifications
    // - Log to external monitoring systems
    // - Trigger automated responses

    try {
      await supabase.from('system_logs').insert([{
        level: alertLevel,
        service,
        message: `Performance alert: ${metric_type} = ${value}`,
        metadata: { metric_type, value, threshold },
        created_at: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error logging performance alert:', error);
    }
  }
}