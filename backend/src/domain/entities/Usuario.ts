import { DomainException } from '../exceptions/DomainException';

/**
 * Entidad Usuario.
 * Protege sus invariantes de saldo, riesgo y datos personales.
 */
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
  ) {
    this.validarInvariantes();
  }

  private validarInvariantes(): void {
    if (!this.nombre.trim()) {
      throw new DomainException(
        'El nombre del usuario no puede estar vacío',
        'Usuario',
        'constructor',
        'ENTITY',
        'Toda entidad Usuario requiere un nombre legal o comercial para su identificación en el sistema.',
        'if (!this.nombre.trim()) { throw new Error(...); }',
      );
    }
    if (!this.email.includes('@')) {
      throw new DomainException(
        'El formato del email es inválido',
        'Usuario',
        'constructor',
        'ENTITY',
        'El correo electrónico es el canal de comunicación y notificación principal del dominio.',
        'if (!this.email.includes("@")) { throw new Error(...); }',
      );
    }
    if (this.saldo < 0) {
      throw new DomainException(
        'El saldo inicial no puede ser negativo',
        'Usuario',
        'constructor',
        'ENTITY',
        'El saldo representa fondos reales depositados; el dominio no permite cuentas en descubierto en este contexto.',
        'if (this.saldo < 0) { throw new Error(...); }',
      );
    }
    if (this.nivelRiesgo < 0 || this.nivelRiesgo > 100) {
      throw new DomainException(
        'El nivel de riesgo debe estar entre 0 y 100',
        'Usuario',
        'constructor',
        'ENTITY',
        'El riesgo se mide en una escala porcentual para ser procesado por el Validador de Fraude.',
        'if (this.nivelRiesgo < 0 || this.nivelRiesgo > 100) { throw new Error(...); }',
      );
    }
  }

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
        'El monto a retirar debe ser mayor a cero',
        'Usuario',
        'retirarSaldo',
        'ENTITY',
        'El retiro de fondos debe representar una cantidad positiva de dinero.',
        'if (monto <= 0) { throw new Error(...); }',
      );
    }

    if (this.saldo < monto) {
      throw new DomainException(
        'Saldo insuficiente',
        'Usuario',
        'retirarSaldo',
        'ENTITY',
        `Protección de integridad financiera: Saldo actual: $${this.saldo}, Solicitado: $${monto}.`,
        'if (this.saldo < monto) { throw new Error("Saldo insuficiente"); }',
      );
    }

    this.saldo -= monto;
  }

  agregarSaldo(monto: number): void {
    if (monto <= 0) {
      throw new DomainException(
        'El depósito debe ser positivo',
        'Usuario',
        'agregarSaldo',
        'ENTITY',
        'No se pueden realizar abonos negativos o nulos a la cuenta del usuario.',
        'if (monto <= 0) { throw new Error(...); }',
      );
    }

    this.saldo += monto;
  }

  actualizarMonedaPreferida(moneda: string): void {
    if (!moneda || moneda.length !== 3) {
      throw new DomainException(
        'Código de moneda inválido (ISO 4217)',
        'Usuario',
        'actualizarMonedaPreferida',
        'ENTITY',
        'El sistema requiere un código de moneda estándar de 3 caracteres.',
        'if (!moneda || moneda.length !== 3) { throw new Error(...); }',
      );
    }
    this.monedaPreferida = moneda.toUpperCase();
  }

  establecerSaldo(saldo: number): void {
    if (saldo < 0) throw new Error('Saldo negativo no permitido');
    this.saldo = saldo;
  }

  establecerEstadoVip(esVip: boolean): void {
    this.esVip = esVip;
  }

  actualizarNivelRiesgo(nivelRiesgo: number): void {
    if (nivelRiesgo < 0 || nivelRiesgo > 100) throw new Error('Riesgo fuera de rango');
    this.nivelRiesgo = nivelRiesgo;
  }
}
