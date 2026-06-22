export class Producto {
    private id: number;
    private nombre: string;
    private precio: number;
    private stock: number;
    private peso: number;
    private categoria: string;

    constructor(
      id: number,
      nombre: string,
      precio: number,
      stock: number,
      peso: number,
      categoria: string,
    ) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.stock = stock;
        this.peso = peso;
        this.categoria = categoria;
    }

    public getId(): number { return this.id; }
    public setId(id: number): void { this.id = id; }

    public getNombre(): string { return this.nombre; }
    public setNombre(nombre: string): void { this.nombre = nombre; }

    public getPrecio(): number { return this.precio; }
    public setPrecio(precio: number): void { this.precio = precio; }

    public getStock(): number { return this.stock; }
    public setStock(stock: number): void { this.stock = stock; }

    public getPeso(): number { return this.peso; }
    public setPeso(peso: number): void { this.peso = peso; }

    public getCategoria(): string { return this.categoria; }
    public setCategoria(categoria: string): void { this.categoria = categoria; }
}