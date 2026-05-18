import type { CheckoutBody, ProductoPayload } from '../types/checkout';

export const PAIS_LOCAL_REF = 'Ecuador';

// Catálogo sincronizado al 100% con los datos precargados en el InMemoryProductoRepository del backend
export const CATALOGO: ProductoPayload[] = [
  {
    id: 101,
    nombre: 'Laptop Gamer',
    precio: 1200.0,
    stock: 5,
    peso: 2.5,
    categoria: 'Tecnologia',
    impuesto: 0.12,
    envioRestringido: false,
  },
  {
    id: 102,
    nombre: 'Mouse Óptico',
    precio: 20.0,
    stock: 0, // Sin stock en base de datos para pruebas didácticas
    peso: 0.1,
    categoria: 'Accesorios',
    impuesto: 0.12,
    envioRestringido: false,
  },
  {
    id: 103,
    nombre: 'Batería de Litio',
    precio: 80.0,
    stock: 10,
    peso: 1.2,
    categoria: 'Energia',
    impuesto: 0.12,
    envioRestringido: true, // Restringido para provocar error de logística
  },
];

export interface TotalesEstimadosUsd {
  subtotal: number;
  descuento: number;
  costoEnvio: number;
  total: number;
}

export function calcularTotalesUsd(
  cartQty: Record<number, number>,
  esVip: boolean,
  cupon: {
    activo: boolean;
    porcentajeDescuento: number;
    montoMinimo: number;
  },
  pais: string,
): TotalesEstimadosUsd {
  let subtotal = 0;
  let pesoTotal = 0;

  for (const prod of CATALOGO) {
    const qty = cartQty[prod.id] ?? 0;
    if (qty > 0) {
      subtotal += prod.precio * qty;
      pesoTotal += prod.peso * qty;
    }
  }

  // Descuento VIP
  let descuento = 0;
  if (esVip) {
    descuento += subtotal * 0.10;
  }

  // Descuento Cupón
  if (cupon.activo && subtotal >= cupon.montoMinimo) {
    descuento += (subtotal * cupon.porcentajeDescuento) / 100;
  }

  // Costo Envió (Servicio del Dominio)
  let costoEnvio = 0;
  if (subtotal > 0) {
    costoEnvio = 5; // Tarifa base
    costoEnvio += pesoTotal * 0.5; // Por peso

    // Envío internacional
    if (pais.trim().toLowerCase() !== PAIS_LOCAL_REF.toLowerCase()) {
      costoEnvio += 15;
    }

    // Prioridad por defecto
    costoEnvio += 10;
  }

  const total = Math.max(0, subtotal - descuento + costoEnvio);

  return { subtotal, descuento, costoEnvio, total };
}

export function construirCheckoutBody(params: {
  usuarioId: number;
  cartQty: Record<number, number>;
  direccion: any;
  pagoMetodo: string;
  pagoMoneda: string;
  cupon: any;
}): CheckoutBody {
  const { usuarioId, cartQty, direccion, pagoMetodo, pagoMoneda, cupon } = params;

  const productos = Object.entries(cartQty)
    .filter(([_, qty]) => qty > 0)
    .map(([idStr, qty]) => ({
      id: Number(idStr),
      cantidad: qty,
    }));

  return {
    usuarioId,
    productos,
    direccion: {
      pais: direccion.pais,
      ciudad: direccion.ciudad,
      calle: direccion.calle,
      codigoPostal: direccion.codigoPostal,
      referencia: direccion.referencia,
    },
    pago: {
      metodo: pagoMetodo,
      moneda: pagoMoneda,
    },
    cupon: cupon.activo ? {
      codigo: cupon.codigo,
      porcentajeDescuento: cupon.porcentajeDescuento,
      activo: cupon.activo,
      montoMinimo: cupon.montoMinimo,
    } : null,
  };
}
