import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient | null = null;

  constructor() {
    let rawUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!rawUrl || !supabaseKey) {
      console.warn("[Supabase Server] Warning: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Backend services requiring Supabase will fail.");
      return;
    }

    const sanitizeUrl = (url: string): string => {
      let trimmed = url.trim();
      while (trimmed.endsWith('/')) {
        trimmed = trimmed.slice(0, -1);
      }
      if (trimmed.endsWith('/rest/v1')) {
        trimmed = trimmed.slice(0, -8);
      }
      while (trimmed.endsWith('/')) {
        trimmed = trimmed.slice(0, -1);
      }
      return trimmed;
    };

    const supabaseUrl = sanitizeUrl(rawUrl);

    try {
      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
    } catch (error) {
      console.error("[Supabase Server] Initialization error:", error);
    }
  }

  getClient() {
    if (!this.supabase) {
      throw new InternalServerErrorException(
        "Supabase server-side configuration is incomplete. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment variables."
      );
    }
    return this.supabase;
  }
}
