import { Controller, Get, Post, Put, Body, Param, Inject } from "@nestjs/common";
import { FormsService } from "./forms.service";

@Controller("api/forms")
export class FormsController {
  constructor(@Inject(FormsService) private readonly formsService: FormsService) {}

  @Get("certificate")
  async getAllRequests() {
    return this.formsService.getAllRequests();
  }

  @Post("certificate")
  async submitRequest(@Body() payload: any) {
    return this.formsService.submitRequest(payload);
  }

  @Get("certificate/:ticketId")
  async getRequestStatus(@Param("ticketId") ticketId: string) {
    const request = await this.formsService.getRequestStatus(ticketId);
    if (!request) {
      return { success: false, message: "Ticket ID not found." };
    }
    return { success: true, request };
  }

  @Put("certificate/:id/status")
  async updateRequestStatus(
    @Param("id") id: string,
    @Body() body: { status: string; remarks: string; notifyCitizen?: boolean; saveTimeline?: boolean }
  ) {
    const success = await this.formsService.updateRequestStatus(
      id,
      body.status,
      body.remarks,
      body.notifyCitizen !== false,
      body.saveTimeline !== false
    );
    return { success };
  }

  @Get("downloadable")
  getDownloadable() {
    return this.formsService.getDownloadable();
  }

  @Get("business-permits")
  getBusinessPermits() {
    return this.formsService.getBusinessPermits();
  }

  @Get("building-permits")
  getBuildingPermits() {
    return this.formsService.getBuildingPermits();
  }

  @Get("zoning-clearance")
  getZoningClearance() {
    return this.formsService.getZoningClearance();
  }
}
