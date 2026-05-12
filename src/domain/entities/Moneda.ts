export class Moneda {

    constructor(
      private codigo: string,
      private simbolo: string,
      private tasaCambio: number,
    ) {
  
      this.validarTasaCambio();
    }
  
    // GETTERS

  
    obtenerCodigo(): string {
      return this.codigo;
    }
  
    obtenerSimbolo(): string {
      return this.simbolo;
    }
  
    obtenerTasaCambio(): number {
      return this.tasaCambio;
    }
  
    // COMPORTAMIENTO DEL DOMINIO
  
    private validarTasaCambio(): void {
  
      if (this.tasaCambio <= 0) {
        throw new Error(
          'La tasa de cambio debe ser mayor a cero'
        );
      }
    }
  
    actualizarTasaCambio(
      nuevaTasa: number
    ): void {
  
      if (nuevaTasa <= 0) {
        throw new Error(
          'La nueva tasa de cambio es inválida'
        );
      }
  
      this.tasaCambio = nuevaTasa;
    }
  
    convertirMonto(
      monto: number
    ): number {
  
      if (monto <= 0) {
        throw new Error(
          'El monto debe ser mayor a cero'
        );
      }
  
      return monto * this.tasaCambio;
    }
  
    esDolar(): boolean {
      return this.codigo === 'USD';
    }
  }