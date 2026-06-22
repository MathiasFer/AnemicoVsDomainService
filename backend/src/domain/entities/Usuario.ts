import { DomainException } from '../exceptions/DomainException';

export class Usuario {
  private historialCompras: number[] = [];

  constructor(
    private readonly id: number,
    private nombre: string,
    private readonly email: string,
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
        'Nombre obligatorio para identificación.',
        'if (!this.nombre.trim()) { throw new Error(...); }',
      );
    }
    if (!this.email.includes('@')) {
      throw new DomainException(
        'El formato del email es inválido',
        'Usuario',
        'constructor',
        'ENTITY',
        'Email requerido para notificaciones.',
        'if (!this.email.includes("@")) { throw new Error(...); }',
      );
    }
    if (this.saldo < 0) {
      throw new DomainException(
        'El saldo inicial no puede ser negativo',
        'Usuario',
        'constructor',
        'ENTITY',
        'No se permiten cuentas en descubierto.',
        'if (this.saldo < 0) { throw new Error(...); }',
      );
    }
    if (this.nivelRiesgo < 0 || this.nivelRiesgo > 100) {
      throw new DomainException(
        'El nivel de riesgo debe estar entre 0 y 100',
        'Usuario',
        'constructor',
        'ENTITY',
        'Escala porcentual de riesgo.',
        'if (this.nivelRiesgo < 0 || this.nivelRiesgo > 100) { throw new Error(...); }',
      );
    }
  }

  obtenerId(): number {
    return this.id;
  }
  obtenerNombre(): string {
    return this.nombre;
  }
  obtenerEmail(): string {
    return this.email;
  }
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
    if (monto <= 0)
      throw new DomainException(
        'Monto inválido',
        'Usuario',
        'retirarSaldo',
        'ENTITY',
        'Monto debe ser positivo.',
        '',
      );
    if (this.saldo < monto)
      throw new DomainException(
        'Saldo insuficiente',
        'Usuario',
        'retirarSaldo',
        'ENTITY',
        'Protección financiera.',
        '',
      );
    this.saldo -= monto;
  }

  agregarSaldo(monto: number): void {
    if (monto <= 0)
      throw new DomainException(
        'Depósito inválido',
        'Usuario',
        'agregarSaldo',
        'ENTITY',
        'Abono debe ser positivo.',
        '',
      );
    this.saldo += monto;
  }

  actualizarMonedaPreferida(moneda: string): void {
    if (!moneda || moneda.length !== 3)
      throw new DomainException(
        'Código moneda inválido',
        'Usuario',
        'actualizarMonedaPreferida',
        'ENTITY',
        'ISO 4217 requerido.',
        '',
      );
    this.monedaPreferida = moneda.toUpperCase();
  }

  actualizarNombre(nombre: string): void {
    if (!nombre.trim())
      throw new DomainException(
        'Nombre inválido',
        'Usuario',
        'actualizarNombre',
        'ENTITY',
        'Nombre no puede estar vacío.',
        '',
      );
    this.nombre = nombre;
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
