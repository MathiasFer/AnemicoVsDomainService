import { DomainException } from '../exceptions/DomainException';

export class Producto {
  constructor(
    private readonly id: number,
    private readonly nombre: string,
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
    if (this.precio < 0)
      throw new DomainException(
        'Precio inválido',
        'Producto',
        'constructor',
        'ENTITY',
        'Valor comercial >= 0.',
        '',
      );
    if (this.stock < 0)
      throw new DomainException(
        'Stock inválido',
        'Producto',
        'constructor',
        'ENTITY',
        'Inventario >= 0.',
        '',
      );
  }

  obtenerId(): number {
    return this.id;
  }
  obtenerNombre(): string {
    return this.nombre;
  }
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

  validarDisponibilidad(cantidad: number): void {
    if (this.stock < cantidad)
      throw new DomainException(
        `Stock insuficiente: ${this.nombre}`,
        'Producto',
        'validarDisponibilidad',
        'ENTITY',
        `Disponible: ${this.stock}.`,
        '',
      );
  }

  descontarStock(cantidad: number): void {
    if (cantidad <= 0) return;
    this.validarDisponibilidad(cantidad);
    this.stock -= cantidad;
  }

  aumentarStock(cantidad: number): void {
    if (cantidad <= 0) return;
    this.stock += cantidad;
  }
}
