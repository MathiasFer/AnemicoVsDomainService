import { Usuario } from '../../domain/entities/Usuario';
import { Producto } from '../../domain/entities/Producto';
import { Cupon } from '../../domain/entities/Cupon';
import { Envio } from '../../domain/entities/Envio';
export declare class CheckoutApplicationService {
    comprar(usuario: Usuario, productos: Producto[], cupon: Cupon, envio: Envio): number;
    calcularTotal(productos: Producto[]): number;
    calcularCostoEnvioPorPeso(productos: Producto[], envio: Envio, subtotal: number): number;
    validarDatosDeEntrada(usuario: Usuario, productos: Producto[], envio: Envio): void;
    aplicarDescuentoVip(usuario: Usuario, total: number): number;
    aplicarCuponDescuento(cupon: Cupon, total: number): number;
    validarStock(productos: Producto[]): void;
    descontarStock(productos: Producto[]): void;
    validarYDescontarSaldo(usuario: Usuario, total: number): void;
    acumularPuntosFidelidad(usuario: Usuario, total: number): void;
}
