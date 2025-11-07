'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  DollarSign,
  CheckSquare,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  {
    href: '/home',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/patients',
    label: 'Pacientes',
    icon: Users,
  },
  {
    href: '/appointments',
    label: 'Citas',
    icon: Calendar,
  },
  {
    href: '/medical',
    label: 'Historia Clínica',
    icon: FileText,
  },
  {
    href: '/accounting',
    label: 'Contabilidad',
    icon: DollarSign,
  },
  {
    href: '/followups',
    label: 'Seguimiento',
    icon: CheckSquare,
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log('Logout clicked')
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo / Brand */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/home" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-medical-blue-600 text-white font-bold">
              S
            </div>
            <span className="text-xl font-bold text-gray-900">Soldent</span>
          </Link>
        )}

        {/* Desktop collapse button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>

        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                'hover:bg-gray-100',
                isActive
                  ? 'bg-medical-blue-50 text-medical-blue-700 hover:bg-medical-blue-100'
                  : 'text-gray-700 hover:text-gray-900',
                collapsed && 'justify-center'
              )}
              onClick={() => setMobileOpen(false)}
            >
              <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-medical-blue-700')} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      <Separator />

      {/* User info and logout */}
      <div className="p-4">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <Avatar className="h-10 w-10">
            <AvatarImage src="/avatar-placeholder.png" alt="User" />
            <AvatarFallback className="bg-medical-blue-600 text-white">
              DR
            </AvatarFallback>
          </Avatar>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                Dr. Juan Pérez
              </p>
              <p className="text-xs text-gray-500 truncate">
                Odontólogo
              </p>
            </div>
          )}
        </div>

        {!collapsed && (
          <Button
            variant="ghost"
            className="mt-3 w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar sesión
          </Button>
        )}

        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="mt-3 w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 lg:hidden"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex lg:flex-col fixed inset-y-0 left-0 z-30 bg-white border-r border-gray-200 transition-all duration-300',
          collapsed ? 'w-20' : 'w-64',
          className
        )}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
