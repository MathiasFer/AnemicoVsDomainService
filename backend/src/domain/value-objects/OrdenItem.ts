import { DomainException } from '../exceptions/DomainException';

/**
 * Value Object que representa un producto dentro de una orden.
 * Almacena un "snapshot" del estado del producto en el momento de la compra
 * para garantizar la integridad histórica de la orden (ej. si el precio cambia después).
 */
export class OrdenItem {
  constructor(
    public readonly productoId: number,
    public readonly nombre: string,
    public readonly precioUnitario: number,
    public readonly cantidad: number,
    public readonly impuestoUnitario: number,
    public readonly pesoUnitario: number,
    public readonly envioRestringido: boolean,
  ) {
    this.validarCantidad();
  }

  private validarCantidad(): void {
    if (this.cantidad <= 0) {
      throw new DomainException(
        'La cantidad debe ser mayor a cero',
        'OrdenItem',
        'constructor',
        'VALUE_OBJECT',
        'Un ítem de orden representa una intención de compra física, por lo que requiere una cantidad positiva.',
        'if (this.cantidad <= 0) { throw new Error(...); }',
      );
    }
  }

  public calcularSubtotal(): number {
    return this.precioUnitario * this.cantidad;
  }

  public calcularImpuestos(): number {
    return (this.precioUnitario * this.impuestoUnitario) * this.cantidad;
  }

  public calcularPesoTotal(): number {
    return this.pesoUnitario * this.cantidad;
  }
}
