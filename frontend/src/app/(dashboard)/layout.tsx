import { DashboardLayout as Layout } from '@/components/layouts/DashboardLayout'

/**
 * Dashboard layout
 * Layout wrapper for all dashboard pages with Sidebar and Header
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Layout>{children}</Layout>
}
