import { DomainException } from '../exceptions/DomainException';

export enum EstadoPago {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
}

/**
 * Value Object: Pago.
 * Representa la intención o el resultado de una transacción financiera.
 * Al ser un Value Object, el cambio de estado (PENDIENTE -> APROBADO) 
 * genera una nueva instancia, preservando la inmutabilidad.
 */
export class Pago {
  constructor(
    public readonly metodo: string,
    public readonly monto: number,
    public readonly moneda: string,
    public readonly estado: EstadoPago = EstadoPago.PENDIENTE,
  ) {
    this.validarMonto();
  }

  private validarMonto(): void {
    if (this.monto <= 0) {
      throw new DomainException(
        'El monto del pago debe ser mayor a cero',
        'Pago',
        'constructor',
        'VALUE_OBJECT',
        'Un pago requiere un valor monetario positivo para ser procesado.',
        'if (this.monto <= 0) { throw new Error(...); }',
      );
    }
  }

  // COMPORTAMIENTO (RETORNA NUEVAS INSTANCIAS)

  aprobar(): Pago {
    return new Pago(this.metodo, this.monto, this.moneda, EstadoPago.APROBADO);
  }

  rechazar(): Pago {
    return new Pago(this.metodo, this.monto, this.moneda, EstadoPago.RECHAZADO);
  }

  estaAprobado(): boolean {
    return this.estado === EstadoPago.APROBADO;
  }

  estaPendiente(): boolean {
    return this.estado === EstadoPago.PENDIENTE;
  }
}
