"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import styles from "./BackToSchoolQuiz.module.css";

type QuizAnswer = "ready" | "not-yet" | "unsure";

type QuizQuestion = {
  id: string;
  question: string;
  detail: string;
  options: Array<{
    value: QuizAnswer;
    label: string;
  }>;
};

type ApiResponse = {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
};

const questions: QuizQuestion[] = [
  {
    id: "labels",
    question: "Are every learner's items labelled?",
    detail: "Books, pencils, lunch gear and uniforms are the usual lost-property risks.",
    options: [
      { value: "ready", label: "Yes, labelled" },
      { value: "not-yet", label: "Not yet" },
      { value: "unsure", label: "Not sure" },
    ],
  },
  {
    id: "book-covers",
    question: "Are exercise books covered and protected?",
    detail: "Covered books survive the first week better and keep stationery neat.",
    options: [
      { value: "ready", label: "Already covered" },
      { value: "not-yet", label: "Still need covers" },
      { value: "unsure", label: "Need to check" },
    ],
  },
  {
    id: "lunchbox-gear",
    question: "Is the lunchbox and water-bottle gear ready?",
    detail: "Small extras are easy to forget until the first school morning.",
    options: [
      { value: "ready", label: "Ready" },
      { value: "not-yet", label: "Need extras" },
      { value: "unsure", label: "Not sure" },
    ],
  },
];

function getReadinessLabel(answers: Record<string, QuizAnswer>) {
  const readyCount = Object.values(answers).filter(
    (answer) => answer === "ready"
  ).length;

  if (readyCount === questions.length) {
    return "Day 1 ready";
  }

  if (readyCount >= 1) {
    return "Almost ready";
  }

  return "Needs a quick plan";
}

function getAnswerLabel(question: QuizQuestion, answer?: QuizAnswer) {
  return question.options.find((option) => option.value === answer)?.label;
}

export function BackToSchoolQuiz() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuizAnswer>>({});
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<ApiResponse | null>(null);

  const currentQuestion = questions[activeIndex];
  const isComplete = Object.keys(answers).length === questions.length;
  const readinessLabel = getReadinessLabel(answers);

  function answerQuestion(answer: QuizAnswer) {
    setAnswers((current) => ({
      ...current,
      [currentQuestion.id]: answer,
    }));
    setStatus(null);

    if (activeIndex < questions.length - 1) {
      setActiveIndex((index) => index + 1);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    if (formData.get("companyWebsite")) {
      setStatus({ success: true, message: "Checklist sent." });
      return;
    }

    if (!email.trim()) {
      setStatus({
        success: false,
        message: "Please enter your email address.",
      });
      return;
    }

    setPending(true);
    setStatus(null);

    const answerSummary = questions
      .map((question) => `${question.question}: ${getAnswerLabel(question, answers[question.id])}`)
      .join("\n");

    const payload = {
      formType: "readiness-quiz" as const,
      fullName: "Back-to-school quiz lead",
      email: email.trim(),
      contactDetail: email.trim(),
      enquiryType: "Back-to-school readiness quiz",
      packType: "readiness-quiz",
      message: [
        `Readiness result: ${readinessLabel}`,
        "",
        answerSummary,
        "",
        "Requested personalized checklist and 5% discount code READY5.",
      ].join("\n"),
      consent: true,
      sourceUrl: window.location.href,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      submittedAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/forms/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as ApiResponse;

      setStatus(
        result.success
          ? {
              success: true,
              message:
                "Checklist requested. Use code READY5 for 5% off your first pack.",
            }
          : result
      );

      if (result.success) {
        setEmail("");
      }
    } catch {
      setStatus({
        success: false,
        message:
          "We could not send the checklist right now. Please try again shortly.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <section className={styles.quizSection} aria-labelledby="readiness-quiz-heading">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>30-second check</p>
          <h2 id="readiness-quiz-heading">Are you prepared for Day 1?</h2>
          <span>
            Answer three quick questions and get a personalized checklist plus a
            5% first-pack discount code.
          </span>
        </div>

        <div className={styles.card}>
          <div className={styles.progress} aria-hidden="true">
            {questions.map((question, index) => (
              <span
                className={[
                  index <= activeIndex ? styles.progressActive : "",
                  answers[question.id] ? styles.progressCompleted : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={question.id}
              />
            ))}
          </div>

          {!isComplete ? (
            <div className={styles.questionPanel}>
              <p className={styles.stepLabel}>
                Question {activeIndex + 1} of {questions.length}
              </p>
              <h3>{currentQuestion.question}</h3>
              <p>{currentQuestion.detail}</p>
              <div className={styles.optionGrid} role="radiogroup">
                {currentQuestion.options.map((option) => (
                  <button
                    className={`${styles.optionButton} ${
                      answers[currentQuestion.id] === option.value
                        ? styles.optionSelected
                        : ""
                    }`}
                    type="button"
                    role="radio"
                    aria-checked={answers[currentQuestion.id] === option.value}
                    onClick={() => answerQuestion(option.value)}
                    key={option.value}
                  >
                    <span className={styles.optionCheck} aria-hidden="true">
                      ✓
                    </span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.resultPanel}>
              <p className={styles.stepLabel}>Your result</p>
              <h3>{readinessLabel}</h3>
              <p>
                We will turn your answers into a simple checklist for labels,
                book covers and daily school gear.
              </p>
              <form className={styles.emailForm} onSubmit={handleSubmit} noValidate>
                <label className={styles.emailField}>
                  <span>Email my checklist</span>
                  <input
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="parent@example.com"
                    autoComplete="email"
                    required
                  />
                </label>
                <label className={styles.honeypot} aria-hidden="true">
                  Company website
                  <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
                </label>
                <button className={styles.submitButton} type="submit" disabled={pending}>
                  {pending ? "Sending..." : "Get checklist + 5% code"}
                </button>
              </form>
              {status ? (
                <p
                  className={
                    status.success ? styles.statusSuccess : styles.statusError
                  }
                  role={status.success ? "status" : "alert"}
                  aria-live="polite"
                >
                  {status.message}
                </p>
              ) : null}
              <Link
                href="/schools"
                className={styles.quizCtaLink}
              >
                Find your school pack now &rarr;
              </Link>
              <button
                className={styles.resetButton}
                type="button"
                onClick={() => {
                  setAnswers({});
                  setActiveIndex(0);
                  setStatus(null);
                }}
              >
                Retake quiz
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
