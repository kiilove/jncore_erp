"use client"

import React from "react"
import { cn } from "../../utils/classNames"

const Select = React.forwardRef(
  (
    { className, label, error, icon: Icon, options = [], helperText, containerClassName, labelClassName, ...props },
    ref,
  ) => {
    return (
      <div className={cn("space-y-2", containerClassName)}>
        {label && (
          <label
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              labelClassName,
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Icon className="h-5 w-5 text-gray-400" />
            </div>
          )}
          <select
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200",
              Icon && "pl-10",
              error && "border-red-500 focus-visible:border-red-500",
              className,
            )}
            ref={ref}
            {...props}
          >
            {Array.isArray(options)
              ? options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))
              : Object.entries(options).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
          </select>
        </div>
        {helperText && <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    )
  },
)

Select.displayName = "Select"

export { Select }
export default Select
