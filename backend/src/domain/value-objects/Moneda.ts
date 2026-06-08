import { DomainException } from '../exceptions/DomainException';

/**
 * Value Object: Moneda.
 * Define una divisa y su capacidad de conversión.
 */
export class Moneda {
  constructor(
    public readonly codigo: string,
    public readonly simbolo: string,
    public readonly tasaCambio: number,
  ) {
    this.validarTasaCambio();
  }

  private validarTasaCambio(): void {
    if (this.tasaCambio <= 0) {
      throw new DomainException(
        'La tasa de cambio debe ser positiva',
        'Moneda',
        'constructor',
        'VALUE_OBJECT',
        'No se pueden realizar conversiones con tasas nulas o negativas.',
        'if (this.tasaCambio <= 0) { throw new Error(...); }',
      );
    }
  }

  public convertir(monto: number): number {
    return monto * this.tasaCambio;
  }
}
