"use client"

import React from "react"
import { cn } from "../../utils/classNames"

const buttonVariants = {
  variant: {
    default: "bg-primary text-white hover:bg-primary/90 dark:bg-primary/90 dark:text-white dark:hover:bg-primary",
    destructive:
      "bg-destructive text-white hover:bg-destructive/90 dark:bg-destructive/90 dark:text-white dark:hover:bg-destructive",
    outline:
      "border-2 border-input bg-background text-gray-800 hover:bg-accent hover:text-accent-foreground dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white",
    secondary:
      "bg-secondary text-gray-800 hover:bg-secondary/80 dark:bg-secondary/70 dark:text-white dark:hover:bg-secondary/90",
    ghost:
      "text-gray-800 hover:bg-accent hover:text-accent-foreground dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white",
    link: "text-primary underline-offset-4 hover:underline dark:text-primary/90",
    success: "bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:text-white dark:hover:bg-green-600",
    warning: "bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-600 dark:text-white dark:hover:bg-yellow-500",
    info: "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:text-white dark:hover:bg-blue-500",
    light: "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600",
    dark: "bg-gray-800 text-white hover:bg-gray-900 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800",
  },
  size: {
    xs: "h-7 px-2 text-xs",
    sm: "h-9 px-3 text-sm",
    default: "h-10 px-4 py-2",
    lg: "h-11 px-5 text-base",
    xl: "h-12 px-6 text-lg",
    icon: "p-2",
  },
}

const getButtonClasses = ({
  variant = "default",
  size = "default",
  className = "",
  rounded = "md",
  fullWidth = false,
}) => {
  const variantClasses = buttonVariants.variant[variant] || buttonVariants.variant.default
  const sizeClasses = buttonVariants.size[size] || buttonVariants.size.default
  const roundedClass = `rounded-${rounded}`
  const widthClass = fullWidth ? "w-full" : ""

  return cn(
    "inline-flex items-center justify-center font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
    variantClasses,
    sizeClasses,
    roundedClass,
    widthClass,
    className,
  )
}

const Button = React.forwardRef(
  (
    {
      className,
      variant,
      size,
      children,
      icon: Icon,
      iconPosition = "left",
      iconSize = 16,
      rounded = "md",
      fullWidth = false,
      isLoading = false,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        className={getButtonClasses({ variant, size, className, rounded, fullWidth })}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {Icon && iconPosition === "left" && !isLoading && (
          <Icon className={`mr-2 ${size === "xs" || size === "sm" ? "h-4 w-4" : "h-5 w-5"}`} size={iconSize} />
        )}
        {children}
        {Icon && iconPosition === "right" && (
          <Icon className={`ml-2 ${size === "xs" || size === "sm" ? "h-4 w-4" : "h-5 w-5"}`} size={iconSize} />
        )}
      </button>
    )
  },
)

Button.displayName = "Button"

export { Button, buttonVariants }
export default Button
