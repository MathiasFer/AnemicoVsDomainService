import { DomainException } from '../exceptions/DomainException';

export class Usuario {
  private historialCompras: number[] = [];

  constructor(
    public id: number,
    public nombre: string,
    public email: string,
    private saldo: number,
    private esVip: boolean,
    private nivelRiesgo: number,
    private monedaPreferida: string,
  ) {}

  // COMPORTAMIENTO DEL DOMINIO

  obtenerSaldo(): number {
    return this.saldo;
  }

  esUsuarioVip(): boolean {
    return this.esVip;
  }

  obtenerMonedaPreferida(): string {
    return this.monedaPreferida;
  }

  obtenerNivelRiesgo(): number {
    return this.nivelRiesgo;
  }

  retirarSaldo(monto: number): void {
    if (monto <= 0) {
      throw new DomainException(
        'El monto debe ser mayor a cero',
        'Usuario',
        'retirarSaldo',
        'ENTITY',
        'El monto a retirar de la cuenta del usuario debe ser un valor positivo.',
        'if (monto <= 0) { throw new Error(...); }',
      );
    }

    if (this.saldo < monto) {
      throw new DomainException(
        'Saldo insuficiente',
        'Usuario',
        'retirarSaldo',
        'ENTITY',
        `La entidad Usuario protege su integridad financiera e impide retiros por encima del saldo disponible. Saldo actual: $${this.saldo} USD, Monto solicitado: $${monto} USD.`,
        'if (this.saldo < monto) { throw new Error("Saldo insuficiente"); }',
      );
    }

    this.saldo -= monto;
  }

  agregarSaldo(monto: number): void {
    if (monto <= 0) {
      throw new DomainException(
        'El monto debe ser positivo',
        'Usuario',
        'agregarSaldo',
        'ENTITY',
        'El depósito de saldo debe ser estrictamente positivo.',
        'if (monto <= 0) { throw new Error(...); }',
      );
    }

    this.saldo += monto;
  }

  registrarCompra(ordenId: number): void {
    this.historialCompras.push(ordenId);
  }

  actualizarMonedaPreferida(moneda: string): void {
    if (!moneda) {
      throw new DomainException(
        'La moneda es obligatoria',
        'Usuario',
        'actualizarMonedaPreferida',
        'ENTITY',
        'El usuario debe tener una moneda preferida válida asignada.',
        'if (!moneda) { throw new Error(...); }',
      );
    }

    this.monedaPreferida = moneda;
  }

  esUsuarioConfiable(): boolean {
    return this.nivelRiesgo < 70;
  }

  establecerSaldo(saldo: number): void {
    this.saldo = saldo;
  }

  establecerEstadoVip(esVip: boolean): void {
    this.esVip = esVip;
  }

  actualizarNivelRiesgo(nivelRiesgo: number): void {
    this.nivelRiesgo = nivelRiesgo;
  }
}
