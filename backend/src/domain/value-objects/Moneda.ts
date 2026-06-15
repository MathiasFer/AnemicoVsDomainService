import { DomainException } from '../exceptions/DomainException';

/**
 * VO Moneda: Lógica de divisa inmutable.
 */
export class Moneda {
  constructor(
    public readonly codigo: string,
    public readonly simbolo: string,
    public readonly tasaCambio: number,
  ) {
    if (this.tasaCambio <= 0)
      throw new DomainException(
        'Tasa inválida',
        'Moneda',
        'constructor',
        'VALUE_OBJECT',
        'Tasa debe ser > 0.',
        '',
      );
  }

  public convertir(monto: number): number {
    return monto * this.tasaCambio;
  }
}
