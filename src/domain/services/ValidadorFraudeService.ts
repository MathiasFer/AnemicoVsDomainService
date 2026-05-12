import { Usuario } from '../entities/Usuario';
import { Pago } from '../entities/Pago';
import { Direccion } from '../entities/Direccion';

export class ValidadorFraudeService {

  validarCompra(
    usuario: Usuario,
    pago: Pago,
    direccion: Direccion
  ): void {

 
    // MONTO DEMASIADO ALTO

    if (pago.obtenerMonto() > 5000) {

      throw new Error(
        'La compra excede el monto permitido'
      );
    }

    // USUARIO SOSPECHOSO


    if (usuario.obtenerNivelRiesgo() > 80) {

      throw new Error(
        'El usuario presenta alto riesgo'
      );
    }

    // COMPRA INTERNACIONAl

    if (direccion.esInternacional('Ecuador')) {

      if (pago.obtenerMonto() > 1000) {

        throw new Error(
          'Compras internacionales superiores a 1000 requieren validación'
        );
      }
    }
  }
}