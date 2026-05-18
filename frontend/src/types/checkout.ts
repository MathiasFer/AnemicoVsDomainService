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
  usuarioId: number;
  productos: Array<{
    id: number;
    cantidad: number;
  }>;
  direccion: {
    pais: string;
    ciudad: string;
    calle: string;
    codigoPostal: string;
    referencia: string;
  };
  pago: {
    metodo: string;
    moneda: string;
  };
  cupon: {
    codigo: string;
    porcentajeDescuento: number;
    activo: boolean;
    montoMinimo: number;
  } | null;
}

export interface PedagogicalStep {
  step: number;
  type: 'ENTITY' | 'DOMAIN_SERVICE';
  source: string;
  method: string;
  detail: string;
}

export interface CheckoutSuccessResponse {
  success: true;
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
    saldoRestante: number;
    esVip: boolean;
  };
  pedagogicalTrace: PedagogicalStep[];
}

export interface PedagogicalErrorTrace {
  type: 'ENTITY' | 'DOMAIN_SERVICE' | 'VALUE_OBJECT';
  source: string;
  method: string;
  explanation: string;
  codeSnippet: string;
}

export interface CheckoutErrorResponse {
  success: false;
  error: string;
  pedagogicalTrace: PedagogicalErrorTrace;
}
