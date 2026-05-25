import { Pago } from '../entities/Pago';
import { Usuario } from '../entities/Usuario';
import { DomainException } from '../exceptions/DomainException';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProcesadorPagoService {
  procesarPago(usuario: Usuario, pago: Pago): void {
    /// Validar que el pago esté en estado pendiente antes de procesar
    if (!pago.estaPendiente()) {
      throw new DomainException(
        'El pago ya fue procesado',
        'ProcesadorPagoService',
        'procesarPago',
        'DOMAIN_SERVICE',
        'El Procesador de Pagos rechaza cualquier intento de reprocesar un pago que ya posee un estado resuelto (Aprobado o Rechazado).',
        'if (!pago.estaPendiente()) { throw new Error(...); }',
      );
    }

    /// Validar que el usuario tenga saldo suficiente para cubrir el monto del pago
    if (usuario.obtenerSaldo() < pago.obtenerMonto()) {
      throw new DomainException(
        'Saldo insuficiente',
        'ProcesadorPagoService',
        'procesarPago',
        'DOMAIN_SERVICE',
        `El Procesador de Pagos verifica el saldo del usuario ($${usuario.obtenerSaldo()} USD) contra el total de la compra ($${pago.obtenerMonto()} USD). Al ser inferior, detiene la transacción antes de debitar.`,
        'if (usuario.obtenerSaldo() < pago.obtenerMonto()) { throw new Error("Saldo insuficiente"); }',
      );
    }

    /// Debitar saldo del usuario y marcar el pago como aprobado
    usuario.retirarSaldo(pago.obtenerMonto());
    pago.aprobarPago();
  }
}
