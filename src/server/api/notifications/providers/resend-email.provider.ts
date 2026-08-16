import axios from "axios";
import { EmailProvider, SendEmailOptions, SendEmailResult } from "../email-provider.interface";

export class ResendEmailProvider implements EmailProvider {
  name = "Resend";

  private apiKey: string;
  private defaultFrom: string;
  private defaultFromName: string;

  constructor() {
    this.apiKey = (process.env.RESEND_API_KEY || "").trim();
    this.defaultFrom = (process.env.EMAIL_FROM_ADDRESS || "notifications@talibon.gov.ph").trim();
    this.defaultFromName = (process.env.EMAIL_FROM_NAME || "Municipality of Talibon").trim();

    // Safe environment presence check (never logs secret values)
    const hasKey = !!this.apiKey && this.apiKey.length > 5;
    console.log(
      `[EMAIL_PROVIDER] Resend Provider initialized. RESEND_API_KEY: ${hasKey ? "PRESENT" : "MISSING"}, EMAIL_FROM_ADDRESS: ${this.defaultFrom ? "PRESENT" : "MISSING"} (${this.defaultFrom}), EMAIL_FROM_NAME: ${this.defaultFromName ? "PRESENT" : "MISSING"}`
    );
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 5;
  }

  /**
   * Helper to mask email address in logs
   */
  private maskEmail(email: string): string {
    if (!email || !email.includes("@")) return "invalid-email";
    const [user, domain] = email.split("@");
    if (user.length <= 2) return `${user[0]}*@${domain}`;
    return `${user[0]}${"*".repeat(Math.max(1, user.length - 2))}${user[user.length - 1]}@${domain}`;
  }

  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    if (!this.isConfigured()) {
      console.warn("[EMAIL_PROVIDER] Send aborted: RESEND_API_KEY is MISSING in environment variables.");
      return {
        success: false,
        error: "RESEND_API_KEY is not configured in server environment variables."
      };
    }

    const fromAddress = options.from || this.defaultFrom;
    const fromName = options.fromName || this.defaultFromName;
    const formattedFrom = `${fromName} <${fromAddress}>`;
    const maskedTo = this.maskEmail(options.to);

    console.log(`[EMAIL_PROVIDER] Dispatching via Resend API -> To: ${maskedTo}, From: ${formattedFrom}, Subject: "${options.subject}"`);

    try {
      const payload: Record<string, any> = {
        from: formattedFrom,
        to: [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text
      };

      if (options.replyTo) {
        payload.reply_to = options.replyTo;
      }

      if (options.tags) {
        payload.tags = Object.entries(options.tags).map(([name, value]) => ({ name, value }));
      }

      const response = await axios.post("https://api.resend.com/emails", payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      });

      if (response.status >= 200 && response.status < 300 && response.data?.id) {
        const messageId = response.data.id;
        console.log(`[EMAIL_PROVIDER] Resend delivery SUCCESS. Message ID: ${messageId}, Status Code: ${response.status}`);
        return {
          success: true,
          messageId
        };
      }

      console.warn(`[EMAIL_PROVIDER] Resend returned unexpected HTTP status ${response.status}:`, response.data);
      return {
        success: false,
        error: `Unexpected provider response status: ${response.status}`
      };
    } catch (err: any) {
      const status = err.response?.status;
      const responseData = err.response?.data;
      const resendErrorName = responseData?.name || "error";
      const resendErrorMessage = responseData?.message || err.message || "Unknown error";

      if (status === 401) {
        console.error(`[EMAIL_PROVIDER] Resend HTTP 401 Unauthorized: Invalid or revoked RESEND_API_KEY.`);
      } else if (status === 403) {
        console.error(
          `[EMAIL_PROVIDER] Resend HTTP 403 Forbidden: Sender domain not verified or recipient not permitted. ` +
          `Sender: "${fromAddress}". Resend Message: "${resendErrorMessage}". ` +
          `Note: Free/test Resend accounts require a verified custom domain to send to external recipients, or can only send to the account owner's email address.`
        );
      } else if (status === 422 || status === 400) {
        console.error(`[EMAIL_PROVIDER] Resend HTTP ${status} Validation Error: ${resendErrorName} - ${resendErrorMessage}`);
      } else if (status === 429) {
        console.error(`[EMAIL_PROVIDER] Resend HTTP 429 Rate Limit Exceeded: ${resendErrorMessage}`);
      } else if (status >= 500) {
        console.error(`[EMAIL_PROVIDER] Resend HTTP ${status} Provider Server Error: ${resendErrorMessage}`);
      } else {
        console.error(`[EMAIL_PROVIDER] Resend Network/Connection Error: ${err.message}`);
      }

      return {
        success: false,
        error: `[${resendErrorName}] ${resendErrorMessage}`
      };
    }
  }
}

// test to redeploy