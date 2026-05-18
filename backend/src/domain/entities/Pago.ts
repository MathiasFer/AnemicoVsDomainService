import { DomainException } from '../exceptions/DomainException';

export class Pago {

  private estado: string = 'PENDIENTE';

  constructor(
    private metodo: string,
    private monto: number,
    private moneda: string,
  ) {
    this.validarMonto();
  }

  // =========================
  // GETTERS
  // =========================

  obtenerMetodo(): string {
    return this.metodo;
  }

  obtenerMonto(): number {
    return this.monto;
  }

  obtenerMoneda(): string {
    return this.moneda;
  }

  obtenerEstado(): string {
    return this.estado;
  }

  // =========================
  // COMPORTAMIENTO DEL DOMINIO
  // =========================

  private validarMonto(): void {
    if (this.monto <= 0) {
      throw new DomainException(
        'El monto del pago debe ser mayor a cero',
        'Pago',
        'validarMonto',
        'ENTITY',
        'La entidad Pago exige montos estrictamente positivos para garantizar que no existan facturas o transacciones vacías o negativas.',
        'if (this.monto <= 0) { throw new Error(...); }'
      );
    }
  }

  aprobarPago(): void {
    if (this.estado === 'APROBADO') {
      throw new DomainException(
        'El pago ya fue aprobado',
        'Pago',
        'aprobarPago',
        'ENTITY',
        'Protección contra doble cargo. Un pago en estado APROBADO no puede re-procesarse ni aprobarse de nuevo.',
        "if (this.estado === 'APROBADO') { throw new Error(...); }"
      );
    }

    if (this.estado === 'RECHAZADO') {
      throw new DomainException(
        'No se puede aprobar un pago rechazado',
        'Pago',
        'aprobarPago',
        'ENTITY',
        'Un pago fallido o RECHAZADO no puede pasar a estado APROBADO; debe iniciarse una nueva transacción de pago.',
        "if (this.estado === 'RECHAZADO') { throw new Error(...); }"
      );
    }

    this.estado = 'APROBADO';
  }

  rechazarPago(): void {
    if (this.estado === 'APROBADO') {
      throw new DomainException(
        'No se puede rechazar un pago aprobado',
        'Pago',
        'rechazarPago',
        'ENTITY',
        'Una transacción mercantil aprobada y cobrada no puede reversarse simplemente marcándose como rechazada.',
        "if (this.estado === 'APROBADO') { throw new Error(...); }"
      );
    }

    this.estado = 'RECHAZADO';
  }

  estaAprobado(): boolean {
    return this.estado === 'APROBADO';
  }

  estaPendiente(): boolean {
    return this.estado === 'PENDIENTE';
  }

  esPagoInternacional(monedaLocal: string): boolean {
    return this.moneda.toLowerCase() !== monedaLocal.toLowerCase();
  }

  actualizarMetodoPago(nuevoMetodo: string): void {
    if (!nuevoMetodo.trim()) {
      throw new DomainException(
        'El método de pago es obligatorio',
        'Pago',
        'actualizarMetodoPago',
        'ENTITY',
        'El método de pago (ej. Tarjeta de Crédito, Transferencia) es requerido para fines de auditoría financiera.',
        "if (!nuevoMetodo.trim()) { throw new Error(...); }"
      );
    }

    this.metodo = nuevoMetodo;
  }
}