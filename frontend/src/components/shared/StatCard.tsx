import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red'
  loading?: boolean
  className?: string
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    icon: 'bg-blue-100 text-blue-600',
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    icon: 'bg-green-100 text-green-600',
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    icon: 'bg-orange-100 text-orange-600',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    icon: 'bg-purple-100 text-purple-600',
  },
  red: {
    bg: 'bg-red-50',
    text: 'text-red-600',
    icon: 'bg-red-100 text-red-600',
  },
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color = 'blue',
  loading = false,
  className,
}: StatCardProps) {
  const colors = colorVariants[color]

  if (loading) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3 flex-1">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('overflow-hidden hover:shadow-lg transition-shadow', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={cn('text-3xl font-bold', colors.text)}>{value}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1">
                {change > 0 ? (
                  <>
                    <ArrowUpIcon className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      +{change}%
                    </span>
                  </>
                ) : change < 0 ? (
                  <>
                    <ArrowDownIcon className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-600">
                      {change}%
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-medium text-gray-600">
                    Sin cambios
                  </span>
                )}
                <span className="text-xs text-gray-500 ml-1">vs mes anterior</span>
              </div>
            )}
          </div>
          <div className={cn('p-3 rounded-lg', colors.icon)}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
