import { DomainException } from '../exceptions/DomainException';

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
    if (this.cantidad <= 0)
      throw new DomainException(
        'Cantidad inválida',
        'OrdenItem',
        'constructor',
        'VALUE_OBJECT',
        'Requiere cantidad > 0.',
        '',
      );
  }

  public calcularSubtotal(): number {
    return this.precioUnitario * this.cantidad;
  }
  public calcularImpuestos(): number {
    return this.precioUnitario * this.impuestoUnitario * this.cantidad;
  }
  public calcularPesoTotal(): number {
    return this.pesoUnitario * this.cantidad;
  }
}
