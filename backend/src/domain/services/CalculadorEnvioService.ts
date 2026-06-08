import { Orden } from '../entities/Orden';
import { Direccion } from '../value-objects/Direccion';
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

    const pesoTotal = orden.calcularPesoTotal();
    costoEnvio += pesoTotal * 0.5;

    if (direccion.esInternacional('Ecuador')) {
      costoEnvio += 15;
    }

    if (prioridad) {
      costoEnvio += 10;
    }

    for (const item of orden.obtenerItems()) {
      if (item.envioRestringido) {
        throw new DomainException(
          `El producto ${item.nombre} tiene restricciones de envío`,
          'CalculadorEnvioService',
          'calcularCostoEnvio',
          'DOMAIN_SERVICE',
          `Restricción logística global: El producto '${item.nombre}' contiene componentes clasificados como peligrosos o restringidos (ej. baterías de litio, químicos), impidiendo su despacho fuera de almacén.`,
          'if (item.envioRestringido) { throw new Error(...); }',
        );
      }
    }

    return costoEnvio;
  }
}
