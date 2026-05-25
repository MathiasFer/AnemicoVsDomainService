import { Injectable } from '@nestjs/common';
import { IProductoRepository } from '../../domain/interfaces/IProductoRepository';
import { Producto } from '../../domain/entities/Producto';

@Injectable()
export class InMemoryProductoRepository implements IProductoRepository {
  private productos: Map<number, Producto> = new Map();

  constructor() {
    this.precargarDatos();
  }

  private precargarDatos() {
    // 101. Producto Normal con Stock
    this.productos.set(
      101,
      new Producto(
        101,
        'Laptop Gamer',
        1200,
        5,
        2.5,
        'Tecnologia',
        0.12,
        false,
      ),
    );
    // 102. Producto Sin Stock (para forzar error de stock insuficiente)
    this.productos.set(
      102,
      new Producto(102, 'Mouse Óptico', 20, 0, 0.1, 'Accesorios', 0.12, false),
    );
    // 103. Producto Restringido (para forzar error en CalculadorEnvioService)
    this.productos.set(
      103,
      new Producto(103, 'Batería de Litio', 80, 10, 1.2, 'Energia', 0.12, true),
    );
  }

  reset() {
    this.productos.clear();
    this.precargarDatos();
  }

  async obtenerTodos(): Promise<Producto[]> {
    await Promise.resolve();
    return Array.from(this.productos.values()).map(
      (p) =>
        new Producto(
          p.id,
          p.nombre,
          p.obtenerPrecio(),
          p.obtenerStock(),
          p.obtenerPeso(),
          p.obtenerCategoria(),
          p.obtenerImpuesto(),
          p.tieneEnvioRestringido(),
        ),
    );
  }

  async obtenerPorId(id: number): Promise<Producto | null> {
    await Promise.resolve();
    const p = this.productos.get(Number(id));
    if (!p) return null;
    return new Producto(
      p.id,
      p.nombre,
      p.obtenerPrecio(),
      p.obtenerStock(),
      p.obtenerPeso(),
      p.obtenerCategoria(),
      p.obtenerImpuesto(),
      p.tieneEnvioRestringido(),
    );
  }

  async guardar(producto: Producto): Promise<void> {
    await Promise.resolve();
    this.productos.set(producto.id, producto);
  }
}
