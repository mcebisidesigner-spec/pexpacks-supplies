import type { TextareaHTMLAttributes } from "react";
import { useId } from "react";
import styles from "./Textarea.module.css";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  helper?: string;
  error?: string;
};

export default function Textarea({ 
  label, 
  helper,
  id, 
  placeholder, 
  value, 
  onChange, 
  error,
  rows = 4,
  className = '',
  ...props 
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
        </label>
      )}
      {helper ? <p className={styles.helper}>{helper}</p> : null}
      
      <textarea
        id={textareaId}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        className={styles.textarea}
        aria-invalid={error ? true : undefined}
        {...props}
      />
      
      {error && (
        <span className={styles.errorText} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
