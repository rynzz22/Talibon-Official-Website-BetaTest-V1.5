import { Controller, Post, Body, Req, Inject } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { CreateCheckoutSessionDto } from "./dto/checkout-session.dto";
import { RateLimit, RateLimitCategory } from "../../security/rate-limiter.guard";
import type { Request } from "express";

@Controller("api/payments")
export class PaymentsController {
  constructor(@Inject(PaymentsService) private readonly paymentsService: PaymentsService) {}

  @Post("create-checkout-session")
  @RateLimit(RateLimitCategory.PAYMENT)
  async createCheckoutSession(
    @Body() dto: CreateCheckoutSessionDto,
    @Req() req: Request
  ) {
    const protocol = req.protocol;
    const host = req.get("host");
    const baseUrl = `${protocol}://${host}`;

    const {
      itemName,
      amount,
      successUrl = `${baseUrl}/payment/success`,
      cancelUrl = `${baseUrl}/payment/cancel`
    } = dto;

    return this.paymentsService.createCheckoutSession(itemName, amount, successUrl, cancelUrl);
  }
}
