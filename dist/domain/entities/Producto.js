"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Producto = void 0;
class Producto {
    id;
    nombre;
    precio;
    stock;
    peso;
    categoria;
    constructor(id, nombre, precio, stock, peso, categoria) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.stock = stock;
        this.peso = peso;
        this.categoria = categoria;
    }
    getId() { return this.id; }
    setId(id) { this.id = id; }
    getNombre() { return this.nombre; }
    setNombre(nombre) { this.nombre = nombre; }
    getPrecio() { return this.precio; }
    setPrecio(precio) { this.precio = precio; }
    getStock() { return this.stock; }
    setStock(stock) { this.stock = stock; }
    getPeso() { return this.peso; }
    setPeso(peso) { this.peso = peso; }
    getCategoria() { return this.categoria; }
    setCategoria(categoria) { this.categoria = categoria; }
}
exports.Producto = Producto;
//# sourceMappingURL=Producto.js.map