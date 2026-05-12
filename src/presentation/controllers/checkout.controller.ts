import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import { Usuario }
from '../../domain/entities/Usuario';

import { Producto }
from '../../domain/entities/Producto';

import { Direccion }
from '../../domain/entities/Direccion';

import { Pago }
from '../../domain/entities/Pago';

import { Cupon }
from '../../domain/entities/Cupon';

import { ConversorMonedaService }
from '../../domain/services/ConversorMonedaService';

import { CalculadorDescuentoService }
from '../../domain/services/CalculadorDescuentoService';

import { CalculadorEnvioService }
from '../../domain/services/CalculadorEnvioService';

import { ValidadorFraudeService }
from '../../domain/services/ValidadorFraudeService';

import { ProcesadorPagoService }
from '../../domain/services/ProcesadorPagoService';

import { ExchangeRateApiProvider }
from '../../infrastructure/providers/ExchangeRateApiProvider';

import { CheckoutApplicationService }
from '../../application/services/CheckoutApplicationService';

@Controller('checkout')
export class CheckoutController {

  @Post()
  async procesarCompra(
    @Body() body: any,
  ) {

    // =========================
    // ENTIDADES
    // =========================

    const usuario = new Usuario(
      body.usuario.id,
      body.usuario.nombre,
      body.usuario.email,
      body.usuario.saldo,
      body.usuario.esVip,
      body.usuario.nivelRiesgo,
      body.usuario.monedaPreferida,
    );

    const productos = body.productos.map(
      (producto: any) =>
        new Producto(
          producto.id,
          producto.nombre,
          producto.precio,
          producto.stock,
          producto.peso,
          producto.categoria,
          producto.impuesto,
          producto.envioRestringido,
        )
    );

    const direccion = new Direccion(
      body.direccion.pais,
      body.direccion.ciudad,
      body.direccion.calle,
      body.direccion.codigoPostal,
      body.direccion.referencia,
    );

    const pago = new Pago(
      body.pago.metodo,
      body.pago.monto,
      body.pago.moneda,
    );

    const cupon = new Cupon(
      body.cupon.codigo,
      body.cupon.porcentajeDescuento,
      body.cupon.activo,
      body.cupon.montoMinimo,
    );

    // =========================
    // INFRASTRUCTURE
    // =========================

    const proveedorCambio =
      new ExchangeRateApiProvider();

    // =========================
    // DOMAIN SERVICES
    // =========================

    const conversorMonedaService =
      new ConversorMonedaService(
        proveedorCambio
      );

    const calculadorDescuentoService =
      new CalculadorDescuentoService();

    const calculadorEnvioService =
      new CalculadorEnvioService();

    const validadorFraudeService =
      new ValidadorFraudeService();

    const procesadorPagoService =
      new ProcesadorPagoService();

    // =========================
    // APPLICATION SERVICE
    // =========================

    const checkoutApplicationService =
      new CheckoutApplicationService(
        conversorMonedaService,
        calculadorDescuentoService,
        calculadorEnvioService,
        validadorFraudeService,
        procesadorPagoService,
      );

    // =========================
    // PROCESAR COMPRA
    // =========================

    return await checkoutApplicationService
      .procesarCompra(
        usuario,
        productos,
        direccion,
        pago,
        cupon,
      );
  }
}