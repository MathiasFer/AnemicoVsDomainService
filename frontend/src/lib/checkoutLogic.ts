import type { CheckoutBody, CheckoutUsuarioPayload, ProductoPayload } from '../types/checkout';

export const PAIS_LOCAL_REF = 'Ecuador';

export const CATALOGO: ProductoPayload[] = [
  {
    id: 1,
    nombre: 'Laptop Gamer',
    precio: 1299.99,
    stock: 12,
    peso: 2.4,
    categoria: 'Hardware',
    impuesto: 0,
    envioRestringido: false,
  },
  {
    id: 2,
    nombre: 'Mouse RGB',
    precio: 49.99,
    stock: 80,
    peso: 0.15,
    categoria: 'Periféricos',
    impuesto: 0,
    envioRestringido: false,
  },
  {
    id: 3,
    nombre: 'Teclado Mecánico',
    precio: 139.99,
    stock: 40,
    peso: 0.95,
    categoria: 'Periféricos',
    impuesto: 0,
    envioRestringido: false,
  },
];

export function expandirCarrito(
  cantidades: Record<number, number>,
  catalogo: ProductoPayload[],
): ProductoPayload[] {
  const porId = new Map(catalogo.map((p) => [p.id, p]));
  const lineas: ProductoPayload[] = [];

  for (const [idStr, qty] of Object.entries(cantidades)) {
    const id = Number(idStr);
    const base = porId.get(id);
    if (!base || qty <= 0) continue;
    const n = Math.min(qty, 99);
    for (let i = 0; i < n; i++) {
      lineas.push({ ...base });
    }
  }

  return lineas;
}

/** Replica CalculadorDescuentoService + Cupon del dominio (subtotal en USD). */
export function calcularDescuentoUsd(
  subtotal: number,
  esVip: boolean,
  cupon: {
    activo: boolean;
    porcentajeDescuento: number;
    montoMinimo: number;
  },
): number {
  let descuento = 0;

  if (esVip) {
    descuento += subtotal * 0.1;
  }

  const cuponAplica =
    cupon.activo && subtotal >= cupon.montoMinimo;

  if (cuponAplica) {
    descuento += (subtotal * cupon.porcentajeDescuento) / 100;
  }

  return descuento;
}

/** Replica CalculadorEnvioService con prioridad=true como en CheckoutApplicationService. */
export function calcularCostoEnvioUsd(
  lineas: ProductoPayload[],
  pais: string,
  prioridad = true,
): number {
  let costoEnvio = 5;

  const pesoTotal = lineas.reduce((acc, p) => acc + p.peso, 0);
  costoEnvio += pesoTotal * 0.5;

  if (pais.trim().toLowerCase() !== PAIS_LOCAL_REF.toLowerCase()) {
    costoEnvio += 15;
  }

  if (prioridad) {
    costoEnvio += 10;
  }

  for (const producto of lineas) {
    if (producto.envioRestringido) {
      throw new Error(
        `El producto ${producto.nombre} tiene restricciones de envío`,
      );
    }
  }

  return costoEnvio;
}

export function calcularSubtotalUsd(lineas: ProductoPayload[]): number {
  return lineas.reduce((acc, p) => acc + p.precio, 0);
}

/** Misma fuente de tasas que ExchangeRateApiProvider (USD base). */
export async function obtenerTasaUsdA(moneda: string): Promise<number> {
  if (moneda === 'USD') {
    return 1;
  }

  const res = await fetch(
    'https://api.exchangerate-api.com/v4/latest/USD',
  );

  if (!res.ok) {
    throw new Error('Error obteniendo tasa de cambio');
  }

  const data = (await res.json()) as { rates?: Record<string, number> };
  const tasa = data.rates?.[moneda];

  if (typeof tasa !== 'number') {
    throw new Error('No se encontró tasa de cambio');
  }

  return tasa;
}

export interface TotalesEstimadosUsd {
  subtotal: number;
  descuento: number;
  costoEnvio: number;
  total: number;
}

export function calcularTotalesUsd(
  lineas: ProductoPayload[],
  esVip: boolean,
  cupon: CheckoutBody['cupon'],
  pais: string,
): TotalesEstimadosUsd {
  const subtotal = calcularSubtotalUsd(lineas);
  const descuento = calcularDescuentoUsd(subtotal, esVip, cupon);
  const costoEnvio = calcularCostoEnvioUsd(lineas, pais);
  const total = subtotal - descuento + costoEnvio;

  return { subtotal, descuento, costoEnvio, total };
}

export async function construirCheckoutBody(params: {
  usuario: CheckoutUsuarioPayload;
  direccion: CheckoutBody['direccion'];
  cupon: CheckoutBody['cupon'];
  lineas: ProductoPayload[];
  pagoMetodo: string;
  pagoMoneda: string;
}): Promise<CheckoutBody> {
  const { lineas, usuario, direccion, cupon, pagoMetodo, pagoMoneda } =
    params;

  const totales = calcularTotalesUsd(
    lineas,
    usuario.esVip,
    cupon,
    direccion.pais,
  );

  if (totales.total <= 0) {
    throw new Error('El total debe ser mayor a cero');
  }

  const tasa = await obtenerTasaUsdA(pagoMoneda);
  const monto = totales.total * tasa;

  return {
    usuario,
    productos: lineas,
    direccion,
    cupon,
    pago: {
      metodo: pagoMetodo,
      monto,
      moneda: pagoMoneda,
    },
  };
}

export function mensajeErrorNest(body: unknown): string {
  const b = body as {
    message?: string | string[];
  };

  if (Array.isArray(b.message)) {
    return b.message.join(', ');
  }

  if (typeof b.message === 'string') {
    return b.message;
  }

  return 'Error desconocido al procesar la compra';
}
