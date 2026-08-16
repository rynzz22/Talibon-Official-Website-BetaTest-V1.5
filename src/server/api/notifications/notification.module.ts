import { Module } from "@nestjs/common";
import { EmailNotificationService } from "./email-notification.service";
import { SupabaseService } from "../../supabase.service";

@Module({
  providers: [SupabaseService, EmailNotificationService],
  exports: [EmailNotificationService]
})
export class NotificationsModule {}
