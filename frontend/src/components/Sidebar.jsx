import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import {
  LayoutDashboard,
  Bot,
  ListTodo,
  BarChart3,
  FileText,
  Settings,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Agents', href: '/agents', icon: Bot },
  { name: 'Tasks', href: '/tasks', icon: ListTodo },
  { name: 'Metrics', href: '/metrics', icon: BarChart3 },
  { name: 'Logs', href: '/logs', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
]

function StatusIndicator({ status }) {
  const statusConfig = {
    healthy: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20' },
    warning: { icon: AlertCircle, color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/20' },
    error: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/20' },
    loading: { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-900/20' }
  }

  const config = statusConfig[status] || statusConfig.loading
  const Icon = config.icon

  return (
    <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg", config.bg)}>
      <Icon className={cn("h-4 w-4", config.color)} />
      <span className="text-sm font-medium capitalize">{status}</span>
    </div>
  )
}

function SystemStats({ systemStatus }) {
  return (
    <div className="space-y-4">
      <div className="px-3">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">System Status</h3>
        <StatusIndicator status={systemStatus.status} />
      </div>

      <div className="px-3 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Agents</span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {systemStatus.agents.active}/{systemStatus.agents.total}
            </Badge>
            <Activity className="h-3 w-3 text-green-500" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Running Tasks</span>
          <Badge variant="outline" className="text-xs">
            {systemStatus.tasks.running}
          </Badge>
        </div>

        {systemStatus.errors.total > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Errors</span>
            <Badge variant="destructive" className="text-xs">
              {systemStatus.errors.total}
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
}

function SidebarContent({ systemStatus, onClose }) {
  const location = useLocation()

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">FMAA</h1>
            <p className="text-xs text-muted-foreground">Micro-Agents</p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* System Stats */}
      <div className="border-t p-4">
        <SystemStats systemStatus={systemStatus} />
      </div>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground">
          <p>FMAA v1.0.0</p>
          <p>Federated Micro-Agents Architecture</p>
        </div>
      </div>
    </div>
  )
}

export function Sidebar({ open, onOpenChange, systemStatus }) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-card">
          <SidebarContent systemStatus={systemStatus} />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-72 p-0">
          <SidebarContent 
            systemStatus={systemStatus} 
            onClose={() => onOpenChange(false)} 
          />
        </SheetContent>
      </Sheet>
    </>
  )
}

