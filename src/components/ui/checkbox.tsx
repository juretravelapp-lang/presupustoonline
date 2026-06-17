import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & { label?: string; error?: string }
>(({ className, label, error, id, ...props }, ref) => {
  const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex items-start gap-3">
      <CheckboxPrimitive.Root
        ref={ref}
        id={checkboxId}
        className={cn(
          'peer h-[18px] w-[18px] shrink-0 rounded-[4px] border-[1.5px] border-border',
          'transition-all duration-[150ms]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-white',
          error && 'border-error',
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
          <Check className="h-3 w-3" strokeWidth={3} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && (
        <label
          htmlFor={checkboxId}
          className="text-[14px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-text-secondary"
        >
          {label}
        </label>
      )}
      {error && (
        <p className="text-[12px] text-error animate-fade-in">{error}</p>
      )}
    </div>
  )
})
Checkbox.displayName = 'Checkbox'

export { Checkbox }
