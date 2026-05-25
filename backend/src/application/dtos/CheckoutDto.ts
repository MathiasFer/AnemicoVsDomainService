export interface CheckoutDireccionDto {
  pais: string;
  ciudad: string;
  calle: string;
  codigoPostal: string;
  referencia: string;
}

export interface CheckoutPagoDto {
  metodo: string;
  moneda: string;
}

export interface CheckoutCuponDto {
  codigo: string;
  porcentajeDescuento: number;
  activo: boolean;
  montoMinimo: number;
}

export interface CheckoutProductoDto {
  id: number;
  cantidad: number;
}

export interface CheckoutRequestDto {
  usuarioId: number;
  productos: CheckoutProductoDto[];
  direccion: CheckoutDireccionDto;
  pago: CheckoutPagoDto;
  cupon: CheckoutCuponDto | null;
}
