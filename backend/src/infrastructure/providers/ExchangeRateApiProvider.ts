import { Injectable } from '@nestjs/common';
import { IProveedorCambioMoneda } from '../../domain/interfaces/IProveedorCambioMoneda';

@Injectable()
export class ExchangeRateApiProvider implements IProveedorCambioMoneda {
  async obtenerTasaCambio(
    monedaOrigen: string,
    monedaDestino: string,
  ): Promise<number> {
    await Promise.resolve();
    const origen = monedaOrigen.toUpperCase();
    const destino = monedaDestino.toUpperCase();

    if (origen === destino) {
      return 1.0;
    }

    const tasasContraUSD: { [key: string]: number } = {
      USD: 1.0,
      EUR: 0.92,
      MXN: 17.5,
      COP: 4000,
      CLP: 900,
    };

    if (origen === 'USD' && tasasContraUSD[destino]) {
      return tasasContraUSD[destino];
    }

    return 1.0;
  }
}
