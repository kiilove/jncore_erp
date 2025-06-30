"use client";

import React from "react";
import { cn } from "../../utils/classNames";

const Input = React.forwardRef((props, ref) => {
  const {
    className,
    type = "text",
    label,
    error,
    icon: Icon,
    iconPosition = "left",
    helperText,
    containerClassName,
    labelClassName,
    ...rest
  } = props;

  return (
    <div className={cn("space-y-2", containerClassName)}>
      {label && (
        <label
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            labelClassName
          )}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === "left" && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            Icon && iconPosition === "left" && "pl-10",
            Icon && iconPosition === "right" && "pr-10",
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
          ref={ref}
          {...rest}
        />
        {Icon && iconPosition === "right" && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
      </div>
      {helperText && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
});

Input.displayName = "Input";

export { Input };
export default Input;
