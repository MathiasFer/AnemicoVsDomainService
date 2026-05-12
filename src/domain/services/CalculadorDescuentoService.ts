import { Usuario } from '../entities/Usuario';
import { Cupon } from '../entities/Cupon';

export class CalculadorDescuentoService {

  calcularDescuento(
    usuario: Usuario,
    cupon: Cupon,
    subtotal: number
  ): number {

    let descuento = 0;

    // =========================
    // DESCUENTO VIP
    // =========================

    if (usuario.esUsuarioVip()) {
      descuento += subtotal * 0.10;
    }

    // =========================
    // DESCUENTO CUPÓN
    // =========================

    if (cupon.puedeAplicarse(subtotal)) {

      descuento +=
        cupon.calcularDescuento(subtotal);
    }

    return descuento;
  }
}