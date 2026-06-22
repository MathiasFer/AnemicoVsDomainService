import {
  Body,
  Controller,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CheckoutApplicationService } from '../../application/services/CheckoutApplicationService';
import { DomainException } from '../../domain/exceptions/DomainException';

@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly checkoutAppService: CheckoutApplicationService,
  ) {}

  @Post()
  async procesarCompra(@Body() body: any) {
    try {
      if (!body.usuarioId) {
        throw new DomainException(
          'El usuarioId es obligatorio',
          'CheckoutController',
          'procesarCompra',
          'VALUE_OBJECT',
          'El controlador valida la estructura del payload antes de derivarlo a las capas de negocio.',
          'if (!body.usuarioId) { throw new Error(...); }',
        );
      }

      if (
        !body.productos ||
        !Array.isArray(body.productos) ||
        body.productos.length === 0
      ) {
        throw new DomainException(
          'La lista de productos no puede estar vacía',
          'CheckoutController',
          'procesarCompra',
          'VALUE_OBJECT',
          'El controlador rechaza carritos vacíos para evitar invocaciones de uso innecesarias.',
          'if (!body.productos || body.productos.length === 0) { throw new Error(...); }',
        );
      }

      if (!body.direccion) {
        throw new DomainException(
          'Los datos de dirección de entrega son obligatorios',
          'CheckoutController',
          'procesarCompra',
          'VALUE_OBJECT',
          'Se requiere un destino de despacho físico para procesar compras con envío.',
          'if (!body.direccion) { throw new Error(...); }',
        );
      }

      if (!body.pago || !body.pago.metodo || !body.pago.moneda) {
        throw new DomainException(
          'Los datos de método de pago y divisa son obligatorios',
          'CheckoutController',
          'procesarCompra',
          'VALUE_OBJECT',
          'Se requiere definir una moneda y medio de pago para procesar la transacción.',
          'if (!body.pago) { throw new Error(...); }',
        );
      }

      return await this.checkoutAppService.procesarCompra(
        Number(body.usuarioId),
        body.productos,
        body.direccion,
        body.pago,
        body.cupon,
      );
    } catch (error: any) {
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
          error: error?.message || 'Error interno del servidor',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
