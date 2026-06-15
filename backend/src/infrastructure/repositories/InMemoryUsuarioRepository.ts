import { Injectable } from '@nestjs/common';
import { IUsuarioRepository } from '../../domain/interfaces/IUsuarioRepository';
import { Usuario } from '../../domain/entities/Usuario';

@Injectable()
export class InMemoryUsuarioRepository implements IUsuarioRepository {
  private usuarios: Map<number, Usuario> = new Map();

  constructor() {
    this.precargarDatos();
  }

  private precargarDatos() {
    // 1. Usuario Normal con saldo
    this.usuarios.set(
      1,
      new Usuario(1, 'Juan Pérez', 'juan@test.com', 1000, false, 10, 'USD'),
    );
    // 2. Usuario VIP con saldo
    this.usuarios.set(
      2,
      new Usuario(
        2,
        'María López (VIP)',
        'maria@test.com',
        500,
        true,
        15,
        'USD',
      ),
    );
    // 3. Usuario sin saldo (para forzar error de saldo insuficiente)
    this.usuarios.set(
      3,
      new Usuario(
        3,
        'Carlos Ruiz (Sin Saldo)',
        'carlos@test.com',
        0,
        false,
        20,
        'USD',
      ),
    );
    // 4. Usuario Sospechoso (para forzar error de nivel de riesgo en ValidadorFraudeService)
    this.usuarios.set(
      4,
      new Usuario(
        4,
        'Pedro Gómez (Alto Riesgo)',
        'pedro@test.com',
        2000,
        false,
        90,
        'USD',
      ),
    );
  }

  reset() {
    this.usuarios.clear();
    this.precargarDatos();
  }

  async obtenerTodos(): Promise<Usuario[]> {
    await Promise.resolve();
    return Array.from(this.usuarios.values()).map(
      (u) =>
        new Usuario(
          u.obtenerId(),
          u.obtenerNombre(),
          u.obtenerEmail(),
          u.obtenerSaldo(),
          u.esUsuarioVip(),
          u.obtenerNivelRiesgo(),
          u.obtenerMonedaPreferida(),
        ),
    );
  }

  async obtenerPorId(id: number): Promise<Usuario | null> {
    await Promise.resolve();
    const u = this.usuarios.get(Number(id));
    if (!u) return null;
    return new Usuario(
      u.obtenerId(),
      u.obtenerNombre(),
      u.obtenerEmail(),
      u.obtenerSaldo(),
      u.esUsuarioVip(),
      u.obtenerNivelRiesgo(),
      u.obtenerMonedaPreferida(),
    );
  }

  async guardar(usuario: Usuario): Promise<void> {
    await Promise.resolve();
    this.usuarios.set(usuario.obtenerId(), usuario);
  }
}
