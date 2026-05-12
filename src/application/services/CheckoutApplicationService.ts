import { Usuario } from '../../domain/entities/Usuario';
import { Producto } from '../../domain/entities/Producto';
import { Direccion } from '../../domain/entities/Direccion';
import { Pago } from '../../domain/entities/Pago';
import { Cupon } from '../../domain/entities/Cupon';
import { Orden } from '../../domain/entities/Orden';

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

export class CheckoutApplicationService {

  constructor(
    private conversorMonedaService:
      ConversorMonedaService,

    private calculadorDescuentoService:
      CalculadorDescuentoService,

    private calculadorEnvioService:
      CalculadorEnvioService,

    private validadorFraudeService:
      ValidadorFraudeService,

    private procesadorPagoService:
      ProcesadorPagoService,
  ) {}

  async procesarCompra(
    usuario: Usuario,
    productos: Producto[],
    direccion: Direccion,
    pago: Pago,
    cupon: Cupon,
  ) {

    const orden = new Orden(
      1,
      usuario,
      direccion,
      pago.obtenerMoneda(),
    );
    
    // =========================
    // AGREGAR PRODUCTOS
    // =========================
    
    for (const producto of productos) {
      orden.agregarProducto(producto);
    }
    
    // =========================
    // CALCULAR SUBTOTAL
    // =========================
    
    const subtotal =
      orden.calcularSubtotal();

    // =========================
    // CALCULAR DESCUENTOS
    // =========================

    const descuento =
      this.calculadorDescuentoService
        .calcularDescuento(
          usuario,
          cupon,
          subtotal,
        );

    // =========================
    // CALCULAR ENVÍO
    // =========================

    const costoEnvio =
      this.calculadorEnvioService
        .calcularCostoEnvio(
          orden,
          direccion,
          true,
        );

    // =========================
    // TOTAL FINAL
    // =========================

    let totalFinal =
      subtotal -
      descuento +
      costoEnvio;

    // =========================
    // VALIDAR FRAUDE
    // =========================

    this.validadorFraudeService
      .validarCompra(
        usuario,
        pago,
        direccion,
      );

    // =========================
    // CONVERSIÓN MONEDA
    // =========================

    totalFinal =
      await this.conversorMonedaService
        .convertir(
          totalFinal,
          'USD',
          pago.obtenerMoneda(),
        );

    // =========================
    // PROCESAR PAGO
    // =========================

    this.procesadorPagoService
      .procesarPago(
        usuario,
        pago,
      );

    // =========================
    // RESPUESTA FINAL
    // =========================

    return {
      mensaje:
        'Compra procesada correctamente',
    
      resumenCompra: {
        subtotal,
        descuento,
        costoEnvio,
        totalFinal,
        moneda:
          pago.obtenerMoneda(),
      },
    
      pago: {
        estado:
          pago.obtenerEstado(),
        metodo:
          pago.obtenerMetodo(),
      },
    
      cliente: {
        nombre:
          usuario.nombre,
        esVip:
          usuario.esUsuarioVip(),
      },
    };
  }
}