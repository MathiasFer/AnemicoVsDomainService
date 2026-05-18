import { DomainException } from '../exceptions/DomainException';

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
      throw new DomainException(
        'El país es obligatorio',
        'Direccion',
        'validarCamposObligatorios',
        'VALUE_OBJECT',
        'El objeto de valor Dirección se auto-valida en su constructor. No se puede crear una dirección sin un país válido.',
        "if (!this.pais.trim()) { throw new Error(...); }"
      );
    }

    if (!this.ciudad.trim()) {
      throw new DomainException(
        'La ciudad es obligatoria',
        'Direccion',
        'validarCamposObligatorios',
        'VALUE_OBJECT',
        'La ciudad es un componente obligatorio para poder calcular costos logísticos y de envío.',
        "if (!this.ciudad.trim()) { throw new Error(...); }"
      );
    }

    if (!this.calle.trim()) {
      throw new DomainException(
        'La calle es obligatoria',
        'Direccion',
        'validarCamposObligatorios',
        'VALUE_OBJECT',
        'La calle y número de puerta son indispensables para garantizar la entrega física del paquete.',
        "if (!this.calle.trim()) { throw new Error(...); }"
      );
    }

    if (!this.codigoPostal.trim()) {
      throw new DomainException(
        'El código postal es obligatorio',
        'Direccion',
        'validarCamposObligatorios',
        'VALUE_OBJECT',
        'El código postal es obligatorio para clasificar geográficamente el destino del envío.',
        "if (!this.codigoPostal.trim()) { throw new Error(...); }"
      );
    }
  }

  actualizarReferencia(nuevaReferencia: string): void {
    if (!nuevaReferencia.trim()) {
      throw new DomainException(
        'La referencia no puede estar vacía',
        'Direccion',
        'actualizarReferencia',
        'VALUE_OBJECT',
        'La referencia de la dirección debe contener indicaciones reales de despacho para el transportista.',
        "if (!nuevaReferencia.trim()) { throw new Error(...); }"
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
    return `${this.calle}, ${this.ciudad}, ${this.pais}, CP: ${this.codigoPostal}`;
  }
}