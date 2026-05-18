import { Controller, Get, Put, Post, Body, Param, Inject } from '@nestjs/common';
import type { IUsuarioRepository } from '../../domain/interfaces/IUsuarioRepository';
import type { IProductoRepository } from '../../domain/interfaces/IProductoRepository';

@Controller('system')
export class SystemController {
  constructor(
    @Inject('IUsuarioRepository')
    private usuarioRepository: IUsuarioRepository,

    @Inject('IProductoRepository')
    private productoRepository: IProductoRepository,
  ) {}

  @Get('usuarios')
  async getUsuarios() {
    const list = await this.usuarioRepository.obtenerTodos();
    return list.map(u => ({
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      saldo: u.obtenerSaldo(),
      esVip: u.esUsuarioVip(),
      nivelRiesgo: u.obtenerNivelRiesgo(),
      monedaPreferida: u.obtenerMonedaPreferida(),
    }));
  }

  @Get('productos')
  async getProductos() {
    const list = await this.productoRepository.obtenerTodos();
    return list.map(p => ({
      id: p.id,
      nombre: p.nombre,
      precio: p.obtenerPrecio(),
      stock: p.obtenerStock(),
      peso: p.obtenerPeso(),
      categoria: p.obtenerCategoria(),
      impuesto: p.obtenerImpuesto(),
      envioRestringido: p.tieneEnvioRestringido(),
    }));
  }

  @Put('usuarios/:id')
  async updateUsuario(
    @Param('id') id: string,
    @Body() body: { nombre?: string; saldo?: number; esVip?: boolean; nivelRiesgo?: number; monedaPreferida?: string }
  ) {
    const u = await this.usuarioRepository.obtenerPorId(Number(id));
    if (!u) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    if (body.nombre !== undefined) u.nombre = body.nombre;
    if (body.saldo !== undefined) u.establecerSaldo(Number(body.saldo));
    if (body.esVip !== undefined) u.establecerEstadoVip(Boolean(body.esVip));
    if (body.nivelRiesgo !== undefined) u.actualizarNivelRiesgo(Number(body.nivelRiesgo));
    if (body.monedaPreferida !== undefined) u.actualizarMonedaPreferida(body.monedaPreferida);

    await this.usuarioRepository.guardar(u);
    return {
      success: true,
      usuario: {
        id: u.id,
        nombre: u.nombre,
        email: u.email,
        saldo: u.obtenerSaldo(),
        esVip: u.esUsuarioVip(),
        nivelRiesgo: u.obtenerNivelRiesgo(),
        monedaPreferida: u.obtenerMonedaPreferida(),
      }
    };
  }

  @Post('reset')
  async reset() {
    if (typeof (this.usuarioRepository as any).reset === 'function') {
      (this.usuarioRepository as any).reset();
    }
    if (typeof (this.productoRepository as any).reset === 'function') {
      (this.productoRepository as any).reset();
    }
    return { success: true, message: 'Base de datos en memoria reiniciada exitosamente' };
  }
}
