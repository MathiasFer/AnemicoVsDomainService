import { IProveedorCambioMoneda } from '../interfaces/IProveedorCambioMoneda';

export class ConversorMonedaService {

  constructor(
    private proveedorCambio: IProveedorCambioMoneda
  ) {}

  async convertir(
    monto: number,
    monedaOrigen: string,
    monedaDestino: string
  ): Promise<number> {

    if (monto <= 0) {
      throw new Error(
        'El monto debe ser mayor a cero'
      );
    }

    if (monedaOrigen === monedaDestino) {
      return monto;
    }

    const tasaCambio =
      await this.proveedorCambio.obtenerTasaCambio(
        monedaOrigen,
        monedaDestino
      );

    return monto * tasaCambio;
  }
}