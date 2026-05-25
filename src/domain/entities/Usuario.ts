export class Usuario {
    // MODELO ANÉMICO: Entidad "tonta" (bolsa de datos). 
    // Sus propiedades están expuestas públicamente, permitiendo 
    // que cualquier servicio externo modifique su saldo o estado a su antojo.
    constructor(
      public id: number,
      public nombre: string,
      public saldo: number,
      public puntosFidelidad: number,
      public esVip: boolean,
    ) {}
  }