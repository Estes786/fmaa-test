import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
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
  Settings,
  Save,
  RefreshCw,
  Key,
  Database,
  Bell,
  Shield,
  Monitor,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'

// Mock settings data
const initialSettings = {
  general: {
    system_name: 'FMAA Production',
    description: 'Federated Micro-Agents Architecture for financial analytics',
    timezone: 'UTC',
    log_level: 'info',
    max_concurrent_tasks: 100,
    task_timeout: 300000,
    health_check_interval: 30000
  },
  api: {
    huggingface_token: 'hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    openai_api_key: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    rate_limit_per_minute: 60,
    enable_cors: true,
    api_version: 'v1'
  },
  database: {
    host: 'localhost',
    port: 5432,
    database: 'fmaa_db',
    username: 'fmaa_user',
    password: '••••••••••••',
    max_connections: 20,
    connection_timeout: 30000
  },
  notifications: {
    email_enabled: true,
    email_smtp_host: 'smtp.gmail.com',
    email_smtp_port: 587,
    email_username: 'alerts@fmaa.com',
    email_password: '••••••••••••',
    slack_webhook_url: 'https://hooks.slack.com/services/...',
    alert_on_errors: true,
    alert_on_high_response_time: true,
    response_time_threshold: 1000
  },
  security: {
    enable_authentication: true,
    session_timeout: 3600000,
    max_login_attempts: 5,
    enable_rate_limiting: true,
    enable_audit_logging: true,
    allowed_origins: ['http://localhost:3000', 'https://fmaa.example.com']
  },
  monitoring: {
    enable_metrics_collection: true,
    metrics_retention_days: 30,
    enable_performance_alerts: true,
    cpu_threshold: 80,
    memory_threshold: 85,
    disk_threshold: 90
  }
}

function PasswordField({ value, onChange, placeholder }) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <Input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pr-10"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}

function ApiKeyField({ value, onChange, placeholder }) {
  const [showKey, setShowKey] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value)
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Input
          type={showKey ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="pr-20"
        />
        <div className="absolute right-0 top-0 h-full flex">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="px-2 hover:bg-transparent"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="px-2 hover:bg-transparent"
            onClick={copyToClipboard}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}

function ResetDialog({ title, description, onConfirm }) {
  const [open, setOpen] = useState(false)

  const handleConfirm = () => {
    onConfirm()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Reset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SettingsPage() {
  const [settings, setSettings] = useState(initialSettings)
  const [isSaving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)

  const updateSetting = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLastSaved(new Date())
    setSaving(false)
  }

  const handleReset = (section) => {
    setSettings(prev => ({
      ...prev,
      [section]: initialSettings[section]
    }))
  }

  const testConnection = async (type) => {
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000))
    alert(`${type} connection test completed successfully!`)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your FMAA ecosystem settings and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Basic system configuration and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="system_name">System Name</Label>
                  <Input
                    id="system_name"
                    value={settings.general.system_name}
                    onChange={(e) => updateSetting('general', 'system_name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={settings.general.timezone}
                    onValueChange={(value) => updateSetting('general', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={settings.general.description}
                  onChange={(e) => updateSetting('general', 'description', e.target.value)}
                  rows={3}
                />
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="log_level">Log Level</Label>
                  <Select 
                    value={settings.general.log_level}
                    onValueChange={(value) => updateSetting('general', 'log_level', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debug">Debug</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_concurrent_tasks">Max Concurrent Tasks</Label>
                  <Input
                    id="max_concurrent_tasks"
                    type="number"
                    value={settings.general.max_concurrent_tasks}
                    onChange={(e) => updateSetting('general', 'max_concurrent_tasks', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task_timeout">Task Timeout (ms)</Label>
                  <Input
                    id="task_timeout"
                    type="number"
                    value={settings.general.task_timeout}
                    onChange={(e) => updateSetting('general', 'task_timeout', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <ResetDialog
                  title="Reset General Settings"
                  description="This will reset all general settings to their default values. This action cannot be undone."
                  onConfirm={() => handleReset('general')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Configure external API keys and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="huggingface_token">Hugging Face Token</Label>
                  <ApiKeyField
                    value={settings.api.huggingface_token}
                    onChange={(e) => updateSetting('api', 'huggingface_token', e.target.value)}
                    placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                  <p className="text-xs text-muted-foreground">
                    Required for sentiment analysis and other NLP models
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="openai_api_key">OpenAI API Key</Label>
                  <ApiKeyField
                    value={settings.api.openai_api_key}
                    onChange={(e) => updateSetting('api', 'openai_api_key', e.target.value)}
                    placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional: For advanced language model features
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rate_limit">Rate Limit (per minute)</Label>
                  <Input
                    id="rate_limit"
                    type="number"
                    value={settings.api.rate_limit_per_minute}
                    onChange={(e) => updateSetting('api', 'rate_limit_per_minute', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="api_version">API Version</Label>
                  <Select 
                    value={settings.api.api_version}
                    onValueChange={(value) => updateSetting('api', 'api_version', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="v1">v1</SelectItem>
                      <SelectItem value="v2">v2 (Beta)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enable_cors"
                  checked={settings.api.enable_cors}
                  onCheckedChange={(checked) => updateSetting('api', 'enable_cors', checked)}
                />
                <Label htmlFor="enable_cors">Enable CORS</Label>
              </div>

              <div className="flex justify-end">
                <ResetDialog
                  title="Reset API Settings"
                  description="This will reset all API settings to their default values. API keys will be cleared."
                  onConfirm={() => handleReset('api')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database */}
        <TabsContent value="database">
          <Card>
            <CardHeader>
              <CardTitle>Database Configuration</CardTitle>
              <CardDescription>
                Configure database connection and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="db_host">Host</Label>
                  <Input
                    id="db_host"
                    value={settings.database.host}
                    onChange={(e) => updateSetting('database', 'host', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="db_port">Port</Label>
                  <Input
                    id="db_port"
                    type="number"
                    value={settings.database.port}
                    onChange={(e) => updateSetting('database', 'port', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="db_name">Database Name</Label>
                  <Input
                    id="db_name"
                    value={settings.database.database}
                    onChange={(e) => updateSetting('database', 'database', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="db_username">Username</Label>
                  <Input
                    id="db_username"
                    value={settings.database.username}
                    onChange={(e) => updateSetting('database', 'username', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="db_password">Password</Label>
                <PasswordField
                  value={settings.database.password}
                  onChange={(e) => updateSetting('database', 'password', e.target.value)}
                  placeholder="Enter database password"
                />
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="max_connections">Max Connections</Label>
                  <Input
                    id="max_connections"
                    type="number"
                    value={settings.database.max_connections}
                    onChange={(e) => updateSetting('database', 'max_connections', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="connection_timeout">Connection Timeout (ms)</Label>
                  <Input
                    id="connection_timeout"
                    type="number"
                    value={settings.database.connection_timeout}
                    onChange={(e) => updateSetting('database', 'connection_timeout', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => testConnection('Database')}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
                <ResetDialog
                  title="Reset Database Settings"
                  description="This will reset all database settings to their default values. Connection will be lost."
                  onConfirm={() => handleReset('database')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure alerts and notification channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="email_enabled"
                    checked={settings.notifications.email_enabled}
                    onCheckedChange={(checked) => updateSetting('notifications', 'email_enabled', checked)}
                  />
                  <Label htmlFor="email_enabled">Enable Email Notifications</Label>
                </div>

                {settings.notifications.email_enabled && (
                  <div className="ml-6 space-y-4 border-l-2 border-muted pl-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="smtp_host">SMTP Host</Label>
                        <Input
                          id="smtp_host"
                          value={settings.notifications.email_smtp_host}
                          onChange={(e) => updateSetting('notifications', 'email_smtp_host', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="smtp_port">SMTP Port</Label>
                        <Input
                          id="smtp_port"
                          type="number"
                          value={settings.notifications.email_smtp_port}
                          onChange={(e) => updateSetting('notifications', 'email_smtp_port', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email_username">Email Username</Label>
                        <Input
                          id="email_username"
                          value={settings.notifications.email_username}
                          onChange={(e) => updateSetting('notifications', 'email_username', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email_password">Email Password</Label>
                        <PasswordField
                          value={settings.notifications.email_password}
                          onChange={(e) => updateSetting('notifications', 'email_password', e.target.value)}
                          placeholder="Enter email password"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slack_webhook">Slack Webhook URL</Label>
                  <Input
                    id="slack_webhook"
                    value={settings.notifications.slack_webhook_url}
                    onChange={(e) => updateSetting('notifications', 'slack_webhook_url', e.target.value)}
                    placeholder="https://hooks.slack.com/services/..."
                  />
                </div>

                <div className="space-y-3">
                  <Label>Alert Triggers</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="alert_errors"
                        checked={settings.notifications.alert_on_errors}
                        onCheckedChange={(checked) => updateSetting('notifications', 'alert_on_errors', checked)}
                      />
                      <Label htmlFor="alert_errors">Alert on Errors</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="alert_response_time"
                        checked={settings.notifications.alert_on_high_response_time}
                        onCheckedChange={(checked) => updateSetting('notifications', 'alert_on_high_response_time', checked)}
                      />
                      <Label htmlFor="alert_response_time">Alert on High Response Time</Label>
                    </div>
                  </div>
                </div>

                {settings.notifications.alert_on_high_response_time && (
                  <div className="space-y-2">
                    <Label htmlFor="response_threshold">Response Time Threshold (ms)</Label>
                    <Input
                      id="response_threshold"
                      type="number"
                      value={settings.notifications.response_time_threshold}
                      onChange={(e) => updateSetting('notifications', 'response_time_threshold', parseInt(e.target.value))}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <ResetDialog
                  title="Reset Notification Settings"
                  description="This will reset all notification settings to their default values."
                  onConfirm={() => handleReset('notifications')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure authentication and security policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable_auth"
                    checked={settings.security.enable_authentication}
                    onCheckedChange={(checked) => updateSetting('security', 'enable_authentication', checked)}
                  />
                  <Label htmlFor="enable_auth">Enable Authentication</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable_rate_limiting"
                    checked={settings.security.enable_rate_limiting}
                    onCheckedChange={(checked) => updateSetting('security', 'enable_rate_limiting', checked)}
                  />
                  <Label htmlFor="enable_rate_limiting">Enable Rate Limiting</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable_audit_logging"
                    checked={settings.security.enable_audit_logging}
                    onCheckedChange={(checked) => updateSetting('security', 'enable_audit_logging', checked)}
                  />
                  <Label htmlFor="enable_audit_logging">Enable Audit Logging</Label>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="session_timeout">Session Timeout (ms)</Label>
                  <Input
                    id="session_timeout"
                    type="number"
                    value={settings.security.session_timeout}
                    onChange={(e) => updateSetting('security', 'session_timeout', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
                  <Input
                    id="max_login_attempts"
                    type="number"
                    value={settings.security.max_login_attempts}
                    onChange={(e) => updateSetting('security', 'max_login_attempts', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allowed_origins">Allowed Origins</Label>
                <Textarea
                  id="allowed_origins"
                  value={settings.security.allowed_origins.join('\n')}
                  onChange={(e) => updateSetting('security', 'allowed_origins', e.target.value.split('\n').filter(Boolean))}
                  placeholder="https://example.com&#10;https://app.example.com"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  One origin per line. Used for CORS configuration.
                </p>
              </div>

              <div className="flex justify-end">
                <ResetDialog
                  title="Reset Security Settings"
                  description="This will reset all security settings to their default values. This may affect system access."
                  onConfirm={() => handleReset('security')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring */}
        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring Settings</CardTitle>
              <CardDescription>
                Configure system monitoring and alerting thresholds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable_metrics"
                    checked={settings.monitoring.enable_metrics_collection}
                    onCheckedChange={(checked) => updateSetting('monitoring', 'enable_metrics_collection', checked)}
                  />
                  <Label htmlFor="enable_metrics">Enable Metrics Collection</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable_performance_alerts"
                    checked={settings.monitoring.enable_performance_alerts}
                    onCheckedChange={(checked) => updateSetting('monitoring', 'enable_performance_alerts', checked)}
                  />
                  <Label htmlFor="enable_performance_alerts">Enable Performance Alerts</Label>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="retention_days">Metrics Retention (days)</Label>
                <Input
                  id="retention_days"
                  type="number"
                  value={settings.monitoring.metrics_retention_days}
                  onChange={(e) => updateSetting('monitoring', 'metrics_retention_days', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-4">
                <Label>Alert Thresholds</Label>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="cpu_threshold">CPU Threshold (%)</Label>
                    <Input
                      id="cpu_threshold"
                      type="number"
                      value={settings.monitoring.cpu_threshold}
                      onChange={(e) => updateSetting('monitoring', 'cpu_threshold', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="memory_threshold">Memory Threshold (%)</Label>
                    <Input
                      id="memory_threshold"
                      type="number"
                      value={settings.monitoring.memory_threshold}
                      onChange={(e) => updateSetting('monitoring', 'memory_threshold', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="disk_threshold">Disk Threshold (%)</Label>
                    <Input
                      id="disk_threshold"
                      type="number"
                      value={settings.monitoring.disk_threshold}
                      onChange={(e) => updateSetting('monitoring', 'disk_threshold', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <ResetDialog
                  title="Reset Monitoring Settings"
                  description="This will reset all monitoring settings to their default values."
                  onConfirm={() => handleReset('monitoring')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

