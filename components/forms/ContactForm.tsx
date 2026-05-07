"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import styles from "@/components/marketing/Marketing.module.css";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className={styles.formCard}>
      <form onSubmit={handleSubmit}>
        <h2>Send an enquiry</h2>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Name</span>
            <input name="name" placeholder="Your name" required />
          </label>
          <label className={styles.field}>
            <span>Email</span>
            <input name="email" type="email" placeholder="name@example.com" required />
          </label>
          <label className={styles.field}>
            <span>Phone</span>
            <input name="phone" type="tel" placeholder="+27" />
          </label>
          <label className={styles.field}>
            <span>Enquiry type</span>
            <select name="type" required defaultValue="">
              <option value="" disabled>
                Choose enquiry type
              </option>
              <option>Parent order</option>
              <option>School partnership</option>
              <option>Office pack</option>
              <option>Pexpacks</option>
              <option>Sponsorship</option>
              <option>Supplier partnership</option>
              <option>General enquiry</option>
            </select>
          </label>
          <label className={`${styles.field} ${styles.formWide}`}>
            <span>Message</span>
            <textarea name="message" placeholder="Tell us what you need" required />
          </label>
        </div>
        <Button type="submit">Send enquiry</Button>
        {submitted ? <p className={styles.statusMessage}>Thank you. This form is ready to connect to the backend.</p> : null}
      </form>
    </div>
  );
}
