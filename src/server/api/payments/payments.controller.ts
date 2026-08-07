import { Controller, Post, Body, Req, Inject } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import type { Request } from "express";

@Controller("api/payments")
export class PaymentsController {
  constructor(@Inject(PaymentsService) private readonly paymentsService: PaymentsService) {}

  @Post("create-checkout-session")
  async createCheckoutSession(@Body() body: { itemName: string; amount: number; successUrl?: string; cancelUrl?: string }, @Req() req: Request) {
    const protocol = req.protocol;
    const host = req.get("host");
    const baseUrl = `${protocol}://${host}`;

    const { 
      itemName, 
      amount, 
      successUrl = `${baseUrl}/payment/success`, 
      cancelUrl = `${baseUrl}/payment/cancel` 
    } = body;

    return this.paymentsService.createCheckoutSession(itemName, amount, successUrl, cancelUrl);
  }
}
