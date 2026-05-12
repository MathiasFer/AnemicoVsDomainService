import { Controller, Get, Query } from '@nestjs/common';

import { ConversorMonedaService }
from '../../domain/services/ConversorMonedaService';

import { ExchangeRateApiProvider }
from '../../infrastructure/providers/ExchangeRateApiProvider';

@Controller('conversion')
export class ConversionController {

  @Get()
  async convertir(
    @Query('monto') monto: number,
    @Query('origen') origen: string,
    @Query('destino') destino: string,
  ) {

    const provider =
      new ExchangeRateApiProvider();

    const conversor =
      new ConversorMonedaService(provider);

    const resultado =
      await conversor.convertir(
        Number(monto),
        origen,
        destino
      );

    return {
      montoOriginal: monto,
      monedaOrigen: origen,
      monedaDestino: destino,
      resultado,
    };
  }
}