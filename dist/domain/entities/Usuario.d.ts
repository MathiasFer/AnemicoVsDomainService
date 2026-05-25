export declare class Usuario {
    private id;
    private nombre;
    private saldo;
    private puntosFidelidad;
    private esVip;
    constructor(id: number, nombre: string, saldo: number, puntosFidelidad: number, esVip: boolean);
    getId(): number;
    setId(id: number): void;
    getNombre(): string;
    setNombre(nombre: string): void;
    getSaldo(): number;
    setSaldo(saldo: number): void;
    getPuntosFidelidad(): number;
    setPuntosFidelidad(puntosFidelidad: number): void;
    getEsVip(): boolean;
    setEsVip(esVip: boolean): void;
}
