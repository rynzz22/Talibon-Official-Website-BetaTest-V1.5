import { Controller, Get, Inject } from "@nestjs/common";
import { AboutService } from "./about.service";

@Controller("api/about")
export class AboutController {
  constructor(@Inject(AboutService) private readonly aboutService: AboutService) {}

  @Get("profile")
  getProfile() {
    return this.aboutService.getProfile();
  }

  @Get("seal")
  getSeal() {
    return this.aboutService.getSeal();
  }

  @Get("history")
  getHistory() {
    return this.aboutService.getHistory();
  }

  @Get("mayors")
  getMayors() {
    return this.aboutService.getMayors();
  }

  @Get("departments")
  getDepartments() {
    return this.aboutService.getDepartments();
  }

  @Get("vicinity-map")
  getVicinityMap() {
    return this.aboutService.getVicinityMap();
  }

  @Get("barangays")
  getBarangays() {
    return this.aboutService.getBarangays();
  }

  @Get("industry")
  getIndustry() {
    return this.aboutService.getIndustry();
  }

  @Get("services")
  getServices() {
    return this.aboutService.getServices();
  }

  @Get("hymn")
  getHymn() {
    return this.aboutService.getHymn();
  }

  @Get("demographics")
  getDemographics() {
    return this.aboutService.getDemographics();
  }

  @Get("location")
  getLocation() {
    return this.aboutService.getLocation();
  }
}
