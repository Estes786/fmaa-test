import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  Bot,
  ListTodo,
  Activity,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Zap,
  Database,
  Server,
  RefreshCw
} from 'lucide-react'

// Mock data for charts
const performanceData = [
  { time: '00:00', response_time: 120, success_rate: 98, throughput: 45 },
  { time: '04:00', response_time: 110, success_rate: 99, throughput: 52 },
  { time: '08:00', response_time: 150, success_rate: 97, throughput: 78 },
  { time: '12:00', response_time: 180, success_rate: 96, throughput: 95 },
  { time: '16:00', response_time: 160, success_rate: 98, throughput: 88 },
  { time: '20:00', response_time: 140, success_rate: 99, throughput: 65 },
]

const agentTypeData = [
  { name: 'Sentiment Analysis', value: 45, color: '#8884d8' },
  { name: 'Recommendation', value: 35, color: '#82ca9d' },
  { name: 'Performance Monitor', value: 20, color: '#ffc658' },
]

const taskStatusData = [
  { status: 'Completed', count: 142, color: '#10b981' },
  { status: 'Running', count: 8, color: '#3b82f6' },
  { status: 'Failed', count: 3, color: '#ef4444' },
  { status: 'Pending', count: 12, color: '#f59e0b' },
]

function StatCard({ title, value, description, icon: Icon, trend, color = "blue" }) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-100 dark:bg-blue-900/20",
    green: "text-green-600 bg-green-100 dark:bg-green-900/20",
    yellow: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20",
    red: "text-red-600 bg-red-100 dark:bg-red-900/20",
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-green-500">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function AgentStatusCard() {
  const agents = [
    { name: 'Sentiment Analyzer', type: 'sentiment-analysis', status: 'active', uptime: '99.9%', tasks: 45 },
    { name: 'Product Recommender', type: 'recommendation', status: 'active', uptime: '98.7%', tasks: 32 },
    { name: 'Performance Monitor', type: 'performance-monitor', status: 'active', uptime: '100%', tasks: 18 },
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Active Agents
        </CardTitle>
        <CardDescription>
          Current status of all deployed agents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {agents.map((agent, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(agent.status)}
                <div>
                  <p className="font-medium">{agent.name}</p>
                  <p className="text-sm text-muted-foreground">{agent.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{agent.uptime} uptime</p>
                <p className="text-xs text-muted-foreground">{agent.tasks} tasks today</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function RecentActivity() {
  const activities = [
    { time: '2 min ago', action: 'Sentiment analysis completed', agent: 'Sentiment Analyzer', status: 'success' },
    { time: '5 min ago', action: 'Recommendation generated', agent: 'Product Recommender', status: 'success' },
    { time: '8 min ago', action: 'Performance report generated', agent: 'Performance Monitor', status: 'success' },
    { time: '12 min ago', action: 'Task failed - timeout', agent: 'Sentiment Analyzer', status: 'error' },
    { time: '15 min ago', action: 'New agent deployed', agent: 'System', status: 'info' },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'error':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      case 'info':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Latest system events and agent activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(activity.status)}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{activity.action}</p>
                <p className="text-xs text-muted-foreground">
                  {activity.agent} • {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SystemHealth() {
  const healthMetrics = [
    { name: 'CPU Usage', value: 45, max: 100, color: 'blue' },
    { name: 'Memory Usage', value: 62, max: 100, color: 'green' },
    { name: 'API Response Time', value: 150, max: 1000, color: 'yellow' },
    { name: 'Error Rate', value: 2, max: 100, color: 'red' },
  ]

  const getProgressColor = (color) => {
    switch (color) {
      case 'green':
        return 'bg-green-500'
      case 'yellow':
        return 'bg-yellow-500'
      case 'red':
        return 'bg-red-500'
      default:
        return 'bg-blue-500'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          System Health
        </CardTitle>
        <CardDescription>
          Real-time system performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {healthMetrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{metric.name}</span>
                <span className="text-sm text-muted-foreground">
                  {metric.value}{metric.name.includes('Time') ? 'ms' : '%'}
                </span>
              </div>
              <Progress 
                value={(metric.value / metric.max) * 100} 
                className="h-2"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function Dashboard({ systemStatus }) {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your FMAA ecosystem performance and status
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Agents"
          value={systemStatus.agents.total}
          description={`${systemStatus.agents.active} active agents`}
          icon={Bot}
          trend="+2 this week"
          color="blue"
        />
        <StatCard
          title="Tasks Completed"
          value="1,247"
          description="Last 24 hours"
          icon={CheckCircle}
          trend="+12% from yesterday"
          color="green"
        />
        <StatCard
          title="Avg Response Time"
          value="145ms"
          description="Across all agents"
          icon={Zap}
          trend="-5ms from last hour"
          color="yellow"
        />
        <StatCard
          title="Success Rate"
          value="98.2%"
          description="Last 24 hours"
          icon={TrendingUp}
          trend="+0.3% from yesterday"
          color="green"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>
              Response time and success rate over the last 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="response_time" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Response Time (ms)"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="success_rate" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Success Rate (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Agent Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Distribution</CardTitle>
            <CardDescription>
              Distribution of tasks by agent type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={agentTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {agentTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {agentTypeData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <AgentStatusCard />
        <RecentActivity />
        <SystemHealth />
      </div>
    </div>
  )
}

