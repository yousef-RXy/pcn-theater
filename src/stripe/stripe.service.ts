import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    const secretKey =
      this.configService.get<string>('STRIPE_SECRET_KEY') ||
      'fallbackSecretKey';
    this.stripe = new Stripe(secretKey);
  }

  async createPaymentIntent(amount: number, currency: string) {
    return this.stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  verifyWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );

    if (!webhookSecret) {
      throw new Error('Webhook secret configuration is missing');
    }

    try {
      return this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      throw new BadRequestException(
        `Webhook signature verification failed: ${errorMessage}`,
      );
    }
  }
}
