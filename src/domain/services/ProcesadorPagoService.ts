import { Pago } from '../entities/Pago';
import { Usuario } from '../entities/Usuario';

export class ProcesadorPagoService {

  procesarPago(
    usuario: Usuario,
    pago: Pago,
  ): void {

    if (!pago.estaPendiente()) {

      throw new Error(
        'El pago ya fue procesado'
      );
    }

    if (
      usuario.obtenerSaldo() <
      pago.obtenerMonto()
    ) {

      throw new Error(
        'Saldo insuficiente'
      );
    }

    usuario.retirarSaldo(
      pago.obtenerMonto()
    );

    pago.aprobarPago();
  }
}