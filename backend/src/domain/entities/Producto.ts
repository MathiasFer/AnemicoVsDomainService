import { DomainException } from '../exceptions/DomainException';

export class Producto {

  constructor(
    public id: number,
    public nombre: string,
    private precio: number,
    private stock: number,
    private peso: number,
    private categoria: string,
    private impuesto: number,
    private envioRestringido: boolean,
  ) {}

  // GETTERS DEL DOMINIO

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
    if (cantidad <= 0) {
      throw new DomainException(
        'La cantidad debe ser mayor a cero',
        'Producto',
        'validarDisponibilidad',
        'ENTITY',
        'La entidad Producto rechaza transacciones con cantidades nulas o negativas para evitar inconsistencias en el cálculo del carrito.',
        'if (cantidad <= 0) { throw new Error(...); }'
      );
    }

    if (this.stock < cantidad) {
      throw new DomainException(
        `Stock insuficiente para el producto ${this.nombre}`,
        'Producto',
        'validarDisponibilidad',
        'ENTITY',
        `La entidad Producto valida su stock disponible (${this.stock}) antes de confirmar la compra. Si la cantidad solicitada (${cantidad}) lo supera, se aborta la operación para proteger la consistencia de inventario.`,
        'if (this.stock < cantidad) { throw new Error(...); }'
      );
    }
  }

  descontarStock(cantidad: number): void {
    this.validarDisponibilidad(cantidad);
    this.stock -= cantidad;
  }

  aumentarStock(cantidad: number): void {
    if (cantidad <= 0) {
      throw new DomainException(
        'La cantidad debe ser positiva',
        'Producto',
        'aumentarStock',
        'ENTITY',
        'El incremento de stock en la entidad Producto debe ser un valor estrictamente positivo.',
        'if (cantidad <= 0) { throw new Error(...); }'
      );
    }
    this.stock += cantidad;
  }

  calcularPrecioConImpuesto(): number {
    return this.precio + (this.precio * this.impuesto);
  }

  puedeSerEnviado(): boolean {
    return !this.envioRestringido;
  }

  aplicarDescuento(porcentaje: number): number {
    if (porcentaje < 0 || porcentaje > 100) {
      throw new DomainException(
        'Porcentaje inválido',
        'Producto',
        'aplicarDescuento',
        'ENTITY',
        'El porcentaje de descuento del producto debe estar comprendido estrictamente entre 0% y 100%.',
        'if (porcentaje < 0 || porcentaje > 100) { throw new Error(...); }'
      );
    }
    return this.precio - (this.precio * porcentaje / 100);
  }
}