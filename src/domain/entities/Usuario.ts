export class Usuario {
    constructor(
      public id: number,
      public nombre: string,
      public saldo: number,
      public puntosFidelidad: number,
      public esVip: boolean,
    ) {}
  }