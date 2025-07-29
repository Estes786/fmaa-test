import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Cell,
  ScatterChart,
  Scatter
} from 'recharts'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Zap,
  Target,
  AlertTriangle,
  RefreshCw,
  Download,
  Calendar
} from 'lucide-react'

// Mock metrics data
const performanceData = [
  { time: '00:00', response_time: 120, success_rate: 98, throughput: 45, error_rate: 2 },
  { time: '02:00', response_time: 115, success_rate: 99, throughput: 38, error_rate: 1 },
  { time: '04:00', response_time: 110, success_rate: 99, throughput: 52, error_rate: 1 },
  { time: '06:00', response_time: 125, success_rate: 97, throughput: 68, error_rate: 3 },
  { time: '08:00', response_time: 150, success_rate: 97, throughput: 78, error_rate: 3 },
  { time: '10:00', response_time: 165, success_rate: 96, throughput: 85, error_rate: 4 },
  { time: '12:00', response_time: 180, success_rate: 96, throughput: 95, error_rate: 4 },
  { time: '14:00', response_time: 175, success_rate: 97, throughput: 92, error_rate: 3 },
  { time: '16:00', response_time: 160, success_rate: 98, throughput: 88, error_rate: 2 },
  { time: '18:00', response_time: 145, success_rate: 98, throughput: 75, error_rate: 2 },
  { time: '20:00', response_time: 140, success_rate: 99, throughput: 65, error_rate: 1 },
  { time: '22:00', response_time: 130, success_rate: 99, throughput: 55, error_rate: 1 },
]

const agentMetrics = [
  {
    agent: 'Sentiment Analyzer',
    response_time: 145,
    success_rate: 98.2,
    throughput: 1247,
    errors: 23,
    uptime: 99.9
  },
  {
    agent: 'Product Recommender',
    response_time: 220,
    success_rate: 97.5,
    throughput: 892,
    errors: 35,
    uptime: 98.7
  },
  {
    agent: 'Performance Monitor',
    response_time: 89,
    success_rate: 99.8,
    throughput: 456,
    errors: 2,
    uptime: 100
  }
]

const taskDistribution = [
  { name: 'Sentiment Analysis', value: 45, color: '#8884d8' },
  { name: 'Recommendations', value: 35, color: '#82ca9d' },
  { name: 'Performance Monitoring', value: 20, color: '#ffc658' },
]

const errorAnalysis = [
  { category: 'Timeout', count: 15, percentage: 35 },
  { category: 'Invalid Input', count: 12, percentage: 28 },
  { category: 'Rate Limit', count: 8, percentage: 19 },
  { category: 'Model Error', count: 5, percentage: 12 },
  { category: 'Network Error', count: 3, percentage: 7 },
]

const responseTimeDistribution = [
  { range: '0-100ms', count: 245, percentage: 35 },
  { range: '100-200ms', count: 312, percentage: 45 },
  { range: '200-500ms', count: 98, percentage: 14 },
  { range: '500ms+', count: 42, percentage: 6 },
]

function MetricCard({ title, value, change, icon: Icon, color = "blue", format = "number" }) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-100 dark:bg-blue-900/20",
    green: "text-green-600 bg-green-100 dark:bg-green-900/20",
    yellow: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20",
    red: "text-red-600 bg-red-100 dark:bg-red-900/20",
    purple: "text-purple-600 bg-purple-100 dark:bg-purple-900/20",
  }

  const formatValue = (val) => {
    switch (format) {
      case 'percentage':
        return `${val}%`
      case 'time':
        return `${val}ms`
      case 'number':
      default:
        return typeof val === 'number' ? val.toLocaleString() : val
    }
  }

  const isPositive = change > 0
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600'
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {change !== undefined && (
          <div className={`flex items-center mt-2 ${changeColor}`}>
            <TrendIcon className="h-3 w-3 mr-1" />
            <span className="text-xs">
              {Math.abs(change)}% from last period
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PerformanceChart({ data, timeframe }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Trends</CardTitle>
        <CardDescription>
          Response time, success rate, and throughput over {timeframe}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
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
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="throughput" 
              stroke="#ffc658" 
              strokeWidth={2}
              name="Throughput"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function AgentComparisonChart({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Performance Comparison</CardTitle>
        <CardDescription>
          Compare key metrics across all agents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="agent" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="response_time" fill="#8884d8" name="Response Time (ms)" />
            <Bar dataKey="throughput" fill="#82ca9d" name="Throughput" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function TaskDistributionChart({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Distribution</CardTitle>
        <CardDescription>
          Distribution of tasks by type
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-4">
          {data.map((entry, index) => (
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
  )
}

function ErrorAnalysisChart({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Analysis</CardTitle>
        <CardDescription>
          Breakdown of errors by category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{item.count}</span>
                  <Badge variant="outline">{item.percentage}%</Badge>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full" 
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ResponseTimeDistribution({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Response Time Distribution</CardTitle>
        <CardDescription>
          Distribution of response times across all requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function AgentMetricsTable({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Metrics Summary</CardTitle>
        <CardDescription>
          Detailed metrics for each agent
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Agent</th>
                <th className="text-right p-2">Response Time</th>
                <th className="text-right p-2">Success Rate</th>
                <th className="text-right p-2">Throughput</th>
                <th className="text-right p-2">Errors</th>
                <th className="text-right p-2">Uptime</th>
              </tr>
            </thead>
            <tbody>
              {data.map((agent, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2 font-medium">{agent.agent}</td>
                  <td className="p-2 text-right">{agent.response_time}ms</td>
                  <td className="p-2 text-right">{agent.success_rate}%</td>
                  <td className="p-2 text-right">{agent.throughput.toLocaleString()}</td>
                  <td className="p-2 text-right">{agent.errors}</td>
                  <td className="p-2 text-right">{agent.uptime}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

export function MetricsPage() {
  const [timeframe, setTimeframe] = useState('24h')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const handleExport = () => {
    // In a real app, this would export the metrics data
    alert('Exporting metrics data...')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Metrics</h1>
          <p className="text-muted-foreground">
            Performance analytics and insights for your FMAA ecosystem
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Avg Response Time"
          value={152}
          change={-5.2}
          icon={Clock}
          color="blue"
          format="time"
        />
        <MetricCard
          title="Success Rate"
          value={98.1}
          change={0.3}
          icon={Target}
          color="green"
          format="percentage"
        />
        <MetricCard
          title="Total Requests"
          value={2847}
          change={12.5}
          icon={Activity}
          color="purple"
        />
        <MetricCard
          title="Throughput"
          value={78}
          change={8.2}
          icon={Zap}
          color="yellow"
        />
        <MetricCard
          title="Error Rate"
          value={1.9}
          change={-0.5}
          icon={AlertTriangle}
          color="red"
          format="percentage"
        />
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <PerformanceChart data={performanceData} timeframe={timeframe} />
          <div className="grid gap-6 lg:grid-cols-2">
            <AgentComparisonChart data={agentMetrics} />
            <TaskDistributionChart data={taskDistribution} />
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <AgentMetricsTable data={agentMetrics} />
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Agent Uptime</CardTitle>
                <CardDescription>
                  Uptime percentage for each agent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={agentMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="agent" />
                    <YAxis domain={[95, 100]} />
                    <Tooltip />
                    <Bar dataKey="uptime" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Success Rate Comparison</CardTitle>
                <CardDescription>
                  Success rate across all agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={agentMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="agent" />
                    <YAxis domain={[95, 100]} />
                    <Tooltip />
                    <Bar dataKey="success_rate" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ErrorAnalysisChart data={errorAnalysis} />
            <Card>
              <CardHeader>
                <CardTitle>Error Trends</CardTitle>
                <CardDescription>
                  Error rate over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="error_rate" 
                      stroke="#ef4444" 
                      fill="#ef4444" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ResponseTimeDistribution data={responseTimeDistribution} />
            <Card>
              <CardHeader>
                <CardTitle>Load Distribution</CardTitle>
                <CardDescription>
                  Request load across different time periods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="throughput" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

