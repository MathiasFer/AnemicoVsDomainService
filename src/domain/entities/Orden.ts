import { Producto } from './Producto';
import { Usuario } from './Usuario';
import { Direccion } from './Direccion';

export class Orden {

  private productos: Producto[] = [];

  private estado: string = 'PENDIENTE';

  constructor(
    public id: number,
    private usuario: Usuario,
    private direccion: Direccion,
    private moneda: string,
  ) {}


  // GETTERS

  obtenerProductos(): Producto[] {
    return this.productos;
  }

  obtenerEstado(): string {
    return this.estado;
  }

  obtenerMoneda(): string {
    return this.moneda;
  }

  obtenerUsuario(): Usuario {
    return this.usuario;
  }


  // COMPORTAMIENTO DEL DOMINIO


  agregarProducto(producto: Producto): void {

    if (this.estado !== 'PENDIENTE') {
      throw new Error(
        'No se pueden agregar productos a una orden finalizada'
      );
    }

    this.productos.push(producto);
  }

  calcularSubtotal(): number {

    let subtotal = 0;

    for (const producto of this.productos) {
      subtotal += producto.obtenerPrecio();
    }

    return subtotal;
  }

  calcularTotalImpuestos(): number {

    let impuestos = 0;

    for (const producto of this.productos) {
      impuestos += (
        producto.obtenerPrecio() *
        producto.obtenerImpuesto()
      );
    }

    return impuestos;
  }

  calcularPesoTotal(): number {

    let pesoTotal = 0;

    for (const producto of this.productos) {
      pesoTotal += producto.obtenerPeso();
    }

    return pesoTotal;
  }

  finalizarOrden(): void {

    if (this.productos.length === 0) {
      throw new Error(
        'No se puede finalizar una orden vacía'
      );
    }

    this.estado = 'FINALIZADA';
  }

  cancelarOrden(): void {

    if (this.estado === 'FINALIZADA') {
      throw new Error(
        'No se puede cancelar una orden finalizada'
      );
    }

    this.estado = 'CANCELADA';
  }

  estaFinalizada(): boolean {
    return this.estado === 'FINALIZADA';
  }
}