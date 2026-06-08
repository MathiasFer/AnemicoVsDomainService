import { DomainException } from '../exceptions/DomainException';

/**
 * Entidad Producto.
 * Representa un artículo del catálogo con su stock disponible.
 */
export class Producto {
  constructor(
    public readonly id: number,
    public readonly nombre: string,
    private precio: number,
    private stock: number,
    private readonly peso: number,
    private readonly categoria: string,
    private readonly impuesto: number,
    private readonly envioRestringido: boolean,
  ) {
    this.validarInvariantes();
  }

  private validarInvariantes(): void {
    if (this.precio < 0) {
      throw new DomainException(
        'El precio no puede ser negativo',
        'Producto',
        'constructor',
        'ENTITY',
        'Un producto debe tener un valor comercial positivo o nulo.',
        'if (this.precio < 0) { throw new Error(...); }',
      );
    }
    if (this.stock < 0) {
      throw new DomainException(
        'El stock no puede ser negativo',
        'Producto',
        'constructor',
        'ENTITY',
        'El inventario no puede representar cantidades negativas de productos físicos.',
        'if (this.stock < 0) { throw new Error(...); }',
      );
    }
  }

  // GETTERS

  obtenerPrecio(): number {
    return this.precio;
  }

  obtenerStock(): number {
    return this.stock;
  }

  obtenerPeso(): number {
    return this.peso;
  }

  obtenerCategoria(): string {
    return this.categoria;
  }

  obtenerImpuesto(): number {
    return this.impuesto;
  }

  tieneEnvioRestringido(): boolean {
    return this.envioRestringido;
  }

  // COMPORTAMIENTO DEL DOMINIO

  validarDisponibilidad(cantidad: number): void {
    if (this.stock < cantidad) {
      throw new DomainException(
        `Stock insuficiente para el producto ${this.nombre}`,
        'Producto',
        'validarDisponibilidad',
        'ENTITY',
        `Disponibilidad: ${this.stock}, Solicitado: ${cantidad}.`,
        'if (this.stock < cantidad) { throw new Error(...); }',
      );
    }
  }

  /**
   * Modifica el estado interno protegiendo la invariante de stock.
   */
  descontarStock(cantidad: number): void {
    if (cantidad <= 0) return; // Opcional: lanzar error si se prefiere
    this.validarDisponibilidad(cantidad);
    this.stock -= cantidad;
  }

  aumentarStock(cantidad: number): void {
    if (cantidad <= 0) return;
    this.stock += cantidad;
  }
}
