import {
  AlertTriangle,
  ArrowRight,
  Box,
  Building2,
  CheckCircle2,
  ChevronRight,
  Coins,
  Cpu,
  CreditCard,
  Layers,
  Loader2,
  MapPin,
  Package,
  Server,
  Shield,
  Sparkles,
  Ticket,
  User,
  Wallet,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  CATALOGO,
  PAIS_LOCAL_REF,
  calcularTotalesUsd,
  construirCheckoutBody,
  expandirCarrito,
  mensajeErrorNest,
} from './lib/checkoutLogic';
import type {
  CheckoutBody,
  CheckoutSuccessResponse,
  CheckoutUsuarioPayload,
} from './types/checkout';

const API_CHECKOUT = 'http://localhost:3000/checkout';

const METODOS_PAGO = [
  { value: 'TARJETA', label: 'Tarjeta' },
  { value: 'TRANSFERENCIA', label: 'Transferencia' },
  { value: 'PAYPAL', label: 'PayPal' },
] as const;

const MONEDAS = [
  { value: 'USD', label: 'USD — Dólar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'COP', label: 'COP — Peso colombiano' },
] as const;

const initialUsuario: CheckoutUsuarioPayload = {
  id: 1,
  nombre: 'Ana Domínguez',
  email: 'ana.dominguez@estudio.dev',
  saldo: 8000,
  esVip: false,
  nivelRiesgo: 35,
  monedaPreferida: 'USD',
};

function formatMoney(value: number, moneda: string): string {
  try {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: moneda === 'COP' ? 'COP' : moneda,
      maximumFractionDigits: moneda === 'COP' ? 0 : 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${moneda}`;
  }
}

export default function App() {
  const [usuario, setUsuario] = useState<CheckoutUsuarioPayload>(initialUsuario);
  const [direccion, setDireccion] = useState({
    pais: PAIS_LOCAL_REF,
    ciudad: 'Quito',
    calle: 'Av. Amazonas N34-120',
    codigoPostal: '170135',
    referencia: 'Edificio central, oficina 402',
  });
  const [pagoMetodo, setPagoMetodo] = useState<string>('TARJETA');
  const [pagoMoneda, setPagoMoneda] = useState<string>('USD');
  const [cupon, setCupon] = useState<CheckoutBody['cupon']>({
    codigo: 'DDD-2026',
    porcentajeDescuento: 8,
    activo: true,
    montoMinimo: 200,
  });

  const [cartQty, setCartQty] = useState<Record<number, number>>({
    1: 1,
    2: 1,
    3: 0,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<CheckoutSuccessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lineasPreview = useMemo(
    () => expandirCarrito(cartQty, CATALOGO),
    [cartQty],
  );

  const estimadoUsd = useMemo(() => {
    try {
      return calcularTotalesUsd(
        lineasPreview,
        usuario.esVip,
        cupon,
        direccion.pais,
      );
    } catch {
      return null;
    }
  }, [lineasPreview, usuario.esVip, cupon, direccion.pais]);

  async function procesarCompra() {
    setError(null);
    setSuccess(null);

    const lineas = expandirCarrito(cartQty, CATALOGO);
    if (lineas.length === 0) {
      setError('Agrega al menos un producto al carrito.');
      return;
    }

    if (
      !usuario.nombre.trim() ||
      !usuario.email.trim() ||
      !direccion.pais.trim() ||
      !direccion.ciudad.trim() ||
      !direccion.calle.trim() ||
      !direccion.codigoPostal.trim() ||
      !direccion.referencia.trim()
    ) {
      setError('Completa usuario y dirección (todos los campos son obligatorios en dominio).');
      return;
    }

    setLoading(true);

    try {
      const body = await construirCheckoutBody({
        usuario,
        direccion,
        cupon,
        lineas,
        pagoMetodo,
        pagoMoneda,
      });

      const res = await fetch(API_CHECKOUT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json: unknown = await res.json().catch(() => null);

      if (!res.ok) {
        setError(mensajeErrorNest(json));
        return;
      }

      setSuccess(json as CheckoutSuccessResponse);
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : 'No se pudo completar la solicitud.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/90">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
              Laboratorio · Commerce kernel
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Checkout orientado a dominio
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Flujo académico que serializa entidades y delega reglas a domain
              services vía{' '}
              <span className="font-mono text-xs text-indigo-700">
                POST /checkout
              </span>
              . Sin catálogo comercial: foco en comportamiento de negocio.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <Shield className="h-5 w-5 text-indigo-600" aria-hidden />
            <div className="text-left">
              <p className="text-xs font-medium text-slate-500">Backend</p>
              <p className="font-mono text-sm text-slate-800">
                localhost:3000
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {/* Usuario */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
              <div className="mb-5 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                  <User className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Información del usuario
                  </h2>
                  <p className="text-xs text-slate-500">
                    Entidad <span className="font-mono">Usuario</span>
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">
                    Nombre
                  </span>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm outline-none ring-indigo-500/0 transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/15"
                    value={usuario.nombre}
                    onChange={(e) =>
                      setUsuario({ ...usuario, nombre: e.target.value })
                    }
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">
                    Email
                  </span>
                  <input
                    type="email"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/15"
                    value={usuario.email}
                    onChange={(e) =>
                      setUsuario({ ...usuario, email: e.target.value })
                    }
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">
                    Saldo (en moneda de pago)
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/15"
                    value={usuario.saldo}
                    onChange={(e) =>
                      setUsuario({
                        ...usuario,
                        saldo: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/40 px-3 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    checked={usuario.esVip}
                    onChange={(e) =>
                      setUsuario({ ...usuario, esVip: e.target.checked })
                    }
                  />
                  <div>
                    <span className="text-sm font-medium text-slate-800">
                      Usuario VIP
                    </span>
                    <p className="text-xs text-slate-500">
                      Activa descuento de dominio (+10% sobre subtotal).
                    </p>
                  </div>
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">
                    Nivel de riesgo (0–100)
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/15"
                    value={usuario.nivelRiesgo}
                    onChange={(e) =>
                      setUsuario({
                        ...usuario,
                        nivelRiesgo: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">
                    Moneda preferida
                  </span>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/15"
                    value={usuario.monedaPreferida}
                    onChange={(e) =>
                      setUsuario({
                        ...usuario,
                        monedaPreferida: e.target.value,
                      })
                    }
                  >
                    {MONEDAS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </section>

            {/* Productos */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
              <div className="mb-5 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                  <Package className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Catálogo demo
                  </h2>
                  <p className="text-xs text-slate-500">
                    Entidad <span className="font-mono">Producto</span> · líneas
                    repetidas en JSON = unidades
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {CATALOGO.map((p) => (
                  <article
                    key={p.id}
                    className="flex flex-col rounded-xl border border-slate-100 bg-slate-50/40 p-4"
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-900">
                        {p.nombre}
                      </h3>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 ring-1 ring-slate-200">
                        {p.categoria}
                      </span>
                    </div>
                    <dl className="space-y-1 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <dt>Precio</dt>
                        <dd className="font-mono text-slate-800">
                          {formatMoney(p.precio, 'USD')}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Peso</dt>
                        <dd>{p.peso} kg</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Stock</dt>
                        <dd>{p.stock}</dd>
                      </div>
                    </dl>
                    <button
                      type="button"
                      onClick={() =>
                        setCartQty((q) => ({
                          ...q,
                          [p.id]: (q[p.id] ?? 0) + 1,
                        }))
                      }
                      className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-slate-800"
                    >
                      Agregar al carrito
                      <ChevronRight className="h-4 w-4 opacity-80" />
                    </button>
                  </article>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Carrito dinámico
                  </h3>
                </div>
                {lineasPreview.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Vacío. Añade productos para construir la orden.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {CATALOGO.map((p) => {
                      const q = cartQty[p.id] ?? 0;
                      if (q <= 0) return null;
                      return (
                        <li
                          key={p.id}
                          className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
                        >
                          <span className="font-medium text-slate-800">
                            {p.nombre}
                          </span>
                          <span className="flex items-center gap-2">
                            <button
                              type="button"
                              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs hover:bg-slate-100"
                              onClick={() =>
                                setCartQty((prev) => ({
                                  ...prev,
                                  [p.id]: Math.max(0, (prev[p.id] ?? 0) - 1),
                                }))
                              }
                            >
                              −
                            </button>
                            <span className="w-6 text-center font-mono">
                              {q}
                            </span>
                            <button
                              type="button"
                              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs hover:bg-slate-100"
                              onClick={() =>
                                setCartQty((prev) => ({
                                  ...prev,
                                  [p.id]: (prev[p.id] ?? 0) + 1,
                                }))
                              }
                            >
                              +
                            </button>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </section>

            {/* Dirección */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
              <div className="mb-5 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                  <MapPin className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Dirección
                  </h2>
                  <p className="text-xs text-slate-500">
                    Entidad <span className="font-mono">Direccion</span>
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {(
                  [
                    ['pais', 'País'],
                    ['ciudad', 'Ciudad'],
                    ['calle', 'Calle'],
                    ['codigoPostal', 'Código postal'],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="block text-sm sm:col-span-1">
                    <span className="mb-1.5 block text-xs font-medium text-slate-600">
                      {label}
                    </span>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/15"
                      value={direccion[key]}
                      onChange={(e) =>
                        setDireccion({ ...direccion, [key]: e.target.value })
                      }
                    />
                  </label>
                ))}
                <label className="block text-sm sm:col-span-2">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">
                    Referencia
                  </span>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/15"
                    value={direccion.referencia}
                    onChange={(e) =>
                      setDireccion({
                        ...direccion,
                        referencia: e.target.value,
                      })
                    }
                  />
                </label>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                País distinto de «{PAIS_LOCAL_REF}» activa reglas de envío
                internacional en{' '}
                <span className="font-mono">CalculadorEnvioService</span> y
                validaciones de fraude en{' '}
                <span className="font-mono">ValidadorFraudeService</span>.
              </p>
            </section>

            {/* Pago + Cupón */}
            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
                <div className="mb-5 flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <CreditCard className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Pago
                    </h2>
                    <p className="text-xs text-slate-500">
                      Entidad <span className="font-mono">Pago</span>
                    </p>
                  </div>
                </div>

                <label className="mb-4 block text-sm">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">
                    Método de pago
                  </span>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/15"
                    value={pagoMetodo}
                    onChange={(e) => setPagoMetodo(e.target.value)}
                  >
                    {METODOS_PAGO.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm">
                  <span className="mb-1.5 block text-xs font-medium text-slate-600">
                    Moneda final
                  </span>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-500/15"
                    value={pagoMoneda}
                    onChange={(e) => setPagoMoneda(e.target.value)}
                  >
                    {MONEDAS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </label>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/60">
                <div className="mb-5 flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    <Ticket className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Cupón
                    </h2>
                    <p className="text-xs text-slate-500">
                      Entidad <span className="font-mono">Cupon</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm">
                    <span className="mb-1.5 block text-xs font-medium text-slate-600">
                      Código
                    </span>
                    <input
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 font-mono text-sm outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/15"
                      value={cupon.codigo}
                      onChange={(e) =>
                        setCupon({ ...cupon, codigo: e.target.value })
                      }
                    />
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1.5 block text-xs font-medium text-slate-600">
                      Porcentaje descuento
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/15"
                      value={cupon.porcentajeDescuento}
                      onChange={(e) =>
                        setCupon({
                          ...cupon,
                          porcentajeDescuento: Number(e.target.value),
                        })
                      }
                    />
                  </label>
                  <label className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/40 px-3 py-3">
                    <div>
                      <span className="text-sm font-medium text-slate-800">
                        Activo
                      </span>
                      <p className="text-xs text-slate-500">
                        Controla <span className="font-mono">cupon.activo</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={cupon.activo}
                      onClick={() =>
                        setCupon({ ...cupon, activo: !cupon.activo })
                      }
                      className={`relative h-7 w-12 rounded-full transition-colors ${
                        cupon.activo ? 'bg-indigo-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                          cupon.activo ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </label>
                  <label className="block text-sm">
                    <span className="mb-1.5 block text-xs font-medium text-slate-600">
                      Monto mínimo (USD)
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/15"
                      value={cupon.montoMinimo}
                      onChange={(e) =>
                        setCupon({
                          ...cupon,
                          montoMinimo: Number(e.target.value),
                        })
                      }
                    />
                  </label>
                </div>
              </section>
            </div>

            {error && (
              <div
                className="animate-fade-slide-up flex gap-3 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-900 shadow-sm"
                role="alert"
              >
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <div>
                  <p className="font-semibold">No se pudo procesar</p>
                  <p className="mt-1 text-red-800/90">{error}</p>
                  <p className="mt-2 text-xs text-red-700/80">
                    Incluye errores de dominio: validación, fraude, saldo,
                    stock/envío o tasas de cambio.
                  </p>
                </div>
              </div>
            )}

            {success && (
              <div
                className="animate-fade-slide-up space-y-4"
                aria-live="polite"
              >
                <div className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/50 p-6 shadow-lg shadow-emerald-900/5">
                  <div className="flex flex-wrap items-start gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="h-7 w-7" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                        Orden procesada
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        {success.mensaje}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        Respuesta del{' '}
                        <span className="font-mono text-xs">
                          CheckoutApplicationService
                        </span>{' '}
                        tras reglas de dominio e infraestructura de tasas.
                      </p>
                    </div>
                  </div>

                  <dl className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-white/80 px-4 py-3 ring-1 ring-slate-100">
                      <dt className="text-xs font-medium text-slate-500">
                        Subtotal (USD)
                      </dt>
                      <dd className="mt-1 font-mono text-sm font-semibold text-slate-900">
                        {formatMoney(success.resumenCompra.subtotal, 'USD')}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-white/80 px-4 py-3 ring-1 ring-slate-100">
                      <dt className="text-xs font-medium text-slate-500">
                        Descuento (USD)
                      </dt>
                      <dd className="mt-1 font-mono text-sm font-semibold text-slate-900">
                        − {formatMoney(success.resumenCompra.descuento, 'USD')}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-white/80 px-4 py-3 ring-1 ring-slate-100">
                      <dt className="text-xs font-medium text-slate-500">
                        Costo envío (USD)
                      </dt>
                      <dd className="mt-1 font-mono text-sm font-semibold text-slate-900">
                        {formatMoney(success.resumenCompra.costoEnvio, 'USD')}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-indigo-50/80 px-4 py-3 ring-1 ring-indigo-100">
                      <dt className="text-xs font-medium text-indigo-800">
                        Total final
                      </dt>
                      <dd className="mt-1 font-mono text-lg font-semibold text-indigo-950">
                        {formatMoney(
                          success.resumenCompra.totalFinal,
                          success.resumenCompra.moneda,
                        )}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-white/80 px-4 py-3 ring-1 ring-slate-100">
                      <dt className="text-xs font-medium text-slate-500">
                        Moneda
                      </dt>
                      <dd className="mt-1 font-mono text-sm text-slate-900">
                        {success.resumenCompra.moneda}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-white/80 px-4 py-3 ring-1 ring-slate-100">
                      <dt className="text-xs font-medium text-slate-500">
                        Estado pago
                      </dt>
                      <dd className="mt-1 inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-slate-900">
                        <Coins className="h-4 w-4 text-amber-600" />
                        {success.pago.estado}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-white/80 px-4 py-3 ring-1 ring-slate-100 sm:col-span-2">
                      <dt className="text-xs font-medium text-slate-500">
                        Cliente VIP
                      </dt>
                      <dd className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-900">
                        <Sparkles className="h-4 w-4 text-violet-600" />
                        {success.cliente.esVip ? 'Sí' : 'No'}
                        <span className="text-slate-500">·</span>
                        <span>{success.cliente.nombre}</span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={procesarCompra}
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-indigo-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-900/20 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Procesando…
                </>
              ) : (
                <>
                  Procesar compra
                  <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
                </>
              )}
            </button>

            {estimadoUsd && (
              <p className="text-center text-xs text-slate-500">
                Estimación local (USD): subtotal{' '}
                <span className="font-mono">
                  {estimadoUsd.subtotal.toFixed(2)}
                </span>{' '}
                · descuento{' '}
                <span className="font-mono">
                  {estimadoUsd.descuento.toFixed(2)}
                </span>{' '}
                · envío{' '}
                <span className="font-mono">
                  {estimadoUsd.costoEnvio.toFixed(2)}
                </span>{' '}
                · total USD{' '}
                <span className="font-mono font-semibold text-slate-700">
                  {estimadoUsd.total.toFixed(2)}
                </span>{' '}
                (el backend convierte a la moneda de pago).
              </p>
            )}
          </div>

          {/* Sidebar DDD */}
          <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-600" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Arquitectura DDD aplicada
                </h2>
              </div>
              <p className="mb-4 text-xs leading-relaxed text-slate-600">
                Vista estática del reparto de responsabilidades en el caso de uso
                de checkout: lo que ocurre en servidor tras el POST.
              </p>
              <ul className="space-y-3">
                <li className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                  <Box className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Entities
                    </p>
                    <p className="text-[11px] leading-snug text-slate-600">
                      Usuario, Producto, Dirección, Pago, Cupón, Orden — estado y
                      reglas intrínsecas.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                  <Cpu className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Domain Services
                    </p>
                    <p className="text-[11px] leading-snug text-slate-600">
                      ConversorMoneda, CalculadorDescuento, CalculadorEnvio,
                      ValidadorFraude, ProcesadorPago.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Application Service
                    </p>
                    <p className="text-[11px] leading-snug text-slate-600">
                      Orquesta el flujo de negocio y devuelve el resumen de la
                      compra.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                  <Server className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      Infrastructure
                    </p>
                    <p className="text-[11px] leading-snug text-slate-600">
                      Proveedor HTTP de tasas (ExchangeRate API) inyectado en el
                      conversor.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-5 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">Notas de demo</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>
                  El JSON enviado replica las propiedades esperadas por{' '}
                  <span className="font-mono">CheckoutController</span>.
                </li>
                <li>
                  <span className="font-mono">pago.monto</span> se calcula con
                  la misma base USD + FX que el dominio para minimizar rechazos
                  por saldo.
                </li>
                <li>
                  Prueba toggles: VIP, cupón inactivo, riesgo &gt; 80, país
                  internacional con montos altos.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white/80 py-8 text-center text-xs text-slate-500">
        Proyecto académico · UI React + Tailwind · Backend NestJS DDD
      </footer>
    </div>
  );
}
