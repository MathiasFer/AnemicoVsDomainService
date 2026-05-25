import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConversorMonedaService } from '../../domain/services/ConversorMonedaService';
import { DomainException } from '../../domain/exceptions/DomainException';

@Controller('conversion')
export class ConversionController {
  constructor(
    private readonly conversorMonedaService: ConversorMonedaService,
  ) {}

  @Get()
  async convertir(
    @Query('monto') monto: number,
    @Query('origen') origen: string,
    @Query('destino') destino: string,
  ) {
    try {
      if (!monto || isNaN(monto)) {
        throw new DomainException(
          'El monto debe ser un número válido',
          'ConversionController',
          'convertir',
          'VALUE_OBJECT',
          'La capa de presentación valida la sanidad de los parámetros del Query String.',
          'if (!monto || isNaN(monto)) { throw new Error(...); }',
        );
      }

      const resultado = await this.conversorMonedaService.convertir(
        Number(monto),
        origen || 'USD',
        destino || 'USD',
      );

      return {
        success: true,
        montoOriginal: monto,
        monedaOrigen: origen,
        monedaDestino: destino,
        resultado,
      };
    } catch (error) {
      if (error instanceof DomainException) {
        throw new HttpException(
          {
            success: false,
            error: error.message,
            pedagogicalTrace: {
              type: error.type,
              source: error.source,
              method: error.method,
              explanation: error.explanation,
              codeSnippet: error.codeSnippet,
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          success: false,
          error: error.message || 'Error interno del servidor',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
