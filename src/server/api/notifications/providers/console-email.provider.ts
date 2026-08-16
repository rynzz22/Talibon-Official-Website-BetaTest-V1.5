import { EmailProvider, SendEmailOptions, SendEmailResult } from "../email-provider.interface";

export class ConsoleEmailProvider implements EmailProvider {
  name = "Console (Development Simulator)";

  isConfigured(): boolean {
    return true;
  }

  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    const maskedTo = options.to.replace(/^(.)(.*)(@.*)$/, (_, first, middle, domain) => {
      return `${first}${"*".repeat(Math.max(1, middle.length))}${domain}`;
    });

    console.log(`[EmailNotification:Simulated] Destination: ${maskedTo}`);
    console.log(`[EmailNotification:Simulated] Subject: ${options.subject}`);
    console.log(`[EmailNotification:Simulated] From: ${options.fromName || "Municipality of Talibon"} <${options.from || "notifications@talibon.gov.ph"}>`);
    
    return {
      success: true,
      messageId: `sim-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    };
  }
}
