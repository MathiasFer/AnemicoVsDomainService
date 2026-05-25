import { Orden } from '../entities/Orden';
import { Direccion } from '../entities/Direccion';
import { DomainException } from '../exceptions/DomainException';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CalculadorEnvioService {
  calcularCostoEnvio(
    orden: Orden,
    direccion: Direccion,
    prioridad: boolean,
  ): number {
    let costoEnvio = 5;

    // Cargo base por peso total del pedido
    const pesoTotal = orden.calcularPesoTotal();
    costoEnvio += pesoTotal * 0.5;

    // Recargo por envio fuera del pais de referencia
    if (direccion.esInternacional('Ecuador')) {
      costoEnvio += 15;
    }

    // Recargo adicional por envio prioritario
    if (prioridad) {
      costoEnvio += 10;
    }

    // Validacion de restricciones de envio por producto
    for (const producto of orden.obtenerProductos()) {
      if (!producto.puedeSerEnviado()) {
        throw new DomainException(
          `El producto ${producto.nombre} tiene restricciones de envío`,
          'CalculadorEnvioService',
          'calcularCostoEnvio',
          'DOMAIN_SERVICE',
          `Restricción logística global: El producto '${producto.nombre}' contiene componentes clasificados como peligrosos o restringidos (ej. baterías de litio, químicos), impidiendo su despacho fuera de almacén.`,
          'if (!producto.puedeSerEnviado()) { throw new Error(...); }',
        );
      }
    }

    return costoEnvio;
  }
}
