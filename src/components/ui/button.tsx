import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, loading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    const variants: Record<string, string> = {
      default: 'bg-secondary text-white hover:bg-secondary-light shadow-[0_1px_2px_rgba(26,26,46,0.25)] hover:shadow-[0_4px_16px_rgba(26,26,46,0.25)]',
      secondary: 'bg-primary text-white hover:bg-primary-dark shadow-[0_1px_2px_rgba(201,168,76,0.3)] hover:shadow-[0_4px_16px_rgba(201,168,76,0.3)]',
      outline: 'border border-border bg-white text-text hover:bg-primary-50 hover:border-primary/30',
      ghost: 'text-text-secondary hover:bg-primary-50 hover:text-text',
      link: 'text-primary underline-offset-4 hover:underline',
      destructive: 'bg-error text-white hover:bg-error-light shadow-sm',
    }

    const sizes: Record<string, string> = {
      default: 'h-[48px] px-6 py-2.5 text-[15px] font-bold rounded-[12px] tracking-[-0.01em]',
      sm: 'h-10 px-4 py-2 text-[13px] font-semibold rounded-[8px]',
      lg: 'h-[56px] px-8 py-3 text-[16px] font-bold rounded-[14px]',
      icon: 'h-10 w-10 rounded-[10px]',
    }

    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center gap-2 transition-all duration-[200ms]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-40',
          'active:scale-[0.98]',
          'select-none whitespace-nowrap',
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        aria-busy={loading}
        aria-live={loading ? 'polite' : undefined}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4 text-current opacity-90"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.2" />
            <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          </svg>
        )}

        {children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button }
