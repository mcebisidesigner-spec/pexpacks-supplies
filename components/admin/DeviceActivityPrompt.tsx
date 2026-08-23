"use client";

import { Laptop, X } from "lucide-react";
import styles from "./DeviceActivityPrompt.module.css";

interface DeviceActivityPromptProps {
  onContinue: () => void;
  onDismiss: () => void;
}

export function DeviceActivityPrompt({
  onContinue,
  onDismiss,
}: DeviceActivityPromptProps) {
  return (
    <div
      className={styles.popupWrap}
      role="dialog"
      aria-labelledby="device-prompt-title"
    >
      <div className={styles.header}>
        <span id="device-prompt-title" className={styles.domainLabel}>
          <span className={styles.domainTag}>Pexpacks</span> Security
        </span>
        <button
          type="button"
          onClick={onDismiss}
          className={styles.closeBtn}
          aria-label="Close prompt"
        >
          <X size={16} />
        </button>
      </div>

      <div className={styles.body}>
        <div className={styles.iconWrap}>
          <Laptop size={20} />
        </div>
        <p className={styles.messageText}>
          Pexpacks protects this dashboard by closing the session after 45
          minutes without activity. The timer pauses while you work in another
          application.
        </p>
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={onContinue} className={styles.allowBtn}>
          Continue
        </button>
        <button type="button" onClick={onDismiss} className={styles.blockBtn}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
