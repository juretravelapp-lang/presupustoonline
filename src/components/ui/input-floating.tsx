import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

/**
 * Floating Label Input Component
 * Labels float up when focused or when field has value
 * Implements Material Design 3 pattern with Tailwind CSS
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    const errorId = `${inputId}-error`
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(!!props.defaultValue)
    const inputRef = React.useRef<HTMLInputElement>(null)

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasValue(!!e.target.value)
      props.onBlur?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value)
      props.onChange?.(e)
    }

    const isActive = isFocused || hasValue

    return (
      <div className="w-full">
        <div className="relative">
          <input
            type={type}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              'flex h-[48px] w-full rounded-[12px] border-2 bg-gray-50 px-4 pt-5 pb-1.5 text-[15px] leading-none font-semibold text-text',
              'transition-all duration-[150ms] will-change-transform',
              'placeholder:text-gray-400 placeholder:font-normal placeholder:text-[14px]',
              'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100',
              error
                ? 'border-error focus:border-error focus:ring-error/15 bg-error/5'
                : 'border-gray-200 hover:border-primary/40 focus:border-primary',
              className
            )}
            ref={inputRef}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            placeholder={isActive ? '' : props.placeholder}
            {...props}
          />
          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                'absolute left-4 text-text-secondary tracking-[0.02em] font-bold',
                'transition-all duration-[150ms] pointer-events-none origin-left',
                isActive
                  ? 'top-1.5 text-[10px] text-primary-dark scale-90'
                  : 'top-1/2 -translate-y-1/2 text-[12px] text-text-secondary'
              )}
            >
              {label}
            </label>
          )}
        </div>
        {error && (
          <p id={errorId} className="mt-1.5 text-[12px] text-error font-medium animate-fade-in" role="alert">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
