import { Usuario } from '../entities/Usuario';
import { Cupon } from '../value-objects/Cupon';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CalculadorDescuentoService {
  calcularDescuento(usuario: Usuario, cupon: Cupon, subtotal: number): number {
    let descuento = 0;

    if (usuario.esUsuarioVip()) {
      descuento += subtotal * 0.1;
    }


    if (cupon.puedeAplicarse(subtotal)) {
      descuento += cupon.calcularDescuento(subtotal);
    }

    return descuento;
  }
}
