"use client";

import React from "react";
import { cn } from "../../utils/classNames";

const Form = React.forwardRef(
  (
    {
      className,
      children,
      onSubmit,
      requiredFields = [],
      errors = {},
      ...props
    },
    ref
  ) => {
    const handleSubmit = (e) => {
      e.preventDefault();
      if (onSubmit) {
        onSubmit(e);
      }
    };

    return (
      <form
        ref={ref}
        onSubmit={handleSubmit}
        className={cn("space-y-6", className)}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;

          // FormSection 컴포넌트인 경우
          if (child.type === FormSection) {
            return React.cloneElement(child, {
              requiredFields,
              errors,
            });
          }

          // 일반 컴포넌트인 경우
          return child;
        })}
      </form>
    );
  }
);

Form.displayName = "Form";

const FormSection = React.forwardRef(
  (
    { className, children, title, requiredFields = [], errors = {}, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden",
          className
        )}
        {...props}
      >
        <div className="p-6">
          {title && (
            <h2 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
              {title}
            </h2>
          )}
          <div className="space-y-4">
            {React.Children.map(children, (child) => {
              if (!React.isValidElement(child)) return child;

              // Input, Select 등의 폼 컴포넌트인 경우
              if (
                child.type.displayName === "Input" ||
                child.type.displayName === "Select"
              ) {
                const name = child.props.name;
                const isRequired = requiredFields.includes(name);
                const error = errors[name];

                return React.cloneElement(child, {
                  required: isRequired,
                  error,
                  label: isRequired
                    ? `${child.props.label} *`
                    : child.props.label,
                });
              }

              return child;
            })}
          </div>
        </div>
      </div>
    );
  }
);

FormSection.displayName = "FormSection";

export { Form, FormSection };
export default Form;
