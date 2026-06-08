import { Inject, Injectable } from '@nestjs/common';
import { Usuario } from '../../domain/entities/Usuario';
import { Producto } from '../../domain/entities/Producto';
import { Orden } from '../../domain/entities/Orden';

import { Direccion } from '../../domain/value-objects/Direccion';
import { Pago } from '../../domain/value-objects/Pago';
import { Cupon } from '../../domain/value-objects/Cupon';
import { OrdenItem } from '../../domain/value-objects/OrdenItem';

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
  ) { }

  async procesarCompra(
    usuarioId: number,
    productosRequest: Array<{ id: number; cantidad: number }>,
    direccionData: any,
    pagoData: any,
    cuponData: any,
  ) {
    const trace: Array<{
      step: number;
      type: 'ENTITY' | 'DOMAIN_SERVICE' | 'VALUE_OBJECT';
      source: string;
      method: string;
      detail: string;
    }> = [];

    /// 0. Recuperar usuario
    const usuario = await this.usuarioRepository.obtenerPorId(usuarioId);
    if (!usuario) {
      throw new DomainException('Usuario no encontrado', 'CheckoutApplicationService', 'procesarCompra', 'DOMAIN_SERVICE', `ID: ${usuarioId}`, '');
    }

    /// 1. Instanciar Value Objects (Inmutables)
    const direccion = new Direccion(
      direccionData.pais,
      direccionData.ciudad,
      direccionData.calle,
      direccionData.codigoPostal,
      direccionData.referencia || '',
    );

    const cupon = cuponData && cuponData.codigo
      ? new Cupon(cuponData.codigo, cuponData.porcentajeDescuento, cuponData.activo, cuponData.montoMinimo)
      : new Cupon('NINGUNO', 0, false, 0);

    /// 2. Crear la Orden (Aggregate Root)
    const orden = new Orden(Date.now(), usuario, direccion, pagoData.moneda);

    /// 3. Procesar Productos y generar OrdenItems (Snapshots)
    const productosModificados: Producto[] = [];
    for (const item of productosRequest) {
      const producto = await this.productoRepository.obtenerPorId(item.id);
      if (!producto) throw new DomainException(`Producto ${item.id} no encontrado`, 'CheckoutApplicationService', 'procesarCompra', 'DOMAIN_SERVICE', '', '');

      // El Producto (Modelo Rico) protege su propio stock
      producto.descontarStock(item.cantidad);

      // Snapshot inmutable para la orden
      const ordenItem = new OrdenItem(
        producto.id,
        producto.nombre,
        producto.obtenerPrecio(),
        item.cantidad,
        producto.obtenerImpuesto(),
        producto.obtenerPeso(),
        producto.tieneEnvioRestringido(),
      );

      orden.agregarItem(ordenItem);
      productosModificados.push(producto);
    }

    trace.push({ step: 1, type: 'VALUE_OBJECT', source: 'OrdenItem', method: 'constructor', detail: 'Snapshots creados.' });
    trace.push({ step: 2, type: 'ENTITY', source: 'Orden', method: 'agregarItem', detail: 'Items agregados al Agregado.' });

    /// 4. Calcular Subtotal
    const subtotal = orden.calcularSubtotal();
    trace.push({ step: 3, type: 'ENTITY', source: 'Orden', method: 'calcularSubtotal', detail: `Subtotal: $${subtotal} USD.` });

    /// 5. Descuentos (Domain Service)
    const montoDescuento = this.calculadorDescuentoService.calcularDescuento(usuario, cupon, subtotal);
    orden.aplicarDescuento(montoDescuento);
    trace.push({ step: 4, type: 'DOMAIN_SERVICE', source: 'CalculadorDescuentoService', method: 'calcularDescuento', detail: `Descuento: $${montoDescuento} USD.` });

    /// 6. Envío (Domain Service)
    const costoEnvio = this.calculadorEnvioService.calcularCostoEnvio(orden, direccion, true);
    orden.establecerCostoEnvio(costoEnvio);
    trace.push({ step: 5, type: 'DOMAIN_SERVICE', source: 'CalculadorEnvioService', method: 'calcularCostoEnvio', detail: `Envío: $${costoEnvio} USD.` });

    /// 7. Validación de Fraude
    const totalVentaUsd = orden.calcularTotal();
    const pagoPreliminar = new Pago(pagoData.metodo, totalVentaUsd, 'USD');
    this.validadorFraudeService.validarCompra(usuario, pagoPreliminar, direccion);
    trace.push({ step: 6, type: 'DOMAIN_SERVICE', source: 'ValidadorFraudeService', method: 'validarCompra', detail: 'Fraude validado.' });

    /// 8. Conversión de Moneda
    const totalFinalMoneda = await this.conversorMonedaService.convertir(totalVentaUsd, 'USD', pagoData.moneda);
    trace.push({ step: 7, type: 'DOMAIN_SERVICE', source: 'ConversorMonedaService', method: 'convertir', detail: `Total en ${pagoData.moneda}: ${totalFinalMoneda}.` });

    /// 9. Procesamiento de Pago
    const pagoAProcesar = new Pago(pagoData.metodo, totalFinalMoneda, pagoData.moneda);
    const pagoResultado = this.procesadorPagoService.procesarPago(usuario, pagoAProcesar);
    trace.push({ step: 8, type: 'DOMAIN_SERVICE', source: 'ProcesadorPagoService', method: 'procesarPago', detail: `Pago ${pagoResultado.estado}.` });

    /// 10. Finalizar Orden
    orden.finalizarOrden();
    trace.push({ step: 9, type: 'ENTITY', source: 'Orden', method: 'finalizarOrden', detail: 'Orden Finalizada.' });

    /// 11. Persistencia
    await this.usuarioRepository.guardar(usuario);
    for (const prod of productosModificados) await this.productoRepository.guardar(prod);

    return {
      success: true,
      mensaje: 'Compra procesada correctamente',
      resumenCompra: { subtotal, descuento: montoDescuento, costoEnvio, totalFinal: totalFinalMoneda, moneda: pagoData.moneda },
      pago: { estado: pagoResultado.estado, metodo: pagoResultado.metodo },
      cliente: { nombre: usuario.nombre, saldoRestante: usuario.obtenerSaldo(), esVip: usuario.esUsuarioVip() },
      pedagogicalTrace: trace,
    };
  }
}
