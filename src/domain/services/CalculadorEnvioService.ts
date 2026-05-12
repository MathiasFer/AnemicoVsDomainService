import { Orden } from '../entities/Orden';
import { Direccion } from '../entities/Direccion';

export class CalculadorEnvioService {

  calcularCostoEnvio(
    orden: Orden,
    direccion: Direccion,
    prioridad: boolean
  ): number {

    let costoEnvio = 5;

    // PESO TOTAL
    const pesoTotal =
      orden.calcularPesoTotal();

    costoEnvio += pesoTotal * 0.5;

    // ENVÍO INTERNACIONAL
    if (direccion.esInternacional('Ecuador')) {
      costoEnvio += 15;
    }

    // PRIORIDAD
    if (prioridad) {
      costoEnvio += 10;
    }
    // PRODUCTOS RESTRINGIDOS

    for (const producto of orden.obtenerProductos()) {

      if (!producto.puedeSerEnviado()) {

        throw new Error(
          `El producto ${producto.nombre} tiene restricciones de envío`
        );
      }
    }

    return costoEnvio;
  }
}