export class Cupon {

  constructor(
    private codigo: string,
    private porcentajeDescuento: number,
    private activo: boolean,
    private montoMinimo: number,
  ) {

    this.validarPorcentaje();
  }

  // =========================
  // GETTERS
  // =========================

  obtenerCodigo(): string {
    return this.codigo;
  }

  obtenerPorcentajeDescuento(): number {
    return this.porcentajeDescuento;
  }

  obtenerMontoMinimo(): number {
    return this.montoMinimo;
  }

  estaActivo(): boolean {
    return this.activo;
  }

  // =========================
  // COMPORTAMIENTO DEL DOMINIO
  // =========================

  private validarPorcentaje(): void {

    if (
      this.porcentajeDescuento < 0 ||
      this.porcentajeDescuento > 100
    ) {
      throw new Error(
        'El porcentaje de descuento es inválido'
      );
    }
  }

  puedeAplicarse(totalCompra: number): boolean {

    if (!this.activo) {
      return false;
    }

    return totalCompra >= this.montoMinimo;
  }

  calcularDescuento(totalCompra: number): number {

    if (!this.puedeAplicarse(totalCompra)) {
      throw new Error(
        'El cupón no puede aplicarse'
      );
    }

    return (
      totalCompra *
      this.porcentajeDescuento
    ) / 100;
  }

  desactivar(): void {
    this.activo = false;
  }

  activar(): void {
    this.activo = true;
  }
}