import React, { SelectHTMLAttributes } from 'react';

interface Option {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  error?: string;
  helpText?: string;
  options: Option[];
}

const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    { id, label, error, helpText, className = '', options, ...props },
    ref
  ) => {
    return (
      <div>
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {props.required && <span className="text-red-500">*</span>}
        </label>
        <div className="mt-1 relative">
          <select
            id={id}
            ref={ref}
            className={`block w-full rounded-md border ${
              error
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500'
            } py-2 px-3 sm:text-sm ${className}`}
            aria-invalid={!!error}
            aria-describedby={`${id}-error ${id}-help`}
            {...props}
          >
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {error ? (
          <p className="mt-1 text-sm text-red-600" id={`${id}-error`}>
            {error}
          </p>
        ) : helpText ? (
          <p className="mt-1 text-xs text-gray-500" id={`${id}-help`}>
            {helpText}
          </p>
        ) : null}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';

export default FormSelect;
