export declare class Producto {
    private id;
    private nombre;
    private precio;
    private stock;
    private peso;
    private categoria;
    constructor(id: number, nombre: string, precio: number, stock: number, peso: number, categoria: string);
    getId(): number;
    setId(id: number): void;
    getNombre(): string;
    setNombre(nombre: string): void;
    getPrecio(): number;
    setPrecio(precio: number): void;
    getStock(): number;
    setStock(stock: number): void;
    getPeso(): number;
    setPeso(peso: number): void;
    getCategoria(): string;
    setCategoria(categoria: string): void;
}
