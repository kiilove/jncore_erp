import { cn } from "../../utils/classNames"

const badgeVariants = {
  variant: {
    default: "bg-primary/10 text-primary dark:bg-primary/20",
    secondary: "bg-secondary/20 text-secondary-foreground dark:bg-secondary/30",
    destructive: "bg-destructive/10 text-destructive dark:bg-destructive/20",
    outline: "border border-input text-foreground",
    success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  },
  size: {
    default: "px-2.5 py-0.5 text-xs",
    sm: "px-2 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm",
  },
}

const Badge = ({ className, variant = "default", size = "default", children }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        badgeVariants.variant[variant] || badgeVariants.variant.default,
        badgeVariants.size[size] || badgeVariants.size.default,
        className,
      )}
    >
      {children}
    </span>
  )
}

export { Badge, badgeVariants }
