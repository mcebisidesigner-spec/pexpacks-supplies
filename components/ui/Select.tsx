import React, { SelectHTMLAttributes } from 'react';

type SelectOption = {
  value: string;
  label: string;
} | string;

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  options?: SelectOption[];
  placeholder?: string;
};

export default function Select({ 
  label, 
  id, 
  options = [], 
  value, 
  onChange, 
  error,
  placeholder = "Select an option",
  className = '',
  ...props 
}: SelectProps) {
  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-bold text-gray-900">
          {label}
        </label>
      )}
      
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          className={`
            w-full px-4 py-3 bg-white border rounded-xl text-gray-900 appearance-none
            focus:outline-none focus:ring-2 focus:ring-[#000080]/20 focus:border-[#000080] 
            transition-all duration-200
            ${error ? 'border-red-500 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'}
          `}
          {...props}
        >
          <option value="" disabled hidden>{placeholder}</option>
          {options.map((option, index) => {
            const val = typeof option === 'string' ? option : option.value;
            const lbl = typeof option === 'string' ? option : option.label;
            return (
              <option key={index} value={val}>
                {lbl}
              </option>
            );
          })}
        </select>
        
        {/* Custom Dropdown Chevron Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {error && (
        <span className="text-xs font-bold text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}
