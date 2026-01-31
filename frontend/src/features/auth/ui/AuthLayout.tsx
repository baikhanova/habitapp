import { ReactNode } from 'react'
import { cn } from '@shared/lib/utils'
interface AuthLayoutProps {
  title: string
  description: string
  hero?: ReactNode
  children: ReactNode
  className?: string
}

export function AuthLayout({
  title,
  description,
  hero,
  children,
  className,
}: AuthLayoutProps) {
  return (
    <div
      className={cn(
        'min-h-[100dvh] min-h-screen flex flex-col',
        'bg-gradient-to-b from-primary/5 via-background to-background',
        'dark:from-primary/10 dark:via-background dark:to-background',
        'md:min-h-screen md:justify-center md:py-8 md:px-6',
        'lg:flex-row lg:min-h-screen lg:py-0 lg:px-0 lg:overflow-hidden',
        className
      )}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20 lg:opacity-40 lg:dark:opacity-30"
        aria-hidden
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full bg-primary/20 blur-3xl lg:left-1/4 lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0 lg:w-[480px] lg:h-[480px]" />
        <div className="absolute bottom-1/4 right-0 w-[200px] h-[200px] rounded-full bg-primary/10 blur-2xl lg:right-1/4 lg:bottom-1/2 lg:translate-y-1/2 lg:w-[320px] lg:h-[320px]" />
      </div>

      <div
        className={cn(
          'relative z-10 flex flex-1 flex-col min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain',
          'px-4 pb-[max(env(safe-area-inset-bottom),1rem)]',
          'md:flex-none md:overflow-visible md:pb-0 md:pr-0',
          'md:mx-auto md:w-full md:max-w-md',
          'lg:mx-0 lg:max-w-none lg:flex-row lg:flex-1 lg:items-stretch lg:overflow-hidden'
        )}
      >
        <div
          className={cn(
            'hidden lg:flex lg:flex-1 lg:flex-col lg:items-center lg:justify-center lg:min-w-0 lg:py-16 lg:px-12 xl:px-16'
          )}
        >
          <div className="w-full max-w-md flex flex-col items-center text-center xl:max-w-lg">
            {hero && (
              <div className="mb-8 animate-auth-hero-float">
                {hero}
              </div>
            )}
            <h1
              className="text-[34px] xl:text-[40px] font-bold tracking-tight text-foreground leading-tight animate-auth-fade-in-up"
              style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}
            >
              {title}
            </h1>
            <p
              className="mt-4 text-[17px] xl:text-[19px] text-muted-foreground leading-snug max-w-md animate-auth-fade-in-up"
              style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}
            >
              {description}
            </p>
          </div>
        </div>

        <div
          className={cn(
            'flex flex-1 flex-col min-h-0',
            'md:flex-none md:rounded-2xl md:border md:border-border/80 md:bg-card/80 md:shadow-sm md:backdrop-blur-sm',
            'md:p-8 md:pb-10',
            'lg:flex-1 lg:rounded-none lg:border-l lg:border-t-0 lg:border-b-0 lg:border-r-0 lg:bg-card/95 lg:shadow-[-8px_0_24px_-12px_rgba(0,0,0,0.08)] dark:lg:shadow-[-8px_0_24px_-12px_rgba(0,0,0,0.4)]',
            'lg:flex-none lg:justify-center lg:min-w-0 lg:w-full lg:max-w-[440px] xl:max-w-[480px] lg:p-12 xl:p-16'
          )}
        >
          <div className="lg:hidden flex-shrink-0 pt-6 pb-4">
            {hero && (
              <div className="mb-6 flex justify-center animate-auth-hero-float">
                {hero}
              </div>
            )}
            <h1
              className="text-[28px] font-bold tracking-tight text-foreground leading-tight animate-auth-fade-in-up"
              style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}
            >
              {title}
            </h1>
            <p
              className="mt-2 text-[15px] text-muted-foreground leading-snug max-w-[300px] animate-auth-fade-in-up"
              style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}
            >
              {description}
            </p>
          </div>

          <main className="flex-1 min-h-0 flex flex-col mt-4 md:mt-6 lg:mt-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
