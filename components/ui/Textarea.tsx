import React, { TextareaHTMLAttributes } from 'react';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export default function Textarea({ 
  label, 
  id, 
  placeholder, 
  value, 
  onChange, 
  error,
  rows = 4,
  className = '',
  ...props 
}: TextareaProps) {
  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-bold text-gray-900">
          {label}
        </label>
      )}
      
      <textarea
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        className={`
          w-full px-4 py-3 bg-white border rounded-xl text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-[#000080]/20 focus:border-[#000080] 
          transition-all duration-200 resize-y
          ${error ? 'border-red-500 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'}
        `}
        {...props}
      />
      
      {error && (
        <span className="text-xs font-bold text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}
