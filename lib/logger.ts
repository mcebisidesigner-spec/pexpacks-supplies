type LogContext = Record<string, unknown>;

function maskValue(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  if (value.includes("@")) {
    const [name, domain] = value.split("@");
    return `${name.slice(0, 2)}***@${domain}`;
  }

  const digits = value.replace(/\D/g, "");
  if (digits.length >= 7) {
    return `${digits.slice(0, 3)}***${digits.slice(-2)}`;
  }

  return value;
}

function safeContext(context: LogContext = {}) {
  if (process.env.NODE_ENV !== "production") {
    return context;
  }

  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => {
      if (["email", "phone", "fullName", "learnerName", "message"].includes(key)) {
        return [key, maskValue(value)];
      }

      return [key, value];
    })
  );
}

export const logger = {
  info(message: string, context?: LogContext) {
    console.info(message, safeContext(context));
  },
  warn(message: string, context?: LogContext) {
    console.warn(message, safeContext(context));
  },
  error(message: string, context?: LogContext) {
    console.error(message, safeContext(context));
  }
};
