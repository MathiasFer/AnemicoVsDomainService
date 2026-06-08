import { DomainException } from '../exceptions/DomainException';

/**
 * Value Object: Dirección.
 * Representa una ubicación física de entrega.
 * Es INMUTABLE: cualquier cambio genera una nueva instancia.
 */
export class Direccion {
  constructor(
    private readonly pais: string,
    private readonly ciudad: string,
    private readonly calle: string,
    private readonly codigoPostal: string,
    private readonly referencia: string,
  ) {
    this.validarCamposObligatorios();
  }

  /// GETTERS

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

  /// COMPORTAMIENTO DEL DOMINIO (INMUTABLE)

  private validarCamposObligatorios(): void {
    if (!this.pais.trim()) {
      throw new DomainException(
        'El país es obligatorio',
        'Direccion',
        'validarCamposObligatorios',
        'VALUE_OBJECT',
        'El objeto de valor Dirección se auto-valida en su constructor. No se puede crear una dirección sin un país válido.',
        'if (!this.pais.trim()) { throw new Error(...); }',
      );
    }

    if (!this.ciudad.trim()) {
      throw new DomainException(
        'La ciudad es obligatoria',
        'Direccion',
        'validarCamposObligatorios',
        'VALUE_OBJECT',
        'La ciudad es un componente obligatorio para poder calcular costos logísticos y de envío.',
        'if (!this.ciudad.trim()) { throw new Error(...); }',
      );
    }

    if (!this.calle.trim()) {
      throw new DomainException(
        'La calle es obligatoria',
        'Direccion',
        'validarCamposObligatorios',
        'VALUE_OBJECT',
        'La calle y número de puerta son indispensables para garantizar la entrega física del paquete.',
        'if (!this.calle.trim()) { throw new Error(...); }',
      );
    }

    if (!this.codigoPostal.trim()) {
      throw new DomainException(
        'El código postal es obligatorio',
        'Direccion',
        'validarCamposObligatorios',
        'VALUE_OBJECT',
        'El código postal es obligatorio para clasificar geográficamente el destino del envío.',
        'if (!this.codigoPostal.trim()) { throw new Error(...); }',
      );
    }
  }

  /**
   * En lugar de mutar, retornamos una nueva instancia.
   */
  cambiarReferencia(nuevaReferencia: string): Direccion {
    if (!nuevaReferencia.trim()) {
      throw new DomainException(
        'La referencia no puede estar vacía',
        'Direccion',
        'cambiarReferencia',
        'VALUE_OBJECT',
        'La referencia de la dirección debe contener indicaciones reales de despacho para el transportista.',
        'if (!nuevaReferencia.trim()) { throw new Error(...); }',
      );
    }

    return new Direccion(
      this.pais,
      this.ciudad,
      this.calle,
      this.codigoPostal,
      nuevaReferencia,
    );
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
