import { DomainException } from '../exceptions/DomainException';

export class Direccion {
  constructor(
    private readonly pais: string,
    private readonly ciudad: string,
    private readonly calle: string,
    private readonly codigoPostal: string,
    private readonly referencia: string,
  ) {
    this.validarCampos();
  }

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

  private validarCampos(): void {
    if (
      !this.pais.trim() ||
      !this.ciudad.trim() ||
      !this.calle.trim() ||
      !this.codigoPostal.trim()
    ) {
      throw new DomainException(
        'Campos obligatorios faltantes',
        'Direccion',
        'constructor',
        'VALUE_OBJECT',
        'Dirección incompleta.',
        '',
      );
    }
  }

  cambiarReferencia(nueva: string): Direccion {
    if (!nueva.trim())
      throw new DomainException(
        'Referencia vacía',
        'Direccion',
        'cambiarReferencia',
        'VALUE_OBJECT',
        'Requiere contenido.',
        '',
      );
    return new Direccion(
      this.pais,
      this.ciudad,
      this.calle,
      this.codigoPostal,
      nueva,
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
