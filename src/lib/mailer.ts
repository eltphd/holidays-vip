import { Resend } from "resend";

const FROM = process.env.MAIL_FROM ?? "holidayz.vip <hello@us-squared.org>";

export interface DeliveryEmail {
  to: string;
  discreet: boolean;
  kitName: string;
  fileName: string;
  downloadUrl: string;
}

/** Discreet-mode SKUs get a neutral subject and body; nothing names the category or the kit. */
export function renderDelivery(e: DeliveryEmail): { subject: string; text: string } {
  if (e.discreet) {
    return {
      subject: "Your holidayz.vip kit",
      text: [
        "Hi,",
        "",
        "Your holidayz.vip kit is ready. Download it here:",
        e.downloadUrl,
        "",
        `File: ${e.fileName}`,
        "",
        "If anything is off, reply to this email.",
        "",
        "hello@us-squared.org",
      ].join("\n"),
    };
  }
  return {
    subject: `Your ${e.kitName} kit is ready`,
    text: [
      "Hi,",
      "",
      `Your ${e.kitName} kit from holidayz.vip is ready. Download it here:`,
      e.downloadUrl,
      "",
      `File: ${e.fileName}`,
      "",
      "If anything is off, reply to this email.",
      "",
      "hello@us-squared.org",
    ].join("\n"),
  };
}

/** Sends via Resend when RESEND_API_KEY is set; otherwise logs (documented manual fallback). */
export async function sendDelivery(e: DeliveryEmail): Promise<{ sent: boolean; id?: string }> {
  const { subject, text } = renderDelivery(e);
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[mailer:dry-run] to=${e.to} subject="${subject}"`);
    return { sent: false };
  }
  const resend = new Resend(key);
  const { data, error } = await resend.emails.send({ from: FROM, to: e.to, subject, text });
  if (error) throw new Error(`Resend: ${error.message}`);
  return { sent: true, id: data?.id };
}
