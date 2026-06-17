import * as React from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  label?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-[13px] font-semibold text-text mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            'flex min-h-[120px] w-full rounded-[10px] border bg-white px-3.5 py-3 text-[15px] leading-relaxed font-medium',
            'transition-all duration-[150ms] resize-none',
            'placeholder:text-text-subtle placeholder:font-normal',
            'focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary',
            'disabled:cursor-not-allowed disabled:opacity-40',
            error
              ? 'border-error/50 focus:border-error focus:ring-error/10'
              : 'border-border hover:border-primary/30',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-[12px] text-error font-medium animate-fade-in" role="alert">{error}</p>
        )}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
