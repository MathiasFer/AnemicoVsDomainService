"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckoutApplicationService = void 0;
const common_1 = require("@nestjs/common");
class CheckoutApplicationService {
    comprar(usuario, productos, cupon, envio) {
        this.validarDatosDeEntrada(usuario, productos, envio);
        let total = this.calcularTotal(productos);
        total = this.calcularCostoEnvioPorPeso(productos, envio, total);
        total = this.aplicarDescuentoVip(usuario, total);
        total = this.aplicarCuponDescuento(cupon, total);
        this.validarStock(productos);
        this.descontarStock(productos);
        this.validarYDescontarSaldo(usuario, total);
        this.acumularPuntosFidelidad(usuario, total);
        return total;
    }
    calcularTotal(productos) {
        let total = 0;
        for (const producto of productos) {
            total += producto.getPrecio();
        }
        return total;
    }
    calcularCostoEnvioPorPeso(productos, envio, subtotal) {
        let pesoTotal = 0;
        for (const producto of productos) {
            pesoTotal += producto.getPeso();
        }
        let costoEnvio = envio.costo;
        if (pesoTotal > 10) {
            costoEnvio += 15;
        }
        return subtotal + costoEnvio;
    }
    validarDatosDeEntrada(usuario, productos, envio) {
        if (!usuario) {
            throw new common_1.BadRequestException('usuario es obligatorio');
        }
        if (!Array.isArray(productos)) {
            throw new common_1.BadRequestException('productos debe ser un arreglo');
        }
        if (productos.length === 0) {
            throw new common_1.BadRequestException('productos no puede estar vacio');
        }
        if (!envio) {
            throw new common_1.BadRequestException('envio es obligatorio');
        }
    }
    aplicarDescuentoVip(usuario, total) {
        if (usuario.getEsVip()) {
            total = total * 0.9;
        }
        return total;
    }
    aplicarCuponDescuento(cupon, total) {
        if (cupon && cupon.activo) {
            const descuento = total * (cupon.porcentajeDescuento / 100);
            return total - descuento;
        }
        return total;
    }
    validarStock(productos) {
        for (const producto of productos) {
            if (producto.getStock() <= 0) {
                throw new Error(`El producto ${producto.getNombre()} no tiene stock disponible`);
            }
        }
    }
    descontarStock(productos) {
        for (const producto of productos) {
            producto.setStock(producto.getStock() - 1);
        }
    }
    validarYDescontarSaldo(usuario, total) {
        if (usuario.getSaldo() < total) {
            throw new Error('Saldo insuficiente');
        }
        usuario.setSaldo(usuario.getSaldo() - total);
    }
    acumularPuntosFidelidad(usuario, total) {
        if (total > 100) {
            usuario.setPuntosFidelidad(usuario.getPuntosFidelidad() + 10);
        }
    }
}
exports.CheckoutApplicationService = CheckoutApplicationService;
//# sourceMappingURL=CheckoutApplicationService.js.map