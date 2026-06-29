"use client";

import { useEffect, useRef, useState } from "react";
import { useHideHeaderOnScroll } from "@/hooks/useHideHeaderOnScroll";

type PolicyTopic = {
  id: string;
  title: string;
};

type PolicyContentBarClasses = {
  tocCard: string;
  tocEyebrow: string;
  tocShell: string;
  tocShellFloating?: string;
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
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { isHidden: isHeaderHidden, isAtTop } = useHideHeaderOnScroll({
    hideAfter: 64,
    directionThreshold: 4,
  });
  const isFloating = isHeaderHidden && !isAtTop;

  useEffect(() => {
    if (topics.length === 0) {
      return;
    }

    function updateActiveTopic() {
      const offset =
        window.innerWidth <= 640
          ? Math.max(150, window.innerHeight * 0.22)
          : Math.max(140, window.innerHeight * 0.2);
      let currentTopic = topics[0];

      for (let index = topics.length - 1; index >= 0; index -= 1) {
        const topic = topics[index];
        const element = document.getElementById(topic.id);

        if (element && element.getBoundingClientRect().top <= offset) {
          currentTopic = topic;
          break;
        }
      }

      setActiveId((previousId) =>
        previousId === currentTopic.id ? previousId : currentTopic.id
      );
    }

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(updateActiveTopic, {
      root: null,
      rootMargin: "-18% 0px -62% 0px",
      threshold: [0, 0.1, 0.5, 1],
    });

    const observedElements = topics
      .map((topic) => document.getElementById(topic.id))
      .filter((element): element is HTMLElement => Boolean(element));

    observedElements.forEach((element) => {
      observerRef.current?.observe(element);
    });
    updateActiveTopic();

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [topics]);

  return (
    <aside
      className={[
        classNames.tocShell,
        isFloating ? classNames.tocShellFloating : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby={headingId}
    >
      <div className={classNames.tocCard}>
        <p className={classNames.tocEyebrow}>On this page</p>
        <h2 id={headingId}>{heading}</h2>
        <nav aria-label={ariaLabel}>
          <ol>
            {topics.map((topic) => (
              <li key={topic.id}>
                <a
                  aria-current={activeId === topic.id ? "true" : undefined}
                  data-policy-topic={topic.id}
                  href={`#${topic.id}`}
                  onClick={() => setActiveId(topic.id)}
                >
                  {topic.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </aside>
  );
}
