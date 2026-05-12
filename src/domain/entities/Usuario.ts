export class Usuario {

  private historialCompras: number[] = [];

  constructor(
    public id: number,
    public nombre: string,
    public email: string,
    private saldo: number,
    private esVip: boolean,
    private nivelRiesgo: number,
    private monedaPreferida: string,
  ) {}

  // COMPORTAMIENTO DEL DOMINIO
 

  obtenerSaldo(): number {
    return this.saldo;
  }

  esUsuarioVip(): boolean {
    return this.esVip;
  }

  obtenerMonedaPreferida(): string {
    return this.monedaPreferida;
  }

  obtenerNivelRiesgo(): number {
    return this.nivelRiesgo;
  }

  retirarSaldo(monto: number): void {

    if (monto <= 0) {
      throw new Error('El monto debe ser mayor a cero');
    }

    if (this.saldo < monto) {
      throw new Error('Saldo insuficiente');
    }

    this.saldo -= monto;
  }

  agregarSaldo(monto: number): void {

    if (monto <= 0) {
      throw new Error('El monto debe ser positivo');
    }

    this.saldo += monto;
  }

  registrarCompra(ordenId: number): void {
    this.historialCompras.push(ordenId);
  }

  actualizarMonedaPreferida(moneda: string): void {

    if (!moneda) {
      throw new Error('La moneda es obligatoria');
    }

    this.monedaPreferida = moneda;
  }

  esUsuarioConfiable(): boolean {
    return this.nivelRiesgo < 70;
  }
}