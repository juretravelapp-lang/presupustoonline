import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, id, icon, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const errorId = `${inputId}-error`

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-bold text-blue-200/80 mb-2.5 tracking-wide uppercase"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-300/70 flex items-center justify-center pointer-events-none">
              {icon}
            </div>
          )}
          <input
            type={type}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              'flex h-11 w-full rounded-lg border text-sm leading-none font-medium text-white',
              'transition-all duration-200 will-change-transform',
              'placeholder:text-blue-300/50 placeholder:font-normal placeholder:text-sm',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'disabled:cursor-not-allowed disabled:opacity-50',
              icon ? 'pl-10' : 'px-4',
              'px-4',
              error
                ? 'bg-red-950/30 border-red-500/40 text-red-200 focus:border-red-500 focus:ring-red-500/30'
                : 'bg-blue-950/40 border-blue-700/40 hover:border-blue-600/60 focus:border-blue-500 focus:ring-blue-500/20',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-xs text-red-400 font-medium" role="alert">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
