"use client";

import { useEffect, useRef, useState } from "react";

type PolicyTopic = {
  id: string;
  title: string;
};

type PolicyContentBarClasses = {
  tocCard: string;
  tocEyebrow: string;
};

type PolicyContentBarProps = {
  ariaLabel: string;
  classNames: PolicyContentBarClasses;
  heading: string;
  headingId: string;
  topics: readonly PolicyTopic[];
};

export function PolicyContentBar({
  ariaLabel,
  classNames,
  heading,
  headingId,
  topics,
}: PolicyContentBarProps) {
  const [activeId, setActiveId] = useState(topics[0]?.id ?? "");
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (topics.length === 0) {
      return;
    }

    let frame = 0;

    function updateActiveTopic() {
      const offset =
        window.innerWidth <= 640
          ? 150
          : Math.max(130, window.innerHeight * 0.18);
      let currentTopic = topics[0];

      for (let index = topics.length - 1; index >= 0; index -= 1) {
        const topic = topics[index];
        const element = document.getElementById(topic.id);

        if (element && element.getBoundingClientRect().top <= offset) {
          currentTopic = topic;
          break;
        }
      }

      setActiveId(currentTopic.id);
    }

    function scheduleUpdate() {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateActiveTopic);
    }

    updateActiveTopic();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [topics]);

  useEffect(() => {
    if (!activeId) {
      return;
    }

    const activeLink = listRef.current?.querySelector<HTMLAnchorElement>(
      `[data-policy-topic="${activeId}"]`
    );
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    activeLink?.scrollIntoView({
      block: "nearest",
      inline: "center",
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [activeId]);

  return (
    <aside className={classNames.tocCard} aria-labelledby={headingId}>
      <p className={classNames.tocEyebrow}>On this page</p>
      <h2 id={headingId}>{heading}</h2>
      <nav aria-label={ariaLabel}>
        <ol ref={listRef}>
          {topics.map((topic) => (
            <li key={topic.id}>
              <a
                aria-current={activeId === topic.id ? "true" : undefined}
                data-policy-topic={topic.id}
                href={`#${topic.id}`}
              >
                {topic.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </aside>
  );
}
