"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Usuario = void 0;
class Usuario {
    id;
    nombre;
    saldo;
    puntosFidelidad;
    esVip;
    constructor(id, nombre, saldo, puntosFidelidad, esVip) {
        this.id = id;
        this.nombre = nombre;
        this.saldo = saldo;
        this.puntosFidelidad = puntosFidelidad;
        this.esVip = esVip;
    }
    getId() { return this.id; }
    setId(id) { this.id = id; }
    getNombre() { return this.nombre; }
    setNombre(nombre) { this.nombre = nombre; }
    getSaldo() { return this.saldo; }
    setSaldo(saldo) { this.saldo = saldo; }
    getPuntosFidelidad() { return this.puntosFidelidad; }
    setPuntosFidelidad(puntosFidelidad) { this.puntosFidelidad = puntosFidelidad; }
    getEsVip() { return this.esVip; }
    setEsVip(esVip) { this.esVip = esVip; }
}
exports.Usuario = Usuario;
//# sourceMappingURL=Usuario.js.map