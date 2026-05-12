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
      throw new Error('La cantidad debe ser mayor a cero');
    }

    if (this.stock < cantidad) {
      throw new Error(
        `Stock insuficiente para el producto ${this.nombre}`
      );
    }
  }

  descontarStock(cantidad: number): void {

    this.validarDisponibilidad(cantidad);

    this.stock -= cantidad;
  }

  aumentarStock(cantidad: number): void {

    if (cantidad <= 0) {
      throw new Error('La cantidad debe ser positiva');
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
      throw new Error('Porcentaje inválido');
    }

    return this.precio - (this.precio * porcentaje / 100);
  }
}