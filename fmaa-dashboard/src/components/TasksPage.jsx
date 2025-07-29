import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import {
  ListTodo,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  MoreHorizontal,
  Eye,
  Calendar,
  Timer,
  Activity
} from 'lucide-react'

// Mock tasks data
const mockTasks = [
  {
    id: 'task_001',
    agent_id: '1',
    agent_name: 'Sentiment Analyzer Pro',
    task_type: 'sentiment_analysis',
    status: 'completed',
    priority: 5,
    input_data: { text: 'This product is amazing! I love it so much.' },
    output_data: { label: 'positive', score: 0.95, confidence: 0.95 },
    created_at: '2024-01-20T14:30:00Z',
    started_at: '2024-01-20T14:30:05Z',
    completed_at: '2024-01-20T14:30:08Z',
    duration: 3000,
    error_message: null
  },
  {
    id: 'task_002',
    agent_id: '2',
    agent_name: 'Product Recommender',
    task_type: 'recommendation',
    status: 'running',
    priority: 3,
    input_data: { user_id: 'user_123', num_recommendations: 5 },
    output_data: null,
    created_at: '2024-01-20T14:25:00Z',
    started_at: '2024-01-20T14:25:10Z',
    completed_at: null,
    duration: null,
    error_message: null
  },
  {
    id: 'task_003',
    agent_id: '1',
    agent_name: 'Sentiment Analyzer Pro',
    task_type: 'sentiment_analysis',
    status: 'failed',
    priority: 2,
    input_data: { text: 'This is a very long text that exceeds the maximum length limit...' },
    output_data: null,
    created_at: '2024-01-20T14:20:00Z',
    started_at: '2024-01-20T14:20:05Z',
    completed_at: '2024-01-20T14:20:07Z',
    duration: 2000,
    error_message: 'Text too long. Maximum 5000 characters allowed.'
  },
  {
    id: 'task_004',
    agent_id: '3',
    agent_name: 'System Performance Monitor',
    task_type: 'performance_monitoring',
    status: 'completed',
    priority: 1,
    input_data: { timeframe: '1h', agents: ['1', '2'] },
    output_data: { report: 'System performance is optimal' },
    created_at: '2024-01-20T14:15:00Z',
    started_at: '2024-01-20T14:15:02Z',
    completed_at: '2024-01-20T14:15:45Z',
    duration: 43000,
    error_message: null
  },
  {
    id: 'task_005',
    agent_id: '2',
    agent_name: 'Product Recommender',
    task_type: 'recommendation',
    status: 'pending',
    priority: 4,
    input_data: { user_id: 'user_456', num_recommendations: 3 },
    output_data: null,
    created_at: '2024-01-20T14:35:00Z',
    started_at: null,
    completed_at: null,
    duration: null,
    error_message: null
  }
]

function TaskStatusIcon({ status }) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'running':
      return <Play className="h-4 w-4 text-blue-500" />
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />
    default:
      return <Pause className="h-4 w-4 text-gray-500" />
  }
}

function TaskDetailDialog({ task, open, onOpenChange }) {
  if (!task) return null

  const formatDuration = (ms) => {
    if (!ms) return 'N/A'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TaskStatusIcon status={task.status} />
            Task Details - {task.id}
          </DialogTitle>
          <DialogDescription>
            {task.task_type} task executed by {task.agent_name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Basic Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={task.status === 'completed' ? 'default' : 
                                task.status === 'failed' ? 'destructive' : 
                                task.status === 'running' ? 'secondary' : 'outline'}>
                    {task.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Priority:</span>
                  <span>{task.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{formatDuration(task.duration)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Timestamps</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{formatDate(task.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Started:</span>
                  <span>{formatDate(task.started_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completed:</span>
                  <span>{formatDate(task.completed_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Input Data */}
          <div>
            <h4 className="font-semibold mb-2">Input Data</h4>
            <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
              {JSON.stringify(task.input_data, null, 2)}
            </pre>
          </div>

          {/* Output Data */}
          {task.output_data && (
            <div>
              <h4 className="font-semibold mb-2">Output Data</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
                {JSON.stringify(task.output_data, null, 2)}
              </pre>
            </div>
          )}

          {/* Error Message */}
          {task.error_message && (
            <div>
              <h4 className="font-semibold mb-2 text-red-600">Error Message</h4>
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm text-red-700 dark:text-red-400">
                {task.error_message}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TasksTable({ tasks, onViewTask }) {
  const formatDuration = (ms) => {
    if (!ms) return 'N/A'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task ID</TableHead>
            <TableHead>Agent</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id}>
              <TableCell className="font-mono text-sm">{task.id}</TableCell>
              <TableCell>{task.agent_name}</TableCell>
              <TableCell className="capitalize">
                {task.task_type.replace('_', ' ')}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(task.status)}>
                  {task.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <span>{task.priority}</span>
                  {task.priority >= 4 && (
                    <span className="text-red-500">!</span>
                  )}
                </div>
              </TableCell>
              <TableCell>{formatDuration(task.duration)}</TableCell>
              <TableCell>{formatDate(task.created_at)}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewTask(task)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function TasksPage() {
  const [tasks, setTasks] = useState(mockTasks)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [agentFilter, setAgentFilter] = useState('all')
  const [selectedTask, setSelectedTask] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.agent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.task_type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesAgent = agentFilter === 'all' || task.agent_id === agentFilter
    
    return matchesSearch && matchesStatus && matchesAgent
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const getStatusCounts = () => {
    return tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    }, {})
  }

  const getUniqueAgents = () => {
    const agents = new Map()
    tasks.forEach(task => {
      agents.set(task.agent_id, task.agent_name)
    })
    return Array.from(agents.entries()).map(([id, name]) => ({ id, name }))
  }

  const statusCounts = getStatusCounts()
  const uniqueAgents = getUniqueAgents()

  // Calculate average duration for completed tasks
  const completedTasks = tasks.filter(t => t.status === 'completed' && t.duration)
  const avgDuration = completedTasks.length > 0 
    ? completedTasks.reduce((sum, t) => sum + t.duration, 0) / completedTasks.length
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">
            Monitor and manage all agent tasks
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total Tasks</span>
            </div>
            <p className="text-2xl font-bold mt-2">{tasks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <p className="text-2xl font-bold mt-2">{statusCounts.completed || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Running</span>
            </div>
            <p className="text-2xl font-bold mt-2">{statusCounts.running || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Failed</span>
            </div>
            <p className="text-2xl font-bold mt-2">{statusCounts.failed || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Avg Duration</span>
            </div>
            <p className="text-2xl font-bold mt-2">
              {avgDuration < 1000 ? `${Math.round(avgDuration)}ms` : `${(avgDuration / 1000).toFixed(1)}s`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Select value={agentFilter} onValueChange={setAgentFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agents</SelectItem>
            {uniqueAgents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Task History</CardTitle>
          <CardDescription>
            Showing {filteredTasks.length} of {tasks.length} tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTasks.length > 0 ? (
            <TasksTable 
              tasks={filteredTasks} 
              onViewTask={setSelectedTask}
            />
          ) : (
            <div className="text-center py-12">
              <ListTodo className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || agentFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Tasks will appear here when agents start processing'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Detail Dialog */}
      <TaskDetailDialog
        task={selectedTask}
        open={!!selectedTask}
        onOpenChange={(open) => !open && setSelectedTask(null)}
      />
    </div>
  )
}

