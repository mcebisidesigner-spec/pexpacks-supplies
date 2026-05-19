"use client";

import { useEffect, useState } from "react";
import styles from "./PwaInstallButton.module.css";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandaloneDisplay() {
  const navigatorWithStandalone = navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

export function PwaInstallButton() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandaloneDisplay()) {
      return;
    }

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }

    function onAppInstalled() {
      setInstallPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  if (!installPrompt) {
    return null;
  }

  async function installApp() {
    const prompt = installPrompt;

    if (!prompt) {
      return;
    }

    setInstallPrompt(null);

    await prompt.prompt();
    await prompt.userChoice.catch(() => undefined);
  }

  return (
    <button
      className={styles.installButton}
      type="button"
      onClick={() => void installApp()}
      aria-label="Install Pexpacks app"
    >
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <path d="M12 3v11" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 19h14" />
      </svg>
      <span>Install App</span>
    </button>
  );
}
