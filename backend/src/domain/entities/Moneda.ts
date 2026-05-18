import { DomainException } from '../exceptions/DomainException';

export class Moneda {

  constructor(
    private codigo: string,
    private simbolo: string,
    private tasaCambio: number,
  ) {
    this.validarTasaCambio();
  }

  // GETTERS

  obtenerCodigo(): string {
    return this.codigo;
  }

  obtenerSimbolo(): string {
    return this.simbolo;
  }

  obtenerTasaCambio(): number {
    return this.tasaCambio;
  }

  // COMPORTAMIENTO DEL DOMINIO

  private validarTasaCambio(): void {
    if (this.tasaCambio <= 0) {
      throw new DomainException(
        'La tasa de cambio debe ser mayor a cero',
        'Moneda',
        'validarTasaCambio',
        'ENTITY',
        'La tasa de cambio debe ser un factor de conversión estrictamente positivo para evitar divisiones por cero o montos invertidos.',
        'if (this.tasaCambio <= 0) { throw new Error(...); }'
      );
    }
  }

  actualizarTasaCambio(nuevaTasa: number): void {
    if (nuevaTasa <= 0) {
      throw new DomainException(
        'La nueva tasa de cambio es inválida',
        'Moneda',
        'actualizarTasaCambio',
        'ENTITY',
        'Toda actualización de tasas de cambio mercantiles debe contemplar valores positivos.',
        'if (nuevaTasa <= 0) { throw new Error(...); }'
      );
    }

    this.tasaCambio = nuevaTasa;
  }

  convertirMonto(monto: number): number {
    if (monto <= 0) {
      throw new DomainException(
        'El monto debe ser mayor a cero',
        'Moneda',
        'convertirMonto',
        'ENTITY',
        'No se pueden aplicar fórmulas de conversión monetaria sobre montos vacíos o negativos.',
        'if (monto <= 0) { throw new Error(...); }'
      );
    }

    return monto * this.tasaCambio;
  }

  esDolar(): boolean {
    return this.codigo === 'USD';
  }
}