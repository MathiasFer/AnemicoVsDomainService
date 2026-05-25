import { Producto } from './Producto';
import { Usuario } from './Usuario';
export declare class Orden {
    id: number;
    usuario: Usuario;
    productos: Producto[];
    total: number;
    estado: string;
    constructor(id: number, usuario: Usuario, productos: Producto[], total: number, estado: string);
}
