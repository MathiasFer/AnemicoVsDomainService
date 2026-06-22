import { Usuario } from '../../domain/entities/Usuario';
import { Producto } from '../../domain/entities/Producto';
import { Cupon } from '../../domain/entities/Cupon';
import { Envio } from '../../domain/entities/Envio';
import { BadRequestException } from '@nestjs/common';

export class CheckoutApplicationService {

 
  comprar(
    usuario: Usuario,
    productos: Producto[],
    cupon: Cupon,
    envio: Envio,
  ): number {
    this.validarDatosDeEntrada(usuario, productos, envio);

    let total = this.calcularTotal(productos);
    
    total = this.calcularCostoEnvioPorPeso(productos, envio, total);

    total = this.aplicarDescuentoVip(usuario, total);
    
    total = this.aplicarCuponDescuento(cupon, total);

    this.validarStock(productos);

    this.descontarStock(productos);

    this.validarYDescontarSaldo(usuario, total);
    
    this.acumularPuntosFidelidad(usuario, total);

    return total;
  }



  calcularTotal(productos: Producto[]): number {
    let total = 0;

    for (const producto of productos) {
      total += producto.getPrecio();
    }

    return total;
  }
  
  calcularCostoEnvioPorPeso(productos: Producto[], envio: Envio, subtotal: number): number {
    let pesoTotal = 0;
    for (const producto of productos) {
      pesoTotal += producto.getPeso();
    }
    
    let costoEnvio = envio.costo;
    if (pesoTotal > 10) {
      costoEnvio += 15;
    }
    
    return subtotal + costoEnvio;
  }

  validarDatosDeEntrada(
    usuario: Usuario,
    productos: Producto[],
    envio: Envio,
  ): void {
    if (!usuario) {
      throw new BadRequestException('usuario es obligatorio');
    }

    if (!Array.isArray(productos)) {
      throw new BadRequestException('productos debe ser un arreglo');
    }

    if (productos.length === 0) {
      throw new BadRequestException('productos no puede estar vacio');
    }

    if (!envio) {
      throw new BadRequestException('envio es obligatorio');
    }
  }

  aplicarDescuentoVip(usuario: Usuario, total: number): number {
    if (usuario.getEsVip()) {
      total = total * 0.9;
    }

    return total;
  }

  aplicarCuponDescuento(cupon: Cupon, total: number): number {
    if (cupon && cupon.activo) {
      const descuento = total * (cupon.porcentajeDescuento / 100);
      return total - descuento;
    }
    return total;
  }

  validarStock(productos: Producto[]): void {
    for (const producto of productos) {
      if (producto.getStock() <= 0) {
        throw new Error(`El producto ${producto.getNombre()} no tiene stock disponible`);
      }
    }
  }

  descontarStock(productos: Producto[]): void {
    for (const producto of productos) {
      producto.setStock(producto.getStock() - 1);
    }
  }

  validarYDescontarSaldo(usuario: Usuario, total: number): void {
    if (usuario.getSaldo() < total) {
      throw new Error('Saldo insuficiente');
    }

    usuario.setSaldo(usuario.getSaldo() - total);
  }
  
  acumularPuntosFidelidad(usuario: Usuario, total: number): void {
    if (total > 100) {
      usuario.setPuntosFidelidad(usuario.getPuntosFidelidad() + 10);
    }
  }
}