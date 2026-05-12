import axios from 'axios';

import { IProveedorCambioMoneda }
from '../../domain/interfaces/IProveedorCambioMoneda';

export class ExchangeRateApiProvider
implements IProveedorCambioMoneda {

  async obtenerTasaCambio(
    monedaOrigen: string,
    monedaDestino: string
  ): Promise<number> {

    try {

      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/${monedaOrigen}`
      );

      const tasa =
        response.data.rates[monedaDestino];

      if (!tasa) {
        throw new Error(
          'No se encontró tasa de cambio'
        );
      }

      return tasa;

    } catch (error) {

      throw new Error(
        'Error obteniendo tasa de cambio'
      );
    }
  }
}