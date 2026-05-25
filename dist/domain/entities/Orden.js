"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orden = void 0;
class Orden {
    id;
    usuario;
    productos;
    total;
    estado;
    constructor(id, usuario, productos, total, estado) {
        this.id = id;
        this.usuario = usuario;
        this.productos = productos;
        this.total = total;
        this.estado = estado;
    }
}
exports.Orden = Orden;
//# sourceMappingURL=Orden.js.map