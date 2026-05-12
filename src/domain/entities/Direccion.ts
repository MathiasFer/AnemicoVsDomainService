export class Direccion {

    constructor(
      private pais: string,
      private ciudad: string,
      private calle: string,
      private codigoPostal: string,
      private referencia: string,
    ) {
  
      this.validarCamposObligatorios();
    }
  
    // =========================
    // GETTERS
    // =========================
  
    obtenerPais(): string {
      return this.pais;
    }
  
    obtenerCiudad(): string {
      return this.ciudad;
    }
  
    obtenerCalle(): string {
      return this.calle;
    }
  
    obtenerCodigoPostal(): string {
      return this.codigoPostal;
    }
  
    obtenerReferencia(): string {
      return this.referencia;
    }
  
    // =========================
    // COMPORTAMIENTO DEL DOMINIO
    // =========================
  
    private validarCamposObligatorios(): void {
  
      if (!this.pais.trim()) {
        throw new Error('El país es obligatorio');
      }
  
      if (!this.ciudad.trim()) {
        throw new Error('La ciudad es obligatoria');
      }
  
      if (!this.calle.trim()) {
        throw new Error('La calle es obligatoria');
      }
  
      if (!this.codigoPostal.trim()) {
        throw new Error('El código postal es obligatorio');
      }
    }
  
    actualizarReferencia(nuevaReferencia: string): void {
  
      if (!nuevaReferencia.trim()) {
        throw new Error(
          'La referencia no puede estar vacía'
        );
      }
  
      this.referencia = nuevaReferencia;
    }
  
    perteneceAPais(pais: string): boolean {
      return this.pais.toLowerCase() === pais.toLowerCase();
    }
  
    esInternacional(paisLocal: string): boolean {
      return this.pais.toLowerCase() !== paisLocal.toLowerCase();
    }
  
    obtenerDireccionCompleta(): string {
  
      return `
        ${this.calle},
        ${this.ciudad},
        ${this.pais},
        CP: ${this.codigoPostal}
      `;
    }
  }