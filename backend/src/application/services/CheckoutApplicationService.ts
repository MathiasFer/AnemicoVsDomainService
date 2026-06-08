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
    @Inject('IUsuarioRepository') private usuarioRepository: IUsuarioRepository,
    @Inject('IProductoRepository') private productoRepository: IProductoRepository,
    private conversorMonedaService: ConversorMonedaService,
    private calculadorDescuentoService: CalculadorDescuentoService,
    private calculadorEnvioService: CalculadorEnvioService,
    private validadorFraudeService: ValidadorFraudeService,
    private procesadorPagoService: ProcesadorPagoService,
  ) { }

  async procesarCompra(usuarioId: number, productosRequest: any[], direccionData: any, pagoData: any, cuponData: any) {
    const trace: any[] = [];

    const usuario = await this.usuarioRepository.obtenerPorId(usuarioId);
    if (!usuario) throw new DomainException('Usuario no encontrado', 'CheckoutApplicationService', 'procesarCompra', 'DOMAIN_SERVICE', `ID: ${usuarioId}`, '');

    const direccion = new Direccion(direccionData.pais, direccionData.ciudad, direccionData.calle, direccionData.codigoPostal, direccionData.referencia || '');
    const cupon = cuponData?.codigo ? new Cupon(cuponData.codigo, cuponData.porcentajeDescuento, cuponData.activo, cuponData.montoMinimo) : new Cupon('NINGUNO', 0, false, 0);
    const orden = new Orden(Date.now(), usuario, direccion, pagoData.moneda);

    const productosModificados: Producto[] = [];
    for (const item of productosRequest) {
      const producto = await this.productoRepository.obtenerPorId(item.id);
      if (!producto) throw new DomainException(`Producto ${item.id} no encontrado`, 'CheckoutApplicationService', 'procesarCompra', 'DOMAIN_SERVICE', '', '');

      producto.descontarStock(item.cantidad);
      const ordenItem = new OrdenItem(producto.id, producto.nombre, producto.obtenerPrecio(), item.cantidad, producto.obtenerImpuesto(), producto.obtenerPeso(), producto.tieneEnvioRestringido());
      orden.agregarItem(ordenItem);
      productosModificados.push(producto);
    }

    trace.push({ step: 1, type: 'VALUE_OBJECT', source: 'OrdenItem', method: 'constructor', detail: 'Snapshots creados.' });
    trace.push({ step: 2, type: 'ENTITY', source: 'Orden', method: 'agregarItem', detail: 'Items agregados.' });

    const subtotal = orden.calcularSubtotal();
    trace.push({ step: 3, type: 'ENTITY', source: 'Orden', method: 'calcularSubtotal', detail: `Subtotal: $${subtotal} USD.` });

    const montoDescuento = this.calculadorDescuentoService.calcularDescuento(usuario, cupon, subtotal);
    orden.aplicarDescuento(montoDescuento);
    trace.push({ step: 4, type: 'DOMAIN_SERVICE', source: 'CalculadorDescuentoService', method: 'calcularDescuento', detail: `Descuento: $${montoDescuento} USD.` });

    const costoEnvio = this.calculadorEnvioService.calcularCostoEnvio(orden, direccion, true);
    orden.establecerCostoEnvio(costoEnvio);
    trace.push({ step: 5, type: 'DOMAIN_SERVICE', source: 'CalculadorEnvioService', method: 'calcularCostoEnvio', detail: `Envío: $${costoEnvio} USD.` });

    const totalVentaUsd = orden.calcularTotal();
    this.validadorFraudeService.validarCompra(usuario, new Pago(pagoData.metodo, totalVentaUsd, 'USD'), direccion);
    trace.push({ step: 6, type: 'DOMAIN_SERVICE', source: 'ValidadorFraudeService', method: 'validarCompra', detail: 'Fraude validado.' });

    const totalFinalMoneda = await this.conversorMonedaService.convertir(totalVentaUsd, 'USD', pagoData.moneda);
    trace.push({ step: 7, type: 'DOMAIN_SERVICE', source: 'ConversorMonedaService', method: 'convertir', detail: `Total en ${pagoData.moneda}: ${totalFinalMoneda}.` });

    const pagoResultado = this.procesadorPagoService.procesarPago(usuario, new Pago(pagoData.metodo, totalFinalMoneda, pagoData.moneda));
    trace.push({ step: 8, type: 'DOMAIN_SERVICE', source: 'ProcesadorPagoService', method: 'procesarPago', detail: `Pago ${pagoResultado.estado}.` });

    orden.finalizarOrden();
    trace.push({ step: 9, type: 'ENTITY', source: 'Orden', method: 'finalizarOrden', detail: 'Orden Finalizada.' });

    await this.usuarioRepository.guardar(usuario);
    for (const prod of productosModificados) await this.productoRepository.guardar(prod);

    return {
      success: true,
      mensaje: 'Compra procesada',
      resumenCompra: { subtotal, descuento: montoDescuento, costoEnvio, totalFinal: totalFinalMoneda, moneda: pagoData.moneda },
      pago: { estado: pagoResultado.estado, metodo: pagoResultado.metodo },
      cliente: { nombre: usuario.nombre, saldoRestante: usuario.obtenerSaldo(), esVip: usuario.esUsuarioVip() },
      pedagogicalTrace: trace,
    };
  }
}
