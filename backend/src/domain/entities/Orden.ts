import { Usuario } from './Usuario';
import { Direccion } from '../value-objects/Direccion';
import { OrdenItem } from '../value-objects/OrdenItem';
import { DomainException } from '../exceptions/DomainException';

/**
 * Aggregate Root: Orden. Coordina ítems, totales y estado de compra.
 */
export class Orden {
  private items: OrdenItem[] = [];
  private estado: string = 'PENDIENTE';
  private descuento: number = 0;
  private costoEnvio: number = 0;

  constructor(
    private readonly id: number,
    private usuario: Usuario,
    private direccion: Direccion,
    private moneda: string,
  ) {
    this.validarIdentidad();
  }

  private validarIdentidad(): void {
    if (!this.usuario)
      throw new DomainException(
        'Usuario requerido',
        'Orden',
        'constructor',
        'ENTITY',
        'Referencia obligatoria.',
        '',
      );
    if (!this.direccion)
      throw new DomainException(
        'Dirección requerida',
        'Orden',
        'constructor',
        'ENTITY',
        'Destino obligatorio.',
        '',
      );
  }

  obtenerId(): number {
    return this.id;
  }
  obtenerItems(): OrdenItem[] {
    return this.items;
  }
  obtenerEstado(): string {
    return this.estado;
  }
  obtenerMoneda(): string {
    return this.moneda;
  }
  obtenerUsuario(): Usuario {
    return this.usuario;
  }
  obtenerDireccion(): Direccion {
    return this.direccion;
  }
  obtenerDescuento(): number {
    return this.descuento;
  }
  obtenerCostoEnvio(): number {
    return this.costoEnvio;
  }

  agregarItem(item: OrdenItem): void {
    if (this.estado !== 'PENDIENTE')
      throw new DomainException(
        'Orden bloqueada',
        'Orden',
        'agregarItem',
        'ENTITY',
        'Solo editable en PENDIENTE.',
        '',
      );
    this.items.push(item);
  }

  aplicarDescuento(monto: number): void {
    if (monto < 0)
      throw new DomainException(
        'Descuento inválido',
        'Orden',
        'aplicarDescuento',
        'ENTITY',
        'Debe ser >= 0.',
        '',
      );
    this.descuento = monto;
  }

  establecerCostoEnvio(monto: number): void {
    if (monto < 0)
      throw new DomainException(
        'Envío inválido',
        'Orden',
        'establecerCostoEnvio',
        'ENTITY',
        'Debe ser >= 0.',
        '',
      );
    this.costoEnvio = monto;
  }

  calcularSubtotal(): number {
    return this.items.reduce((t, i) => t + i.calcularSubtotal(), 0);
  }
  calcularTotalImpuestos(): number {
    return this.items.reduce((t, i) => t + i.calcularImpuestos(), 0);
  }
  calcularPesoTotal(): number {
    return this.items.reduce((t, i) => t + i.calcularPesoTotal(), 0);
  }

  calcularTotal(): number {
    const total = this.calcularSubtotal() - this.descuento + this.costoEnvio;
    return Math.max(0, total);
  }

  finalizarOrden(): void {
    if (this.items.length === 0)
      throw new DomainException(
        'Orden vacía',
        'Orden',
        'finalizarOrden',
        'ENTITY',
        'Requiere ítems.',
        '',
      );
    this.estado = 'FINALIZADA';
  }

  cancelarOrden(): void {
    if (this.estado === 'FINALIZADA')
      throw new DomainException(
        'Orden cerrada',
        'Orden',
        'cancelarOrden',
        'ENTITY',
        'Irreversible.',
        '',
      );
    this.estado = 'CANCELADA';
  }

  estaFinalizada(): boolean {
    return this.estado === 'FINALIZADA';
  }
}
