import { Usuario } from '../entities/Usuario';
import { Pago } from '../entities/Pago';
import { Direccion } from '../entities/Direccion';
import { DomainException } from '../exceptions/DomainException';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ValidadorFraudeService {
  validarCompra(usuario: Usuario, pago: Pago, direccion: Direccion): void {
    // MONTO DEMASIADO ALTO
    if (pago.obtenerMonto() > 5000) {
      throw new DomainException(
        'La compra excede el monto permitido',
        'ValidadorFraudeService',
        'validarCompra',
        'DOMAIN_SERVICE',
        `Política de seguridad global: Ninguna transacción individual puede exceder los $5000 USD por motivos de prevención de fraude electrónico. Monto solicitado: $${pago.obtenerMonto()} USD.`,
        'if (pago.obtenerMonto() > 5000) { throw new Error("La compra excede el monto permitido"); }',
      );
    }

    // USUARIO SOSPECHOSO
    if (usuario.obtenerNivelRiesgo() > 80) {
      throw new DomainException(
        'El usuario presenta alto riesgo',
        'ValidadorFraudeService',
        'validarCompra',
        'DOMAIN_SERVICE',
        `Política de control de perfiles: El usuario '${usuario.nombre}' posee un nivel de riesgo calificado en ${usuario.obtenerNivelRiesgo()}% (Límite máximo permitido: 80%). Su transacción ha sido denegada por seguridad.`,
        'if (usuario.obtenerNivelRiesgo() > 80) { throw new Error("El usuario presenta alto riesgo"); }',
      );
    }

    // COMPRA INTERNACIONAL
    if (direccion.esInternacional('Ecuador')) {
      if (pago.obtenerMonto() > 1000) {
        throw new DomainException(
          'Compras internacionales superiores a 1000 requieren validación',
          'ValidadorFraudeService',
          'validarCompra',
          'DOMAIN_SERVICE',
          `Política aduanera y transfronteriza: Para envíos con destino fuera de Ecuador, no se admiten transacciones automáticas mayores a $1000 USD sin verificación física previa de identidad.`,
          "if (direccion.esInternacional('Ecuador') && pago.obtenerMonto() > 1000) { throw new Error(...); }",
        );
      }
    }
  }
}
