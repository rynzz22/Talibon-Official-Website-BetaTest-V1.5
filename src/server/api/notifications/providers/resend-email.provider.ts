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
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 5;
  }

  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: "Resend API key not configured in environment variables."
      };
    }

    try {
      const fromAddress = options.from || this.defaultFrom;
      const fromName = options.fromName || this.defaultFromName;
      const formattedFrom = `${fromName} <${fromAddress}>`;

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
        return {
          success: true,
          messageId: response.data.id
        };
      }

      return {
        success: false,
        error: `Unexpected provider response status: ${response.status}`
      };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Unknown delivery error";
      return {
        success: false,
        error: errorMsg
      };
    }
  }
}
