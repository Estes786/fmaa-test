import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  FileText,
  Search,
  Filter,
  RefreshCw,
  Download,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Calendar
} from 'lucide-react'

// Mock logs data
const mockLogs = [
  {
    id: 'log_001',
    timestamp: '2024-01-20T14:30:15.123Z',
    level: 'info',
    agent_id: '1',
    agent_name: 'Sentiment Analyzer Pro',
    message: 'Sentiment analysis completed successfully',
    context: {
      task_id: 'task_001',
      response_time: 145,
      input_length: 25,
      sentiment: 'positive',
      confidence: 0.95
    }
  },
  {
    id: 'log_002',
    timestamp: '2024-01-20T14:28:42.456Z',
    level: 'error',
    agent_id: '1',
    agent_name: 'Sentiment Analyzer Pro',
    message: 'Text length exceeds maximum limit',
    context: {
      task_id: 'task_003',
      error_code: 'TEXT_TOO_LONG',
      input_length: 5500,
      max_length: 5000
    }
  },
  {
    id: 'log_003',
    timestamp: '2024-01-20T14:25:30.789Z',
    level: 'info',
    agent_id: '2',
    agent_name: 'Product Recommender',
    message: 'Recommendation generation started',
    context: {
      task_id: 'task_002',
      user_id: 'user_123',
      algorithm: 'hybrid',
      num_recommendations: 5
    }
  },
  {
    id: 'log_004',
    timestamp: '2024-01-20T14:20:18.234Z',
    level: 'warn',
    agent_id: '3',
    agent_name: 'System Performance Monitor',
    message: 'High response time detected',
    context: {
      agent_id: '1',
      response_time: 850,
      threshold: 500,
      alert_level: 'warning'
    }
  },
  {
    id: 'log_005',
    timestamp: '2024-01-20T14:15:45.567Z',
    level: 'info',
    agent_id: '3',
    agent_name: 'System Performance Monitor',
    message: 'Performance monitoring report generated',
    context: {
      task_id: 'task_004',
      timeframe: '1h',
      agents_monitored: 2,
      issues_found: 1
    }
  },
  {
    id: 'log_006',
    timestamp: '2024-01-20T14:10:22.890Z',
    level: 'error',
    agent_id: '2',
    agent_name: 'Product Recommender',
    message: 'Failed to connect to recommendation model',
    context: {
      error_code: 'CONNECTION_TIMEOUT',
      model_endpoint: 'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2',
      timeout: 30000
    }
  },
  {
    id: 'log_007',
    timestamp: '2024-01-20T14:05:11.345Z',
    level: 'info',
    agent_id: '1',
    agent_name: 'Sentiment Analyzer Pro',
    message: 'Agent health check completed',
    context: {
      status: 'healthy',
      response_time: 120,
      dependencies: {
        huggingface_api: 'ok',
        database: 'ok'
      }
    }
  }
]

function LogLevelIcon({ level }) {
  switch (level) {
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />
    case 'warn':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    case 'info':
      return <Info className="h-4 w-4 text-blue-500" />
    case 'debug':
      return <CheckCircle className="h-4 w-4 text-gray-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

function LogDetailDialog({ log, open, onOpenChange }) {
  if (!log) return null

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogLevelIcon level={log.level} />
            Log Details - {log.id}
          </DialogTitle>
          <DialogDescription>
            {log.level.toUpperCase()} log from {log.agent_name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Basic Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Level:</span>
                  <Badge variant={log.level === 'error' ? 'destructive' : 
                                log.level === 'warn' ? 'secondary' : 'default'}>
                    {log.level.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Agent:</span>
                  <span>{log.agent_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Timestamp:</span>
                  <span>{formatDate(log.timestamp)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Message</h4>
              <p className="text-sm bg-muted p-3 rounded-lg">
                {log.message}
              </p>
            </div>
          </div>

          {/* Context Data */}
          {log.context && (
            <div>
              <h4 className="font-semibold mb-2">Context Data</h4>
              <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
                {JSON.stringify(log.context, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function LogsTable({ logs, onViewLog }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getLevelColor = (level) => {
    switch (level) {
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'warn':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'debug':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Agent</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-mono text-sm">
                {formatDate(log.timestamp)}
              </TableCell>
              <TableCell>
                <Badge className={getLevelColor(log.level)}>
                  {log.level.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>{log.agent_name}</TableCell>
              <TableCell className="max-w-md truncate">
                {log.message}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewLog(log)}
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

export function LogsPage() {
  const [logs, setLogs] = useState(mockLogs)
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [agentFilter, setAgentFilter] = useState('all')
  const [timeFilter, setTimeFilter] = useState('24h')
  const [selectedLog, setSelectedLog] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.agent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter
    const matchesAgent = agentFilter === 'all' || log.agent_id === agentFilter
    
    // Time filter logic would be implemented here
    return matchesSearch && matchesLevel && matchesAgent
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const handleExport = () => {
    // In a real app, this would export the logs
    const dataStr = JSON.stringify(filteredLogs, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `fmaa-logs-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  const getLevelCounts = () => {
    return logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1
      return acc
    }, {})
  }

  const getUniqueAgents = () => {
    const agents = new Map()
    logs.forEach(log => {
      agents.set(log.agent_id, log.agent_name)
    })
    return Array.from(agents.entries()).map(([id, name]) => ({ id, name }))
  }

  const levelCounts = getLevelCounts()
  const uniqueAgents = getUniqueAgents()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Logs</h1>
          <p className="text-muted-foreground">
            System logs and agent activity monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total Logs</span>
            </div>
            <p className="text-2xl font-bold mt-2">{logs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Errors</span>
            </div>
            <p className="text-2xl font-bold mt-2">{levelCounts.error || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Warnings</span>
            </div>
            <p className="text-2xl font-bold mt-2">{levelCounts.warn || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Info</span>
            </div>
            <p className="text-2xl font-bold mt-2">{levelCounts.info || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Debug</span>
            </div>
            <p className="text-2xl font-bold mt-2">{levelCounts.debug || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="warn">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="debug">Debug</SelectItem>
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

        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last Hour</SelectItem>
            <SelectItem value="24h">Last 24h</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>System Logs</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {logs.length} logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs.length > 0 ? (
            <LogsTable 
              logs={filteredLogs} 
              onViewLog={setSelectedLog}
            />
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No logs found</h3>
              <p className="text-muted-foreground">
                {searchTerm || levelFilter !== 'all' || agentFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Logs will appear here as agents generate activity'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Detail Dialog */}
      <LogDetailDialog
        log={selectedLog}
        open={!!selectedLog}
        onOpenChange={(open) => !open && setSelectedLog(null)}
      />
    </div>
  )
}

