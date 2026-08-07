import { Controller, Get, Inject } from "@nestjs/common";
import { TransparencyService } from "./transparency.service";

@Controller("api/transparency")
export class TransparencyController {
  constructor(@Inject(TransparencyService) private readonly transparencyService: TransparencyService) {}

  @Get("citizen-charter")
  getCitizenCharter() {
    return this.transparencyService.getCitizenCharter();
  }

  @Get("full-disclosure")
  getFullDisclosure() {
    return this.transparencyService.getFullDisclosure();
  }

  @Get("infrastructure")
  getInfrastructure() {
    return this.transparencyService.getInfrastructure();
  }

  @Get("finance-reports")
  getFinanceReports() {
    return this.transparencyService.getFinanceReports();
  }

  @Get("executive-orders")
  getExecutiveOrders() {
    return this.transparencyService.getExecutiveOrders();
  }

  @Get("budget")
  getBudget() {
    return this.transparencyService.getBudget();
  }

  @Get("bayanihan-grant")
  getBayanihanGrant() {
    return this.transparencyService.getBayanihanGrant();
  }

  @Get("biddings")
  getBiddings() {
    return this.transparencyService.getBiddings();
  }

  @Get("ordinances")
  getOrdinances() {
    return this.transparencyService.getOrdinances();
  }

  @Get("sroi")
  getSroi() {
    return this.transparencyService.getSroi();
  }
}
