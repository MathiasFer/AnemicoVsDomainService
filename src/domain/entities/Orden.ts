import { Producto } from './Producto';
import { Usuario } from './Usuario';

export class Orden {
  constructor(
    public id: number,
    public usuario: Usuario,
    public productos: Producto[],
    public total: number,
    public estado: string,
  ) {}
}