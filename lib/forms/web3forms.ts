/**
 * Shared utility for forwarding form submissions to Web3Forms.
 *
 * The access key is read from `process.env.WEB3FORMS_ACCESS_KEY` and must
 * never be imported into client code or exposed through NEXT_PUBLIC_ variables.
 */

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

export type Web3FormsResult = {
  success: boolean;
  message: string;
};

type SendToWeb3FormsOptions = {
  /** Email subject line shown in the Web3Forms notification */
  subject: string;
  /** Human-readable form name for internal tracking */
  formName: string;
  /** Key-value payload — all values will be stringified */
  payload: Record<string, unknown>;
};

export async function sendToWeb3Forms({
  subject,
  formName,
  payload,
}: SendToWeb3FormsOptions): Promise<Web3FormsResult> {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;

  if (!accessKey) {
    console.error(
      "[Web3Forms] WEB3FORMS_ACCESS_KEY is not configured. Skipping submission."
    );
    return {
      success: false,
      message:
        "Form handler is not configured. Please contact PexPacks directly.",
    };
  }

  const body: Record<string, string> = {
    access_key: accessKey,
    subject,
    from_name: "Pexpacks Website",
    form_name: formName,
  };

  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null) continue;
    body[key] = String(value);
  }

  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    const controller = new AbortController();
    timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const result = (await response.json()) as {
      success?: boolean;
      message?: string;
    };

    if (!response.ok || !result.success) {
      console.error("[Web3Forms] Submission rejected:", result.message);
      return {
        success: false,
        message:
          "We could not submit your enquiry right now. Please try again or contact PexPacks directly.",
      };
    }

    return {
      success: true,
      message:
        "Thank you. Your enquiry has been received. The Pexpacks team will contact you soon.",
    };
  } catch (error) {
    console.error("[Web3Forms] Network error:", error);
    return {
      success: false,
      message:
        "We could not submit your enquiry right now. Please try again or contact PexPacks directly.",
    };
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}
