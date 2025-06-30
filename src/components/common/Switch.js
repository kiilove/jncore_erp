import React from "react";
import { cn } from "../../utils/classNames";

const Switch = React.forwardRef(
  ({ className, checked, onChange, label, ...props }, ref) => {
    return (
      <div className="flex items-center space-x-2">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          className={cn(
            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            checked ? "bg-primary" : "bg-input",
            className
          )}
          onClick={() => onChange(!checked)}
          ref={ref}
          {...props}
        >
          <span
            className={cn(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
              checked ? "translate-x-5" : "translate-x-1"
            )}
          />
        </button>
        {label && <span className="text-sm font-medium">{label}</span>}
      </div>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };
export default Switch;
