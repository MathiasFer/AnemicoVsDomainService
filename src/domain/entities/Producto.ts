export class Producto {
    // MODELO ANÉMICO: Entidad "tonta" (bolsa de datos). 
    // Solo contiene atributos públicos. No tiene métodos ni encapsulamiento 
    // para proteger sus invariantes (ej. evitar que el stock sea negativo).
    constructor(
      public id: number,
      public nombre: string,
      public precio: number,
      public stock: number,
      public peso: number,
      public categoria: string,
    ) {}
  }