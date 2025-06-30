"use client";

import React from "react";
import { cn } from "../../utils/classNames";

const Card = React.forwardRef(
  ({ className, variant = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200 overflow-hidden",
        variant === "elevated" && "shadow-md hover:shadow-lg",
        variant === "outline" && "border-2",
        variant === "flat" && "shadow-none border-0 bg-muted/50",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef(
  ({ className, align = "left", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5 p-6 pb-4",
        align === "center" && "items-center text-center",
        align === "right" && "items-end text-right",
        className
      )}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(
  ({ className, size = "default", ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "font-semibold leading-none tracking-tight",
        size === "default" && "text-lg",
        size === "sm" && "text-base",
        size === "lg" && "text-xl md:text-2xl",
        className
      )}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground mt-1.5", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(
  ({ className, padding = "default", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        padding === "default" && "p-6 pt-2",
        padding === "compact" && "p-4 pt-2",
        padding === "none" && "p-0",
        className
      )}
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(
  ({ className, align = "left", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center p-6 pt-0",
        align === "center" && "justify-center",
        align === "right" && "justify-end",
        align === "between" && "justify-between",
        className
      )}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
