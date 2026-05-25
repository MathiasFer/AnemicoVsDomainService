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
      total += producto.precio;
    }

    return total;
  }
  
  // MODELO ANÉMICO: Lógica de cálculo de flete filtrada en la capa de aplicación
  calcularCostoEnvioPorPeso(productos: Producto[], envio: Envio, subtotal: number): number {
    let pesoTotal = 0;
    for (const producto of productos) {
      pesoTotal += producto.peso;
    }
    
    let costoEnvio = envio.costo;
    if (pesoTotal > 10) {
      costoEnvio += 15; // Recargo por sobrepeso
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

  // MODELO ANÉMICO: Lógica comercial (cálculo de descuento) filtrada en la Capa de Aplicación.
  aplicarDescuentoVip(usuario: Usuario, total: number): number {
    if (usuario.esVip) {
      total = total * 0.9;
    }

    return total;
  }

  // MODELO ANÉMICO: Lógica condicional de promociones mezclada con el caso de uso
  aplicarCuponDescuento(cupon: Cupon, total: number): number {
    if (cupon && cupon.activo) {
      const descuento = total * (cupon.porcentajeDescuento / 100);
      return total - descuento;
    }
    return total;
  }

  // MODELO ANÉMICO: Validación externa de invariantes (debería validarse dentro de la entidad Producto).
  validarStock(productos: Producto[]): void {
    for (const producto of productos) {
      if (producto.stock <= 0) {
        throw new Error(`El producto ${producto.nombre} no tiene stock disponible`);
      }
    }
  }

  // MODELO ANÉMICO: Mutación directa externa que rompe el encapsulamiento del stock.
  descontarStock(productos: Producto[]): void {
    for (const producto of productos) {
      producto.stock = producto.stock - 1;
    }
  }

  // MODELO ANÉMICO: Modificación de atributos del Usuario desde afuera, violando límites de agregados.
  validarYDescontarSaldo(usuario: Usuario, total: number): void {
    if (usuario.saldo < total) {
      throw new Error('Saldo insuficiente');
    }

    usuario.saldo = usuario.saldo - total;
  }
  
  // MODELO ANÉMICO: Modificando directamente los puntos de fidelidad
  acumularPuntosFidelidad(usuario: Usuario, total: number): void {
    if (total > 100) {
      usuario.puntosFidelidad += 10;
    }
  }
}