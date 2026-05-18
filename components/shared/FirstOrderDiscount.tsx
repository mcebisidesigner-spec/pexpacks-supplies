"use client";

import { useState, useEffect } from "react";
import styles from "./FirstOrderDiscount.module.css";

export function FirstOrderDiscount() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Only show once per user (check localStorage)
    const hasSeen = localStorage.getItem("pexpacks:discount-seen");
    if (hasSeen) return;

    // Show after 15 seconds
    const timer = setTimeout(() => {
      setIsOpen(true);
      localStorage.setItem("pexpacks:discount-seen", "true");
    }, 15000);

    // Or show on exit intent (desktop)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasSeen && !isOpen) {
        setIsOpen(true);
        localStorage.setItem("pexpacks:discount-seen", "true");
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Here you would typically send the email to your API/CRM
      // For now, we'll just save it to localStorage and show success
      try {
        const existing = JSON.parse(localStorage.getItem("pexpacks:list-emails") || "[]");
        if (!existing.includes(email.trim())) {
          existing.push(email.trim());
          localStorage.setItem("pexpacks:list-emails", JSON.stringify(existing));
        }
      } catch {
        // ignore
      }
      setSubmitted(true);
      
      // Auto close after 3 seconds on success
      setTimeout(() => {
        setIsOpen(false);
      }, 3000);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.popup} role="dialog" aria-labelledby="discount-title">
        <button className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label="Close popup">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div className={styles.content}>
          <span className={styles.badge}>Special Offer</span>
          <h2 id="discount-title" className={styles.title}>Get 5% Off Your First Pack!</h2>
          
          {submitted ? (
            <div className={styles.successMessage}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--pex-keppel)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <p>Success! Use code <strong>PEX5</strong> at checkout.</p>
            </div>
          ) : (
            <>
              <p className={styles.description}>
                Enter your email to receive your 5% discount code and get notified when your school&apos;s latest list is available.
              </p>
              <form onSubmit={handleSubmit} className={styles.form}>
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className={styles.submitBtn}>
                  Claim My 5% Off
                </button>
              </form>
              <p className={styles.disclaimer}>We respect your privacy. No spam.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
