import { Module } from '@nestjs/common';
import { AppController } from './presentation/controllers/app.controller';
import { CheckoutController } from './presentation/controllers/checkout.controller';
import { ConversionController } from './presentation/controllers/conversion.controller';
import { SystemController } from './presentation/controllers/system.controller';

import { CheckoutApplicationService } from './application/services/CheckoutApplicationService';
import { ConversorMonedaService } from './domain/services/ConversorMonedaService';
import { CalculadorDescuentoService } from './domain/services/CalculadorDescuentoService';
import { CalculadorEnvioService } from './domain/services/CalculadorEnvioService';
import { ValidadorFraudeService } from './domain/services/ValidadorFraudeService';
import { ProcesadorPagoService } from './domain/services/ProcesadorPagoService';

import { ExchangeRateApiProvider } from './infrastructure/providers/ExchangeRateApiProvider';
import { InMemoryUsuarioRepository } from './infrastructure/repositories/InMemoryUsuarioRepository';
import { InMemoryProductoRepository } from './infrastructure/repositories/InMemoryProductoRepository';

@Module({
  imports: [],
  controllers: [
    AppController,
    CheckoutController,
    ConversionController,
    SystemController,
  ],

  providers: [
    CheckoutApplicationService,

    ConversorMonedaService,
    CalculadorDescuentoService,
    CalculadorEnvioService,
    ValidadorFraudeService,
    ProcesadorPagoService,

    {
      provide: 'IProveedorCambioMoneda',
      useClass: ExchangeRateApiProvider,
    },
    {
      provide: 'IUsuarioRepository',
      useClass: InMemoryUsuarioRepository,
    },
    {
      provide: 'IProductoRepository',
      useClass: InMemoryProductoRepository,
    },
  ],
})
export class AppModule { }
