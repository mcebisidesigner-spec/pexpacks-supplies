import * as Sentry from "@sentry/nextjs";

export function reportException(error: unknown, operation: string): void {
  Sentry.withScope((scope) => {
    scope.setTag("operation", operation);
    scope.setLevel("error");
    Sentry.captureException(error);
  });
}