import type { SelectHTMLAttributes } from "react";
import { useId } from "react";
import styles from "./Input.module.css";

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
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
        </label>
      )}
      
      <div className={styles.selectWrap}>
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          className={styles.select}
          aria-invalid={error ? true : undefined}
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
        
        <span className={styles.selectChevron} aria-hidden="true">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>
      
      {error && (
        <span className={styles.errorText} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
