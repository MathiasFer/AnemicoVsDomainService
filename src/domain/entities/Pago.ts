export class Pago {

    private estado: string = 'PENDIENTE';
  
    constructor(
      private metodo: string,
      private monto: number,
      private moneda: string,
    ) {
  
      this.validarMonto();
    }
  
    // =========================
    // GETTERS
    // =========================
  
    obtenerMetodo(): string {
      return this.metodo;
    }
  
    obtenerMonto(): number {
      return this.monto;
    }
  
    obtenerMoneda(): string {
      return this.moneda;
    }
  
    obtenerEstado(): string {
      return this.estado;
    }
  
    // =========================
    // COMPORTAMIENTO DEL DOMINIO
    // =========================
  
    private validarMonto(): void {
  
      if (this.monto <= 0) {
        throw new Error(
          'El monto del pago debe ser mayor a cero'
        );
      }
    }
  
    aprobarPago(): void {
  
      if (this.estado === 'APROBADO') {
        throw new Error(
          'El pago ya fue aprobado'
        );
      }
  
      if (this.estado === 'RECHAZADO') {
        throw new Error(
          'No se puede aprobar un pago rechazado'
        );
      }
  
      this.estado = 'APROBADO';
    }
  
    rechazarPago(): void {
  
      if (this.estado === 'APROBADO') {
        throw new Error(
          'No se puede rechazar un pago aprobado'
        );
      }
  
      this.estado = 'RECHAZADO';
    }
  
    estaAprobado(): boolean {
      return this.estado === 'APROBADO';
    }
    
    estaPendiente(): boolean {

      return this.estado === 'PENDIENTE';
    }
  
    esPagoInternacional(monedaLocal: string): boolean {
  
      return this.moneda.toLowerCase()
        !== monedaLocal.toLowerCase();
    }
  
    actualizarMetodoPago(nuevoMetodo: string): void {
  
      if (!nuevoMetodo.trim()) {
        throw new Error(
          'El método de pago es obligatorio'
        );
      }
  
      this.metodo = nuevoMetodo;
    }
  }