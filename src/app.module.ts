import { Module } from '@nestjs/common';

import { AppController } from './presentation/controllers/app.controller';

import { CheckoutController }
from './presentation/controllers/checkout.controller';

@Module({
  imports: [],

  controllers: [
    AppController,
    CheckoutController,
  ],

  providers: [],
})
export class AppModule {}