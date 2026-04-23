export type AuthEmailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

/**
 * Sends auth-related email (reset, verify). In development, set `AUTH_EMAIL_MODE=console`
 * (default) to log. For production, set `RESEND_API_KEY` and optionally `RESEND_FROM`.
 */
export async function sendAuthEmail(payload: AuthEmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    const mode = (process.env.AUTH_EMAIL_MODE ?? "console").trim().toLowerCase();
    if (mode !== "console" && mode !== "log") {
      console.warn(
        "[auth email] No RESEND_API_KEY — set it or use AUTH_EMAIL_MODE=console. Logging message.",
      );
    }
    console.log(
      `[auth email] To: ${payload.to}\nSubject: ${payload.subject}\n\n${payload.text}`,
    );
    return;
  }

  const from = process.env.RESEND_FROM?.trim() ?? "onboarding@resend.dev";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [payload.to],
      subject: payload.subject,
      text: payload.text,
      html: payload.html ?? payload.text.replace(/\n/g, "<br/>"),
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Resend error ${String(res.status)}: ${errText}`);
  }
}
