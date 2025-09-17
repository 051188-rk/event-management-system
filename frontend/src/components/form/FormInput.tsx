import React, { InputHTMLAttributes, forwardRef } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  helpText?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ id, label, error, helpText, className = '', ...props }, ref) => {
    return (
      <div>
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {props.required && <span className="text-red-500">*</span>}
        </label>
        <input
          id={id}
          ref={ref}
          className={`block w-full px-3 py-2 border ${
            error
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500'
          } rounded-md shadow-sm sm:text-sm ${className}`}
          aria-invalid={!!error}
          aria-describedby={`${id}-error`}
          {...props}
        />
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

FormInput.displayName = 'FormInput';

export default FormInput;
