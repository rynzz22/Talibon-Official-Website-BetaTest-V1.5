export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
  tags?: Record<string, string>;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  skipped?: boolean;
}

export interface EmailProvider {
  name: string;
  isConfigured(): boolean;
  sendEmail(options: SendEmailOptions): Promise<SendEmailResult>;
}
