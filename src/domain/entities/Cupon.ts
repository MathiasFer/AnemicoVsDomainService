export class Cupon {
    constructor(
      public codigo: string,
      public porcentajeDescuento: number,
      public activo: boolean,
    ) {}
  }