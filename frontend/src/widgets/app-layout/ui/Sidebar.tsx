import { Link, useLocation } from 'react-router-dom'
import { cn } from '@shared/lib/utils'
import { NAV_ITEMS } from '@shared/constants/nav'

export function Sidebar() {
  const location = useLocation()

  return (
    <aside
      className={cn(
        'hidden md:flex md:flex-col md:w-[220px] lg:w-[240px] md:flex-shrink-0',
        'border-r border-border/80 bg-background/80 backdrop-blur-xl',
        'pt-[max(1.5rem,env(safe-area-inset-top))] pb-4 px-3'
      )}
    >
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path + '/'))
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[15px] font-medium transition-colors',
                'min-h-[36px]',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground hover:bg-muted/80 active:bg-muted'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={2} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
