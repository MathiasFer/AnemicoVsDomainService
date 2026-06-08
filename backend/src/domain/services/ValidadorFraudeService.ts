import { Usuario } from '../entities/Usuario';
import { Pago } from '../value-objects/Pago';
import { Direccion } from '../value-objects/Direccion';
import { DomainException } from '../exceptions/DomainException';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ValidadorFraudeService {
  validarCompra(usuario: Usuario, pago: Pago, direccion: Direccion): void {
    const monto = pago.monto;

    if (monto > 5000) {
      throw new DomainException(
        'La compra excede el monto permitido',
        'ValidadorFraudeService',
        'validarCompra',
        'DOMAIN_SERVICE',
        `Monto solicitado: $${monto} USD. Límite: $5000.`,
        'if (monto > 5000) { throw new Error(...); }',
      );
    }

    if (usuario.obtenerNivelRiesgo() > 80) {
      throw new DomainException(
        'El usuario presenta alto riesgo',
        'ValidadorFraudeService',
        'validarCompra',
        'DOMAIN_SERVICE',
        `Riesgo: ${usuario.obtenerNivelRiesgo()}%. Límite: 80%.`,
        'if (usuario.obtenerNivelRiesgo() > 80) { throw new Error(...); }',
      );
    }

    if (direccion.esInternacional('Ecuador') && monto > 1000) {
      throw new DomainException(
        'Compras internacionales superiores a 1000 requieren validación física',
        'ValidadorFraudeService',
        'validarCompra',
        'DOMAIN_SERVICE',
        'Límite internacional automático: $1000 USD.',
        'if (direccion.esInternacional(...) && monto > 1000) { ... }',
      );
    }
  }
}
