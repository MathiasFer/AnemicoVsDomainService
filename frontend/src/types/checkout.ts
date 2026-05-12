export interface ProductoPayload {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  peso: number;
  categoria: string;
  impuesto: number;
  envioRestringido: boolean;
}

export interface CheckoutUsuarioPayload {
  id: number;
  nombre: string;
  email: string;
  saldo: number;
  esVip: boolean;
  nivelRiesgo: number;
  monedaPreferida: string;
}

export interface CheckoutBody {
  usuario: CheckoutUsuarioPayload;
  productos: ProductoPayload[];
  direccion: {
    pais: string;
    ciudad: string;
    calle: string;
    codigoPostal: string;
    referencia: string;
  };
  pago: {
    metodo: string;
    monto: number;
    moneda: string;
  };
  cupon: {
    codigo: string;
    porcentajeDescuento: number;
    activo: boolean;
    montoMinimo: number;
  };
}

export interface CheckoutSuccessResponse {
  mensaje: string;
  resumenCompra: {
    subtotal: number;
    descuento: number;
    costoEnvio: number;
    totalFinal: number;
    moneda: string;
  };
  pago: {
    estado: string;
    metodo: string;
  };
  cliente: {
    nombre: string;
    esVip: boolean;
  };
}

export interface NestErrorBody {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}
