'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  ChevronRight,
} from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const pathname = usePathname()
  const [notifications] = useState(3) // Mock notifications count

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean)

    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/dashboard' }
    ]

    if (segments.length > 1) {
      const labels: Record<string, string> = {
        patients: 'Pacientes',
        appointments: 'Citas',
        medical: 'Historia Clínica',
        accounting: 'Contabilidad',
        followups: 'Seguimiento',
      }

      segments.slice(1).forEach((segment, index) => {
        const isLast = index === segments.length - 2
        breadcrumbs.push({
          label: labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
          href: isLast ? undefined : `/${segments.slice(0, index + 2).join('/')}`
        })
      })
    }

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log('Logout clicked')
  }

  return (
    <header className={cn('sticky top-0 z-20 bg-white border-b border-gray-200', className)}>
      <div className="flex h-16 items-center justify-between px-6">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
              )}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-sm font-medium text-gray-900">
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Right section: Search, Notifications, Profile */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Buscar pacientes, citas..."
              className="w-64 pl-9"
            />
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {notifications}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Mock notifications */}
              <div className="max-h-96 overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <div className="flex w-full items-center justify-between">
                    <span className="font-medium">Nueva cita agendada</span>
                    <span className="text-xs text-gray-500">Hace 5 min</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Paciente: María González - Hoy 3:00 PM
                  </p>
                </DropdownMenuItem>

                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <div className="flex w-full items-center justify-between">
                    <span className="font-medium">Seguimiento pendiente</span>
                    <span className="text-xs text-gray-500">Hace 1 hora</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Paciente: Carlos Ruiz - Revisión post-operatoria
                  </p>
                </DropdownMenuItem>

                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                  <div className="flex w-full items-center justify-between">
                    <span className="font-medium">Pago recibido</span>
                    <span className="text-xs text-gray-500">Hace 2 horas</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Paciente: Ana Martínez - $150.00
                  </p>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-medical-blue-600 cursor-pointer">
                Ver todas las notificaciones
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar-placeholder.png" alt="User" />
                  <AvatarFallback className="bg-medical-blue-600 text-white text-xs">
                    DR
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">Dr. Juan Pérez</p>
                  <p className="text-xs text-gray-500">Odontólogo</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
