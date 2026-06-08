import { Usuario } from './Usuario';
import { Direccion } from '../value-objects/Direccion';
import { OrdenItem } from '../value-objects/OrdenItem';
import { DomainException } from '../exceptions/DomainException';

/**
 * Agregado (Aggregate Root) Orden.
 * Orquesta la relación entre el Usuario, la Dirección y los Ítems comprados.
 * Mantiene la integridad de los totales y el estado de la compra.
 */
export class Orden {
  private items: OrdenItem[] = [];
  private estado: string = 'PENDIENTE';
  private descuento: number = 0;
  private costoEnvio: number = 0;

  constructor(
    public id: number,
    private usuario: Usuario,
    private direccion: Direccion,
    private moneda: string,
  ) {
    this.validarIdentidad();
  }

  private validarIdentidad(): void {
    if (!this.usuario) {
      throw new DomainException(
        'La orden requiere un usuario',
        'Orden',
        'constructor',
        'ENTITY',
        'Un agregado Orden no puede existir sin una referencia a la identidad del comprador.',
        'if (!this.usuario) { throw new Error(...); }',
      );
    }
    if (!this.direccion) {
      throw new DomainException(
        'La orden requiere una dirección de entrega',
        'Orden',
        'constructor',
        'ENTITY',
        'El destino físico es una invariante obligatoria para iniciar el ciclo de vida de una Orden.',
        'if (!this.direccion) { throw new Error(...); }',
      );
    }
  }

  // GETTERS

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

  // COMPORTAMIENTO DEL DOMINIO

  agregarItem(item: OrdenItem): void {
    if (this.estado !== 'PENDIENTE') {
      throw new DomainException(
        'No se pueden agregar productos a una orden finalizada',
        'Orden',
        'agregarItem',
        'ENTITY',
        'La entidad Orden resguarda sus transiciones de estado. Una vez que la orden sale del estado PENDIENTE, queda congelada.',
        "if (this.estado !== 'PENDIENTE') { throw new Error(...); }",
      );
    }

    this.items.push(item);
  }

  aplicarDescuento(monto: number): void {
    if (monto < 0) {
      throw new DomainException(
        'El descuento no puede ser negativo',
        'Orden',
        'aplicarDescuento',
        'ENTITY',
        'Toda política de beneficios debe resultar en un descuento positivo o nulo.',
        'if (monto < 0) { throw new Error(...); }',
      );
    }
    this.descuento = monto;
  }

  establecerCostoEnvio(monto: number): void {
    if (monto < 0) {
      throw new DomainException(
        'El costo de envío no puede ser negativo',
        'Orden',
        'establecerCostoEnvio',
        'ENTITY',
        'Los costos logísticos calculados por los servicios de dominio deben ser valores positivos.',
        'if (monto < 0) { throw new Error(...); }',
      );
    }
    this.costoEnvio = monto;
  }

  calcularSubtotal(): number {
    return this.items.reduce((total, item) => total + item.calcularSubtotal(), 0);
  }

  calcularTotalImpuestos(): number {
    return this.items.reduce((total, item) => total + item.calcularImpuestos(), 0);
  }

  calcularPesoTotal(): number {
    return this.items.reduce((total, item) => total + item.calcularPesoTotal(), 0);
  }

  /**
   * Cálculo del total final de la orden (Regla de negocio central).
   */
  calcularTotal(): number {
    const subtotal = this.calcularSubtotal();
    const total = subtotal - this.descuento + this.costoEnvio;
    return Math.max(0, total); // El total no puede ser negativo
  }

  finalizarOrden(): void {
    if (this.items.length === 0) {
      throw new DomainException(
        'No se puede finalizar una orden vacía',
        'Orden',
        'finalizarOrden',
        'ENTITY',
        'La entidad Orden (Aggregate Root) exige al menos un ítem para poder ser procesada.',
        'if (this.items.length === 0) { throw new Error(...); }',
      );
    }

    this.estado = 'FINALIZADA';
  }

  cancelarOrden(): void {
    if (this.estado === 'FINALIZADA') {
      throw new DomainException(
        'No se puede cancelar una orden finalizada',
        'Orden',
        'cancelarOrden',
        'ENTITY',
        'Las órdenes en estado FINALIZADA son transacciones comerciales cerradas e irreversibles.',
        "if (this.estado === 'FINALIZADA') { throw new Error(...); }",
      );
    }

    this.estado = 'CANCELADA';
  }

  estaFinalizada(): boolean {
    return this.estado === 'FINALIZADA';
  }
}
