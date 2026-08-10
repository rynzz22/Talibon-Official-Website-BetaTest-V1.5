import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Inject,
  BadRequestException,
  UseGuards
} from "@nestjs/common";
import { FormsService } from "./forms.service";
import { CreateCertificateRequestDto } from "./dto/certificate-request.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { RateLimit, RateLimitCategory } from "../../security/rate-limiter.guard";
import { Roles, RequireAuth } from "../../security/auth.guard";

@Controller("api/forms")
export class FormsController {
  constructor(@Inject(FormsService) private readonly formsService: FormsService) {}

  @Get("certificate")
  @RateLimit(RateLimitCategory.ADMIN_MUTATION)
  @RequireAuth()
  @Roles("admin", "super_admin", "staff")
  async getAllRequests() {
    return this.formsService.getAllRequests();
  }

  @Post("certificate")
  @RateLimit(RateLimitCategory.CITIZEN_SUBMISSION)
  async submitRequest(@Body() dto: CreateCertificateRequestDto) {
    return this.formsService.submitRequest(dto);
  }

  @Get("certificate/:ticketId")
  @RateLimit(RateLimitCategory.TRACKING)
  async getRequestStatus(@Param("ticketId") ticketId: string) {
    const sanitized = ticketId ? ticketId.trim() : "";
    if (!sanitized || sanitized.length > 100) {
      throw new BadRequestException("Invalid ticket ID provided.");
    }
    const request = await this.formsService.getRequestStatus(sanitized);
    if (!request) {
      return { success: false, message: "Ticket ID or tracking code not found." };
    }
    return { success: true, request };
  }

  @Put("certificate/:id/status")
  @RateLimit(RateLimitCategory.ADMIN_MUTATION)
  @RequireAuth()
  @Roles("admin", "super_admin", "staff")
  async updateRequestStatus(
    @Param("id") id: string,
    @Body() dto: UpdateStatusDto
  ) {
    if (!id || id.length > 100) {
      throw new BadRequestException("Invalid request ID.");
    }
    const success = await this.formsService.updateRequestStatus(
      id,
      dto.status,
      dto.remarks || "",
      dto.notifyCitizen !== false,
      dto.saveTimeline !== false
    );
    return { success };
  }

  @Get("downloadable")
  @RateLimit(RateLimitCategory.PUBLIC_READ)
  getDownloadable() {
    return this.formsService.getDownloadable();
  }

  @Get("business-permits")
  @RateLimit(RateLimitCategory.PUBLIC_READ)
  getBusinessPermits() {
    return this.formsService.getBusinessPermits();
  }

  @Get("building-permits")
  @RateLimit(RateLimitCategory.PUBLIC_READ)
  getBuildingPermits() {
    return this.formsService.getBuildingPermits();
  }

  @Get("zoning-clearance")
  @RateLimit(RateLimitCategory.PUBLIC_READ)
  getZoningClearance() {
    return this.formsService.getZoningClearance();
  }
}
