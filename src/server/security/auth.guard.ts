import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  SetMetadata,
  Inject
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { SupabaseService } from "../supabase.service";

export const IS_PUBLIC_KEY = "isPublic";
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = "roles";
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const REQUIRE_AUTH_KEY = "requireAuth";
export const RequireAuth = () => SetMetadata(REQUIRE_AUTH_KEY, true);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private reflector: Reflector,
    @Inject(SupabaseService) private supabaseService: SupabaseService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    const requireAuth = this.reflector.getAllAndOverride<boolean>(REQUIRE_AUTH_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    // If public and no specific roles or requireAuth needed, pass
    if (isPublic && !requiredRoles && !requireAuth) {
      return true;
    }

    // If route doesn't require auth/roles explicitly, pass by default
    if (!requireAuth && !requiredRoles) {
      return true;
    }

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Authorization header missing or invalid format.");
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      throw new UnauthorizedException("Bearer token missing.");
    }

    try {
      const client = this.supabaseService.getClient();
      const { data, error } = await client.auth.getUser(token);

      if (error || !data.user) {
        throw new UnauthorizedException("Invalid or expired authentication token.");
      }

      (req as any).user = data.user;

      // Role authorization check if roles specified
      if (requiredRoles && requiredRoles.length > 0) {
        const userId = data.user.id;
        const { data: profile } = await client
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .maybeSingle();

        const userRole = profile?.role || data.user.app_metadata?.role || "citizen";

        const hasRole = requiredRoles.some(r => r.toLowerCase() === userRole.toLowerCase());
        if (!hasRole) {
          throw new ForbiddenException("Access denied. Required administrative privileges are missing.");
        }
      }

      return true;
    } catch (err: any) {
      if (err instanceof ForbiddenException || err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException("Authentication token verification failed.");
    }
  }
}
