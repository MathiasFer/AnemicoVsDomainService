import { Usuario } from '../entities/Usuario';
import { Cupon } from '../entities/Cupon';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CalculadorDescuentoService {
  calcularDescuento(usuario: Usuario, cupon: Cupon, subtotal: number): number {
    let descuento = 0;

    // DESCUENTO VIP: se aplica el 10% si el usuario posee estado VIP
    if (usuario.esUsuarioVip()) {
      descuento += subtotal * 0.1;
    }

    // DESCUENTO CUPON: se aplica si el cupon esta activo y el subtotal supera el minimo
    if (cupon.puedeAplicarse(subtotal)) {
      descuento += cupon.calcularDescuento(subtotal);
    }

    return descuento;
  }
}
