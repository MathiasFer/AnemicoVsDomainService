import { Usuario } from '../entities/Usuario';

export interface IUsuarioRepository {
  obtenerTodos(): Promise<Usuario[]>;
  obtenerPorId(id: number): Promise<Usuario | null>;
  guardar(usuario: Usuario): Promise<void>;
}
