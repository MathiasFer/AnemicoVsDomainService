import { Pago, EstadoPago } from '../value-objects/Pago';
import { Usuario } from '../entities/Usuario';
import { DomainException } from '../exceptions/DomainException';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProcesadorPagoService {
  /**
   * Coordina el pago entre el Usuario y la entidad Pago.
   * Retorna el objeto Pago actualizado (como VO inmutable).
   */
  procesarPago(usuario: Usuario, pago: Pago): Pago {
    if (!pago.estaPendiente()) {
      throw new DomainException(
        'El pago ya fue procesado',
        'ProcesadorPagoService',
        'procesarPago',
        'DOMAIN_SERVICE',
        'No se puede procesar un pago que no esté en estado PENDIENTE.',
        'if (!pago.estaPendiente()) { throw new Error(...); }',
      );
    }

    if (usuario.obtenerSaldo() < pago.monto) {
      throw new DomainException(
        'Saldo insuficiente',
        'ProcesadorPagoService',
        'procesarPago',
        'DOMAIN_SERVICE',
        `Saldo: ${usuario.obtenerSaldo()}, Monto: ${pago.monto}.`,
        'if (usuario.obtenerSaldo() < pago.monto) { throw new Error(...); }',
      );
    }

    // El Usuario protege su saldo (Rich Model)
    usuario.retirarSaldo(pago.monto);
    
    // El Pago retorna una nueva instancia aprobada (VO Inmutable)
    return pago.aprobar();
  }
}
