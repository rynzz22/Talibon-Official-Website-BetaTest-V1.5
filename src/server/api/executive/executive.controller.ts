import { Controller, Get, Inject } from "@nestjs/common";
import { ExecutiveService } from "./executive.service";

@Controller("api/executive")
export class ExecutiveController {
  constructor(@Inject(ExecutiveService) private readonly executiveService: ExecutiveService) {}

  @Get("mandate")
  getMandate() {
    return this.executiveService.getMandate();
  }

  @Get("vision-mission")
  getVisionMission() {
    return this.executiveService.getVisionMission();
  }

  @Get("chart")
  getChart() {
    return this.executiveService.getChart();
  }

  @Get("directory")
  getDirectory() {
    return this.executiveService.getDirectory();
  }

  @Get("gad-ims")
  getGadIms() {
    return this.executiveService.getGadIms();
  }
}
