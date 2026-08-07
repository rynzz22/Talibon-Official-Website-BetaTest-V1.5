import { Controller, Get, Inject } from "@nestjs/common";
import { TourismService } from "./tourism.service";

@Controller("api/tourism")
export class TourismController {
  constructor(@Inject(TourismService) private readonly tourismService: TourismService) {}

  @Get("spots")
  getSpots() {
    return this.tourismService.getSpots();
  }

  @Get("festivities")
  getFestivities() {
    return this.tourismService.getFestivities();
  }

  @Get("delicacies")
  getDelicacies() {
    return this.tourismService.getDelicacies();
  }
}
