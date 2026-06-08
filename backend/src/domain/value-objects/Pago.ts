import { DomainException } from '../exceptions/DomainException';

export enum EstadoPago { PENDIENTE = 'PENDIENTE', APROBADO = 'APROBADO', RECHAZADO = 'RECHAZADO' }

/**
 * VO Pago: Representación inmutable de transacción.
 */
export class Pago {
  constructor(
    public readonly metodo: string,
    public readonly monto: number,
    public readonly moneda: string,
    public readonly estado: EstadoPago = EstadoPago.PENDIENTE,
  ) {
    if (this.monto <= 0) throw new DomainException('Monto inválido', 'Pago', 'constructor', 'VALUE_OBJECT', 'Monto debe ser > 0.', '');
  }

  aprobar(): Pago { return new Pago(this.metodo, this.monto, this.moneda, EstadoPago.APROBADO); }
  rechazar(): Pago { return new Pago(this.metodo, this.monto, this.moneda, EstadoPago.RECHAZADO); }
  estaAprobado(): boolean { return this.estado === EstadoPago.APROBADO; }
  estaPendiente(): boolean { return this.estado === EstadoPago.PENDIENTE; }
}
