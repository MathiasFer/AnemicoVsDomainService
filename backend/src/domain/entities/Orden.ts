import { Producto } from './Producto';
import { Usuario } from './Usuario';
import { Direccion } from './Direccion';
import { DomainException } from '../exceptions/DomainException';

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
      throw new DomainException(
        'No se pueden agregar productos a una orden finalizada',
        'Orden',
        'agregarProducto',
        'ENTITY',
        'La entidad Orden resguarda sus transiciones de estado. Una vez que la orden sale del estado PENDIENTE, queda congelada para evitar modificaciones inconsistentes.',
        "if (this.estado !== 'PENDIENTE') { throw new Error(...); }",
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
      impuestos += producto.obtenerPrecio() * producto.obtenerImpuesto();
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
      throw new DomainException(
        'No se puede finalizar una orden vacía',
        'Orden',
        'finalizarOrden',
        'ENTITY',
        'La entidad Orden (Aggregate Root) no permite finalizar compras sin productos asociados, garantizando que no existan facturas en cero.',
        'if (this.productos.length === 0) { throw new Error(...); }',
      );
    }

    this.estado = 'FINALIZADA';
  }

  cancelarOrden(): void {
    if (this.estado === 'FINALIZADA') {
      throw new DomainException(
        'No se puede cancelar una orden finalizada',
        'Orden',
        'cancelarOrden',
        'ENTITY',
        'Las órdenes en estado FINALIZADA representan transacciones comerciales ya cerradas e irreversibles en el dominio.',
        "if (this.estado === 'FINALIZADA') { throw new Error(...); }",
      );
    }

    this.estado = 'CANCELADA';
  }

  estaFinalizada(): boolean {
    return this.estado === 'FINALIZADA';
  }
}
