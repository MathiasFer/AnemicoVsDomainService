import { Inject, Injectable } from '@nestjs/common';
import type { IProveedorCambioMoneda } from '../interfaces/IProveedorCambioMoneda';
import { DomainException } from '../exceptions/DomainException';

@Injectable()
export class ConversorMonedaService {
  constructor(
    @Inject('IProveedorCambioMoneda')
    private proveedorCambio: IProveedorCambioMoneda,
  ) {}

  async convertir(
    monto: number,
    monedaOrigen: string,
    monedaDestino: string,
  ): Promise<number> {
    if (monto <= 0) {
      throw new DomainException(
        'El monto debe ser mayor a cero',
        'ConversorMonedaService',
        'convertir',
        'DOMAIN_SERVICE',
        'La conversión de divisas requiere valores positivos para operar.',
        'if (monto <= 0) { throw new Error(...); }',
      );
    }

    // Si la moneda de origen y destino son iguales no se requiere conversion
    if (monedaOrigen === monedaDestino) {
      return monto;
    }

    const tasaCambio = await this.proveedorCambio.obtenerTasaCambio(
      monedaOrigen,
      monedaDestino,
    );

    return monto * tasaCambio;
  }
}
