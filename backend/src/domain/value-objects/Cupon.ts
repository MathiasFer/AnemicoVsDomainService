import { DomainException } from '../exceptions/DomainException';

/**
 * Value Object: Cupón.
 * Representa un beneficio de descuento aplicable a una orden.
 * En este dominio lo tratamos como Inmutable para evitar efectos secundarios.
 */
export class Cupon {
  constructor(
    public readonly codigo: string,
    public readonly porcentajeDescuento: number,
    public readonly activo: boolean,
    public readonly montoMinimo: number,
  ) {
    this.validarInvariantes();
  }

  private validarInvariantes(): void {
    if (this.porcentajeDescuento < 0 || this.porcentajeDescuento > 100) {
      throw new DomainException(
        'Porcentaje de descuento inválido',
        'Cupon',
        'constructor',
        'VALUE_OBJECT',
        'El descuento debe estar entre 0 y 100.',
        'if (this.porcentajeDescuento < 0 || ...) { throw new Error(...); }',
      );
    }
  }

  public puedeAplicarse(totalCompra: number): boolean {
    return this.activo && totalCompra >= this.montoMinimo;
  }

  public calcularDescuento(totalCompra: number): number {
    if (!this.puedeAplicarse(totalCompra)) return 0;
    return (totalCompra * this.porcentajeDescuento) / 100;
  }
}
