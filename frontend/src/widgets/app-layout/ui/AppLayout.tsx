import { useParams, useLocation } from 'react-router-dom'
import { useAppSelector } from '@shared/lib/hooks'
import { getPageTitle, getBreadcrumbs, getBackLink } from '../lib/routes'
import { Sidebar } from './Sidebar'
import { PageHeader } from './PageHeader'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  const params = useParams()
  const state = useAppSelector((s) => s)
  const title = getPageTitle(location.pathname, params as Record<string, string | undefined>, state)
  const breadcrumbs = getBreadcrumbs(
    location.pathname,
    params as Record<string, string | undefined>,
    state
  )
  const backLink = getBackLink(
    location.pathname,
    params as Record<string, string | undefined>
  )

  return (
    <div className="flex min-h-[100dvh] min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <PageHeader title={title} breadcrumbs={breadcrumbs} backLink={backLink} />
        <main className="flex-1 overflow-auto min-h-0">{children}</main>
      </div>
    </div>
  )
}
