import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import { Button } from '@shared/ui/button'
import { cn } from '@shared/lib/utils'
import type { BreadcrumbItem } from '../lib/routes'

interface PageHeaderProps {
  title: string
  breadcrumbs: BreadcrumbItem[]
  backLink?: string | null
  className?: string
}

export function PageHeader({ title, breadcrumbs, backLink, className }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <header
      className={cn(
        'flex flex-col gap-1 border-b border-border/80 bg-background/95 backdrop-blur-sm',
        'px-4 md:px-6 py-4 md:py-5',
        'pt-[max(1rem,env(safe-area-inset-top))] md:pt-5',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {backLink && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(backLink)}
            className="h-9 w-9 shrink-0 rounded-[10px]"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="flex-1 min-w-0">
          {breadcrumbs.length > 0 && (
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1 text-[13px] text-muted-foreground flex-wrap"
            >
              {breadcrumbs.map((item, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && (
                    <ChevronRight className="w-4 h-4 flex-shrink-0 text-muted-foreground/70" />
                  )}
                  {item.path ? (
                    <Link
                      to={item.path}
                      className="hover:text-foreground transition-colors truncate max-w-[140px] md:max-w-[200px]"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-foreground font-medium truncate max-w-[180px] md:max-w-none">
                      {item.label}
                    </span>
                  )}
                </span>
              ))}
            </nav>
          )}
          <h1 className="text-[22px] md:text-[26px] font-semibold tracking-tight text-foreground truncate">
            {title}
          </h1>
        </div>
      </div>
    </header>
  )
}
