export interface IProveedorCambioMoneda {
  obtenerTasaCambio(
    monedaOrigen: string,
    monedaDestino: string,
  ): Promise<number>;
}
