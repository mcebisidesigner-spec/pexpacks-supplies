"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import styles from "@/components/marketing/Marketing.module.css";

export function PartnerForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className={styles.formCard}>
      <form onSubmit={handleSubmit}>
        <h2>Partnership enquiry</h2>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Name</span>
            <input name="name" placeholder="Your name" required />
          </label>
          <label className={styles.field}>
            <span>Organisation</span>
            <input name="organisation" placeholder="School, business or supplier name" required />
          </label>
          <label className={styles.field}>
            <span>Email</span>
            <input name="email" type="email" placeholder="name@example.com" required />
          </label>
          <label className={styles.field}>
            <span>Partner type</span>
            <select name="partnerType" required defaultValue="">
              <option value="" disabled>
                Choose partner type
              </option>
              <option>School</option>
              <option>Sponsor</option>
              <option>Supplier</option>
              <option>Community partner</option>
            </select>
          </label>
          <label className={`${styles.field} ${styles.formWide}`}>
            <span>How can Pexpacks help?</span>
            <textarea name="message" placeholder="Share the school, sponsor or supplier opportunity" required />
          </label>
        </div>
        <Button type="submit">Send partnership enquiry</Button>
        {submitted ? <p className={styles.statusMessage}>Thank you. This form is ready to connect to the backend.</p> : null}
      </form>
    </div>
  );
}
