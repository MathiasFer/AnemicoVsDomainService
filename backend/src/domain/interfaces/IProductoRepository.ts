import { Producto } from '../entities/Producto';

export interface IProductoRepository {
  obtenerTodos(): Promise<Producto[]>;
  obtenerPorId(id: number): Promise<Producto | null>;
  guardar(producto: Producto): Promise<void>;
}
