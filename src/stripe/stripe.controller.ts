/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Post,
  Body,
  Headers,
  Req,
  BadRequestException,
  HttpCode,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-payment-intent')
  async createPaymentIntent(
    @Body() body: { amount: number; currency: string },
  ) {
    return this.stripeService.createPaymentIntent(body.amount, body.currency);
  }

  @Post('webhook')
  @HttpCode(200)
  handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      throw new BadRequestException('Missing raw request body');
    }

    const event = this.stripeService.verifyWebhookEvent(rawBody, signature);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntentSucceeded = event.data.object;
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntentFailed = event.data.object;
        break;
      }
      default:
        break;
    }

    return { received: true };
  }
}
