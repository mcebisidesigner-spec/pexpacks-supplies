"use client";

import { Laptop, X } from "lucide-react";
import styles from "./DeviceActivityPrompt.module.css";

interface DeviceActivityPromptProps {
  onAllow: () => void;
  onBlock: () => void;
}

export function DeviceActivityPrompt({ onAllow, onBlock }: DeviceActivityPromptProps) {
  return (
    <div className={styles.popupWrap} role="dialog" aria-labelledby="device-prompt-title">
      <div className={styles.header}>
        <span id="device-prompt-title" className={styles.domainLabel}>
          <span className={styles.domainTag}>Pexpacks</span> Security
        </span>
        <button
          type="button"
          onClick={onBlock}
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
          Pexpacks Supplies wants to know when you are actively using this device to protect dashboard database security.
        </p>
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={onAllow} className={styles.allowBtn}>
          Allow
        </button>
        <button type="button" onClick={onBlock} className={styles.blockBtn}>
          Block
        </button>
      </div>
    </div>
  );
}
