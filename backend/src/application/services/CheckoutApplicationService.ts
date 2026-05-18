import { Inject, Injectable } from '@nestjs/common';
import { Usuario } from '../../domain/entities/Usuario';
import { Producto } from '../../domain/entities/Producto';
import { Direccion } from '../../domain/entities/Direccion';
import { Pago } from '../../domain/entities/Pago';
import { Cupon } from '../../domain/entities/Cupon';
import { Orden } from '../../domain/entities/Orden';

import { ConversorMonedaService } from '../../domain/services/ConversorMonedaService';
import { CalculadorDescuentoService } from '../../domain/services/CalculadorDescuentoService';
import { CalculadorEnvioService } from '../../domain/services/CalculadorEnvioService';
import { ValidadorFraudeService } from '../../domain/services/ValidadorFraudeService';
import { ProcesadorPagoService } from '../../domain/services/ProcesadorPagoService';

import type { IUsuarioRepository } from '../../domain/interfaces/IUsuarioRepository';
import type { IProductoRepository } from '../../domain/interfaces/IProductoRepository';
import { DomainException } from '../../domain/exceptions/DomainException';

@Injectable()
export class CheckoutApplicationService {

  constructor(
    @Inject('IUsuarioRepository')
    private usuarioRepository: IUsuarioRepository,

    @Inject('IProductoRepository')
    private productoRepository: IProductoRepository,

    private conversorMonedaService: ConversorMonedaService,
    private calculadorDescuentoService: CalculadorDescuentoService,
    private calculadorEnvioService: CalculadorEnvioService,
    private validadorFraudeService: ValidadorFraudeService,
    private procesadorPagoService: ProcesadorPagoService,
  ) {}

  async procesarCompra(
    usuarioId: number,
    productosRequest: Array<{ id: number; cantidad: number }>,
    direccionData: any,
    pagoData: any,
    cuponData: any,
  ) {
    const trace: Array<{
      step: number;
      type: 'ENTITY' | 'DOMAIN_SERVICE';
      source: string;
      method: string;
      detail: string;
    }> = [];

    // ==========================================
    // 0. RECUPERAR USUARIO DE PERSISTENCIA
    // ==========================================
    const usuario = await this.usuarioRepository.obtenerPorId(usuarioId);
    if (!usuario) {
      throw new DomainException(
        'Usuario no encontrado',
        'CheckoutApplicationService',
        'procesarCompra',
        'DOMAIN_SERVICE',
        `La capa de aplicación intentó recuperar de la base de datos el usuario con ID ${usuarioId}, pero no existe en los registros del sistema.`,
        'const usuario = await this.usuarioRepository.obtenerPorId(usuarioId);'
      );
    }

    // ==========================================
    // 1. INSTANCIACIÓN DE DIRECCIÓN Y PAGO (VALUE OBJECTS)
    // ==========================================
    const direccion = new Direccion(
      direccionData.pais,
      direccionData.ciudad,
      direccionData.calle,
      direccionData.codigoPostal,
      direccionData.referencia || '',
    );

    const pago = new Pago(
      pagoData.metodo,
      1, // Monto temporal que se ajustará al total final de la compra
      pagoData.moneda,
    );

    // Si no se envía cupón, inicializamos un cupón inactivo por defecto
    const cupon = cuponData && cuponData.codigo
      ? new Cupon(
          cuponData.codigo,
          cuponData.porcentajeDescuento,
          cuponData.activo,
          cuponData.montoMinimo,
        )
      : new Cupon('NINGUNO', 0, false, 0);

    // ==========================================
    // 2. CREACIÓN DE ORDEN (AGGREGATE ROOT)
    // ==========================================
    const orden = new Orden(
      Date.now(), // ID dinámico de Orden
      usuario,
      direccion,
      pago.obtenerMoneda(),
    );

    // ==========================================
    // 3. CARGAR PRODUCTOS Y DESCONTAR STOCK (ENTITY BEHAVIOR)
    // ==========================================
    const productosModificados: Producto[] = [];

    for (const item of productosRequest) {
      const producto = await this.productoRepository.obtenerPorId(item.id);
      if (!producto) {
        throw new DomainException(
          `Producto con ID ${item.id} no encontrado`,
          'CheckoutApplicationService',
          'procesarCompra',
          'DOMAIN_SERVICE',
          `No se pudo cargar el producto solicitado. ID buscado: ${item.id}.`,
          'const producto = await this.productoRepository.obtenerPorId(item.id);'
        );
      }

      // Validar y descontar stock dentro de la propia Entidad Producto (Modelo Rico)
      producto.descontarStock(item.cantidad);

      // Agregar a la orden
      orden.agregarProducto(producto);
      productosModificados.push(producto);
    }

    trace.push({
      step: 1,
      type: 'ENTITY',
      source: 'Orden',
      method: 'agregarProducto',
      detail: `Se recuperaron los productos reales. Se ejecutó 'Producto.descontarStock()' protegiendo el inventario e 'Orden.agregarProducto()' en estado PENDIENTE.`,
    });

    // ==========================================
    // 4. CALCULAR SUBTOTAL (ENTITY BEHAVIOR)
    // ==========================================
    const subtotal = orden.calcularSubtotal();
    trace.push({
      step: 2,
      type: 'ENTITY',
      source: 'Orden',
      method: 'calcularSubtotal',
      detail: `La entidad Orden calculó su subtotal sumando el precio interno de sus productos asociados: $${subtotal.toFixed(2)} USD.`,
    });

    // ==========================================
    // 5. CALCULAR DESCUENTOS (DOMAIN SERVICE)
    // ==========================================
    const descuento = this.calculadorDescuentoService.calcularDescuento(
      usuario,
      cupon,
      subtotal,
    );
    trace.push({
      step: 3,
      type: 'DOMAIN_SERVICE',
      source: 'CalculadorDescuentoService',
      method: 'calcularDescuento',
      detail: `El Servicio de Dominio estimó un descuento de $${descuento.toFixed(2)} USD (VIP: ${usuario.esUsuarioVip() ? '10%' : '0%'} + Cupón '${cupon.obtenerCodigo()}': ${cupon.estaActivo() ? cupon.obtenerPorcentajeDescuento() + '%' : '0%'}).`,
    });

    // ==========================================
    // 6. CALCULAR COSTO DE ENVÍO (DOMAIN SERVICE)
    // ==========================================
    const costoEnvio = this.calculadorEnvioService.calcularCostoEnvio(
      orden,
      direccion,
      true, // Prioridad
    );
    trace.push({
      step: 4,
      type: 'DOMAIN_SERVICE',
      source: 'CalculadorEnvioService',
      method: 'calcularCostoEnvio',
      detail: `El Servicio de Dominio calculó el envío en $${costoEnvio.toFixed(2)} USD evaluando el peso total (${orden.calcularPesoTotal()} kg), prioridad y destino (${direccion.obtenerPais()}).`,
    });

    // ==========================================
    // 7. VALIDAR POLÍTICAS DE FRAUDE (DOMAIN SERVICE)
    // ==========================================
    this.validadorFraudeService.validarCompra(
      usuario,
      pago, // Pasa el pago para validar límites
      direccion,
    );
    trace.push({
      step: 5,
      type: 'DOMAIN_SERVICE',
      source: 'ValidadorFraudeService',
      method: 'validarCompra',
      detail: `El Servicio de Dominio aprobó la transacción tras evaluar que el usuario no está en lista negra (Riesgo: ${usuario.obtenerNivelRiesgo()}%) y cumple los límites de importe.`,
    });

    // ==========================================
    // 8. CALCULO DEL TOTAL ANTES DE CONVERSIÓN
    // ==========================================
    const totalAntesConversion = subtotal - descuento + costoEnvio;

    // ==========================================
    // 9. CONVERSIÓN DE MONEDA (DOMAIN SERVICE)
    // ==========================================
    const totalFinal = await this.conversorMonedaService.convertir(
      totalAntesConversion,
      'USD',
      pago.obtenerMoneda(),
    );
    trace.push({
      step: 6,
      type: 'DOMAIN_SERVICE',
      source: 'ConversorMonedaService',
      method: 'convertir',
      detail: `El Servicio de Dominio convirtió el total de $${totalAntesConversion.toFixed(2)} USD a divisa local (${pago.obtenerMoneda()}) usando el tipo de cambio offline provisto. Total: $${totalFinal.toFixed(2)} ${pago.obtenerMoneda()}.`,
    });

    // ==========================================
    // 10. PROCESAR PAGO (DOMAIN SERVICE)
    // ==========================================
    const pagoAjustado = new Pago(
      pago.obtenerMetodo(),
      totalFinal,
      pago.obtenerMoneda(),
    );

    this.procesadorPagoService.procesarPago(
      usuario,
      pagoAjustado,
    );
    trace.push({
      step: 7,
      type: 'DOMAIN_SERVICE',
      source: 'ProcesadorPagoService',
      method: 'procesarPago',
      detail: `El Servicio de Dominio coordinó el pago: debitó de la entidad Usuario y aprobó la entidad Pago. Nuevo saldo usuario: $${usuario.obtenerSaldo().toFixed(2)} ${pago.obtenerMoneda()}.`,
    });

    // ==========================================
    // 11. FINALIZAR ORDEN (ENTITY BEHAVIOR)
    // ==========================================
    orden.finalizarOrden();
    trace.push({
      step: 8,
      type: 'ENTITY',
      source: 'Orden',
      method: 'finalizarOrden',
      detail: 'El Aggregate Root Orden finalizó la compra exitosamente marcando su estado como FINALIZADA.',
    });

    // ==========================================
    // 12. PERSISTENCIA DE CAMBIOS (INFRASTRUCTURE ADAPTERS)
    // ==========================================
    await this.usuarioRepository.guardar(usuario);
    for (const prod of productosModificados) {
      await this.productoRepository.guardar(prod);
    }

    return {
      success: true,
      mensaje: 'Compra procesada correctamente',
      resumenCompra: {
        subtotal,
        descuento,
        costoEnvio,
        totalFinal,
        moneda: pago.obtenerMoneda(),
      },
      pago: {
        estado: pagoAjustado.obtenerEstado(),
        metodo: pagoAjustado.obtenerMetodo(),
      },
      cliente: {
        nombre: usuario.nombre,
        saldoRestante: usuario.obtenerSaldo(),
        esVip: usuario.esUsuarioVip(),
      },
      pedagogicalTrace: trace,
    };
  }
}