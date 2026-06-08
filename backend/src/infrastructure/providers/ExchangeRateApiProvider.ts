import { Injectable } from '@nestjs/common';
import { IProveedorCambioMoneda } from '../../domain/interfaces/IProveedorCambioMoneda';
// import axios from 'axios'; // <-- Descomentar para usar llamadas API reales

@Injectable()
export class ExchangeRateApiProvider implements IProveedorCambioMoneda {
  async obtenerTasaCambio(
    monedaOrigen: string,
    monedaDestino: string,
  ): Promise<number> {
    await Promise.resolve();
    /// IMPLEMENTACIÓN MOCK DETERMINISTA (Para pruebas locales y sin internet)
    const origen = monedaOrigen.toUpperCase();
    const destino = monedaDestino.toUpperCase();

    if (origen === destino) {
      return 1.0;
    }

    // Tasas de cambio mockeadas contra USD
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

    // Tasa por defecto
    return 1.0;

    /// CÓDIGO ORIGINAL CON AXIOS (Descomentar para usar en producción real)
    /*
    try {
      const response = await axios.get(
        `https://api.exchangerate-api.com/v4/latest/${monedaOrigen}`
      );
      const tasa = response.data.rates[monedaDestino];
      if (!tasa) {
        throw new Error('No se encontró tasa de cambio');
      }
      return tasa;
    } catch (error) {
      throw new Error('Error obteniendo tasa de cambio de la API externa');
    }
    */
  }
}
