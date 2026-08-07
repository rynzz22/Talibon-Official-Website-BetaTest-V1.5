import { Injectable, InternalServerErrorException, BadRequestException } from "@nestjs/common";
import { Xendit } from "xendit-node";
import { CreateInvoiceRequest } from "xendit-node/invoice/models/CreateInvoiceRequest";

const MIN_AMOUNT = 1;
const MAX_AMOUNT = 1_000_000;

@Injectable()
export class PaymentsService {
  private xenditClient: Xendit | null = null;

  private get client() {
    if (!this.xenditClient) {
      const secretKey = process.env.XENDIT_SECRET_KEY;
      if (!secretKey) {
        throw new InternalServerErrorException(
          "Xendit payment gateway is not configured. Please set XENDIT_SECRET_KEY in environment variables."
        );
      }
      this.xenditClient = new Xendit({ secretKey });
    }
    return this.xenditClient;
  }

  async createCheckoutSession(
    itemName: string,
    amount: number,
    successUrl: string,
    cancelUrl: string
  ) {
    if (!itemName || typeof itemName !== "string" || itemName.trim().length === 0) {
      throw new BadRequestException("Item name is required.");
    }

    if (!Number.isFinite(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      throw new BadRequestException(
        `Amount must be between ₱${MIN_AMOUNT} and ₱${MAX_AMOUNT.toLocaleString()}.`
      );
    }

    const roundedAmount = Math.round(amount * 100) / 100;
    const externalId = `talibon-pay-${Date.now()}`;

    try {
      const invoiceRequest: CreateInvoiceRequest = {
        externalId: externalId,
        amount: roundedAmount,
        currency: "PHP",
        description: itemName.trim().slice(0, 200),
        successRedirectUrl: successUrl,
        failureRedirectUrl: cancelUrl,
        items: [
          {
            name: itemName.trim().slice(0, 200),
            quantity: 1,
            price: roundedAmount,
          }
        ],
        fees: []
      };

      const response = await this.client.Invoice.createInvoice({
        data: invoiceRequest
      });

      if (!response?.invoiceUrl) {
        throw new InternalServerErrorException("Invalid response from Xendit payment gateway.");
      }

      return {
        sessionId: response.id as string,
        url: response.invoiceUrl as string,
      };
    } catch (error: any) {
      console.error("[Xendit] Error:", error?.response?.data || error);

      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }

      // Handle Xendit specific errors
      if (error?.status === 401) {
        throw new InternalServerErrorException(
          "Xendit authentication failed. Please verify your API key."
        );
      }

      throw new InternalServerErrorException(
        "Xendit payment processing failed. Please try again later or contact support."
      );
    }
  }
}
