import { Module } from '@nestjs/common';
import { CheckoutController } from './presentation/controllers/checkout.controller';
import { CheckoutApplicationService } from './application/services/CheckoutApplicationService';

@Module({
  controllers: [CheckoutController],
  providers: [CheckoutApplicationService],
})
export class AppModule {}