import { Controller, Get, Inject } from "@nestjs/common";
import { LegislativeService } from "./legislative.service";

@Controller("api/legislative")
export class LegislativeController {
  constructor(@Inject(LegislativeService) private readonly legislativeService: LegislativeService) {}

  @Get("mandate")
  getMandate() {
    return this.legislativeService.getMandate();
  }

  @Get("structure")
  getStructure() {
    return this.legislativeService.getStructure();
  }

  @Get("ordinances")
  getOrdinances() {
    return this.legislativeService.getOrdinances();
  }

  @Get("resolutions")
  getResolutions() {
    return this.legislativeService.getResolutions();
  }
}
