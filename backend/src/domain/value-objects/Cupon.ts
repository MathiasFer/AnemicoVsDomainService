import { DomainException } from '../exceptions/DomainException';

/**
 * VO Cupon: Beneficio inmutable.
 */
export class Cupon {
  constructor(
    public readonly codigo: string,
    public readonly porcentajeDescuento: number,
    public readonly activo: boolean,
    public readonly montoMinimo: number,
  ) {
    if (this.porcentajeDescuento < 0 || this.porcentajeDescuento > 100) {
      throw new DomainException('Descuento inválido', 'Cupon', 'constructor', 'VALUE_OBJECT', 'Rango 0-100%.', '');
    }
  }

  obtenerCodigo(): string { return this.codigo; }
  estaActivo(): boolean { return this.activo; }
  obtenerPorcentajeDescuento(): number { return this.porcentajeDescuento; }
  puedeAplicarse(total: number): boolean { return this.activo && total >= this.montoMinimo; }
  calcularDescuento(total: number): number { return this.puedeAplicarse(total) ? (total * this.porcentajeDescuento) / 100 : 0; }
}
