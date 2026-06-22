export class Usuario {
    private id: number;
    private nombre: string;
    private saldo: number;
    private puntosFidelidad: number;
    private esVip: boolean;

    constructor(
      id: number,
      nombre: string,
      saldo: number,
      puntosFidelidad: number,
      esVip: boolean,
    ) {
        this.id = id;
        this.nombre = nombre;
        this.saldo = saldo;
        this.puntosFidelidad = puntosFidelidad;
        this.esVip = esVip;
    }

    public getId(): number { return this.id; }
    public setId(id: number): void { this.id = id; }

    public getNombre(): string { return this.nombre; }
    public setNombre(nombre: string): void { this.nombre = nombre; }

    public getSaldo(): number { return this.saldo; }
    public setSaldo(saldo: number): void { this.saldo = saldo; }

    public getPuntosFidelidad(): number { return this.puntosFidelidad; }
    public setPuntosFidelidad(puntosFidelidad: number): void { this.puntosFidelidad = puntosFidelidad; }

    public getEsVip(): boolean { return this.esVip; }
    public setEsVip(esVip: boolean): void { this.esVip = esVip; }
}