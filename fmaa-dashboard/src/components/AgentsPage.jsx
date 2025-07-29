import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import {
  Bot,
  Plus,
  MoreHorizontal,
  Play,
  Pause,
  Settings,
  Trash2,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react'

// Mock agents data
const mockAgents = [
  {
    id: '1',
    name: 'Sentiment Analyzer Pro',
    type: 'sentiment-analysis',
    status: 'active',
    version: '1.2.0',
    created_at: '2024-01-15T10:30:00Z',
    last_health_check: '2024-01-20T14:25:00Z',
    config: {
      model: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
      max_text_length: 5000,
      batch_size: 10
    },
    metrics: {
      uptime: 99.9,
      tasks_completed: 1247,
      avg_response_time: 145,
      success_rate: 98.2,
      errors_today: 2
    }
  },
  {
    id: '2',
    name: 'Product Recommender',
    type: 'recommendation',
    status: 'active',
    version: '1.1.5',
    created_at: '2024-01-10T09:15:00Z',
    last_health_check: '2024-01-20T14:20:00Z',
    config: {
      algorithm: 'hybrid',
      num_recommendations: 5,
      similarity_threshold: 0.7
    },
    metrics: {
      uptime: 98.7,
      tasks_completed: 892,
      avg_response_time: 220,
      success_rate: 97.5,
      errors_today: 5
    }
  },
  {
    id: '3',
    name: 'System Performance Monitor',
    type: 'performance-monitor',
    status: 'active',
    version: '1.0.8',
    created_at: '2024-01-05T16:45:00Z',
    last_health_check: '2024-01-20T14:30:00Z',
    config: {
      monitoring_interval: 300,
      alert_threshold: 90,
      retention_days: 30
    },
    metrics: {
      uptime: 100,
      tasks_completed: 456,
      avg_response_time: 89,
      success_rate: 99.8,
      errors_today: 0
    }
  }
]

function AgentStatusIcon({ status }) {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'inactive':
      return <Pause className="h-4 w-4 text-gray-500" />
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />
    case 'deploying':
      return <Clock className="h-4 w-4 text-yellow-500" />
    default:
      return <AlertTriangle className="h-4 w-4 text-orange-500" />
  }
}

function AgentTypeIcon({ type }) {
  const iconProps = { className: "h-4 w-4" }
  
  switch (type) {
    case 'sentiment-analysis':
      return <Activity {...iconProps} />
    case 'recommendation':
      return <Bot {...iconProps} />
    case 'performance-monitor':
      return <Settings {...iconProps} />
    default:
      return <Bot {...iconProps} />
  }
}

function CreateAgentDialog({ onCreateAgent }) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    config: '{}'
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    try {
      const config = JSON.parse(formData.config)
      onCreateAgent({
        ...formData,
        config
      })
      setOpen(false)
      setFormData({ name: '', type: '', description: '', config: '{}' })
    } catch (error) {
      alert('Invalid JSON configuration')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Agent
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
          <DialogDescription>
            Deploy a new agent to your FMAA ecosystem
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter agent name"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="type">Agent Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select agent type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sentiment-analysis">Sentiment Analysis</SelectItem>
                  <SelectItem value="recommendation">Recommendation</SelectItem>
                  <SelectItem value="performance-monitor">Performance Monitor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this agent does"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="config">Configuration (JSON)</Label>
              <Textarea
                id="config"
                value={formData.config}
                onChange={(e) => setFormData(prev => ({ ...prev, config: e.target.value }))}
                placeholder='{"model": "default", "batch_size": 10}'
                rows={4}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Agent</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AgentCard({ agent, onAction }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'deploying':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <AgentTypeIcon type={agent.type} />
            </div>
            <div>
              <CardTitle className="text-lg">{agent.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <AgentStatusIcon status={agent.status} />
                <span className="capitalize">{agent.type.replace('-', ' ')}</span>
                <Badge variant="outline" className="text-xs">
                  v{agent.version}
                </Badge>
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(agent.status)}>
              {agent.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onAction('view', agent)}>
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction('edit', agent)}>
                  Edit Configuration
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAction('restart', agent)}>
                  Restart Agent
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onAction('delete', agent)}
                  className="text-red-600"
                >
                  Delete Agent
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Uptime</p>
              <p className="font-medium">{agent.metrics.uptime}%</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tasks</p>
              <p className="font-medium">{agent.metrics.tasks_completed.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Response Time</p>
              <p className="font-medium">{agent.metrics.avg_response_time}ms</p>
            </div>
            <div>
              <p className="text-muted-foreground">Success Rate</p>
              <p className="font-medium">{agent.metrics.success_rate}%</p>
            </div>
          </div>

          {/* Performance Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Performance</span>
              <span>{agent.metrics.success_rate}%</span>
            </div>
            <Progress value={agent.metrics.success_rate} className="h-2" />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
            <span>Created {formatDate(agent.created_at)}</span>
            <span>Last check: {formatDate(agent.last_health_check)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function AgentsPage() {
  const [agents, setAgents] = useState(mockAgents)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter
    const matchesType = typeFilter === 'all' || agent.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const handleCreateAgent = (agentData) => {
    const newAgent = {
      id: Date.now().toString(),
      ...agentData,
      status: 'deploying',
      version: '1.0.0',
      created_at: new Date().toISOString(),
      last_health_check: new Date().toISOString(),
      metrics: {
        uptime: 0,
        tasks_completed: 0,
        avg_response_time: 0,
        success_rate: 0,
        errors_today: 0
      }
    }
    
    setAgents(prev => [...prev, newAgent])
    
    // Simulate deployment
    setTimeout(() => {
      setAgents(prev => prev.map(agent => 
        agent.id === newAgent.id 
          ? { ...agent, status: 'active', metrics: { ...agent.metrics, uptime: 100, success_rate: 100 } }
          : agent
      ))
    }, 3000)
  }

  const handleAgentAction = (action, agent) => {
    switch (action) {
      case 'restart':
        setAgents(prev => prev.map(a => 
          a.id === agent.id ? { ...a, status: 'deploying' } : a
        ))
        setTimeout(() => {
          setAgents(prev => prev.map(a => 
            a.id === agent.id ? { ...a, status: 'active' } : a
          ))
        }, 2000)
        break
      case 'delete':
        if (confirm(`Are you sure you want to delete ${agent.name}?`)) {
          setAgents(prev => prev.filter(a => a.id !== agent.id))
        }
        break
      case 'view':
        // In a real app, this would open a detailed view
        alert(`Viewing details for ${agent.name}`)
        break
      case 'edit':
        // In a real app, this would open an edit dialog
        alert(`Editing configuration for ${agent.name}`)
        break
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const getStatusCounts = () => {
    return agents.reduce((acc, agent) => {
      acc[agent.status] = (acc[agent.status] || 0) + 1
      return acc
    }, {})
  }

  const statusCounts = getStatusCounts()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground">
            Manage and monitor your deployed agents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <CreateAgentDialog onCreateAgent={handleCreateAgent} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total Agents</span>
            </div>
            <p className="text-2xl font-bold mt-2">{agents.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Active</span>
            </div>
            <p className="text-2xl font-bold mt-2">{statusCounts.active || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Deploying</span>
            </div>
            <p className="text-2xl font-bold mt-2">{statusCounts.deploying || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Errors</span>
            </div>
            <p className="text-2xl font-bold mt-2">{statusCounts.error || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="deploying">Deploying</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="sentiment-analysis">Sentiment Analysis</SelectItem>
            <SelectItem value="recommendation">Recommendation</SelectItem>
            <SelectItem value="performance-monitor">Performance Monitor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Agents Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAgents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onAction={handleAgentAction}
          />
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No agents found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first agent'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
            <CreateAgentDialog onCreateAgent={handleCreateAgent} />
          )}
        </div>
      )}
    </div>
  )
}

