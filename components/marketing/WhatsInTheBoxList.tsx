"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Marketing.module.css";

const items = [
  "Exercise books, pens, pencils and rulers",
  "Glue, files, crayons or colour pencils where required",
  "Grade-specific school-list items packed with care",
  "Optional: Books pre-covered and labelled via Pexcover",
  "Ready for the first day of school or collection",
];

export function WhatsInTheBoxList() {
  const [isVisible, setIsVisible] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -50px 0px" }
    );

    if (listRef.current) {
      observer.observe(listRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <ul
      ref={listRef}
      className={[styles.checkList, styles.checkListSpaced].join(" ")}
    >
      {items.map((item, index) => (
        <li
          key={index}
          className={isVisible ? styles.animateSlideIn : styles.opacityZero}
          style={{ animationDelay: `${index * 120}ms` }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
