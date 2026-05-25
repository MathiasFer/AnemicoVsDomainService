import { DomainException } from '../exceptions/DomainException';

export class Cupon {
  constructor(
    private codigo: string,
    private porcentajeDescuento: number,
    private activo: boolean,
    private montoMinimo: number,
  ) {
    this.validarPorcentaje();
  }

  /// GETTERS

  obtenerCodigo(): string {
    return this.codigo;
  }

  obtenerPorcentajeDescuento(): number {
    return this.porcentajeDescuento;
  }

  obtenerMontoMinimo(): number {
    return this.montoMinimo;
  }

  estaActivo(): boolean {
    return this.activo;
  }

  /// COMPORTAMIENTO DEL DOMINIO

  private validarPorcentaje(): void {
    if (this.porcentajeDescuento < 0 || this.porcentajeDescuento > 100) {
      throw new DomainException(
        'El porcentaje de descuento es inválido',
        'Cupon',
        'validarPorcentaje',
        'ENTITY',
        'El cupón de descuento debe aplicar un beneficio porcentual que se encuentre estrictamente entre el 0% y el 100%.',
        'if (this.porcentajeDescuento < 0 || this.porcentajeDescuento > 100) { throw new Error(...); }',
      );
    }
  }

  puedeAplicarse(totalCompra: number): boolean {
    if (!this.activo) {
      return false;
    }
    return totalCompra >= this.montoMinimo;
  }

  calcularDescuento(totalCompra: number): number {
    if (!this.puedeAplicarse(totalCompra)) {
      throw new DomainException(
        'El cupón no puede aplicarse',
        'Cupon',
        'calcularDescuento',
        'ENTITY',
        `El cupón '${this.codigo}' requiere un total mínimo de compra de $${this.montoMinimo} USD. El total de compra actual es de $${totalCompra} USD.`,
        'if (!this.puedeAplicarse(totalCompra)) { throw new Error("El cupón no puede aplicarse"); }',
      );
    }

    return (totalCompra * this.porcentajeDescuento) / 100;
  }

  desactivar(): void {
    this.activo = false;
  }

  activar(): void {
    this.activo = true;
  }
}
