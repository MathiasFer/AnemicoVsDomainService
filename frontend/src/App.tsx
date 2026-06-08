import {
  AlertTriangle,
  ArrowRight,
  Box,
  CheckCircle2,
  Cpu,
  CreditCard,
  Layers,
  Loader2,
  MapPin,
  Package,
  Terminal,
  RotateCcw,
  UserCheck,
  ShoppingCart,
  Sliders,
  ArrowLeft,
  ChevronRight,
  Ticket,
} from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';

import {
  PAIS_LOCAL_REF,
  construirCheckoutBody,
} from './lib/checkoutLogic';
import type {
  CheckoutSuccessResponse,
  CheckoutUsuarioPayload,
  PedagogicalErrorTrace,
  ProductoPayload,
} from './types/checkout';

const API_CHECKOUT = 'http://localhost:3000/checkout';
const API_SYSTEM_USUARIOS = 'http://localhost:3000/system/usuarios';
const API_SYSTEM_PRODUCTOS = 'http://localhost:3000/system/productos';
const API_SYSTEM_RESET = 'http://localhost:3000/system/reset';

// Monedas y métodos de pago permitidos en el backend
const METODOS_PAGO = [
  { value: 'TARJETA', label: 'Tarjeta de Crédito/Débito' },
  { value: 'TRANSFERENCIA', label: 'Transferencia Bancaria' },
  { value: 'PAYPAL', label: 'PayPal Express' },
] as const;

const MONEDAS = [
  { value: 'USD', label: 'USD — Dólar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'COP', label: 'COP — Peso Colombiano' },
  { value: 'MXN', label: 'MXN — Peso Mexicano' },
  { value: 'CLP', label: 'CLP — Peso Chileno' },
] as const;

// Tasas de cambio fijas que el backend simula de forma offline en ExchangeRateApiProvider
const TASAS_MOCK: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  MXN: 17.5,
  COP: 4000.0,
  CLP: 900.0,
};

function formatMoney(value: number, moneda: string): string {
  try {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: moneda === 'COP' || moneda === 'CLP' || moneda === 'MXN' ? 'USD' : moneda,
      maximumFractionDigits: moneda === 'COP' || moneda === 'CLP' ? 0 : 2,
    }).format(value).replace('US$', '$').replace('EUR', '€') + ' ' + moneda;
  } catch {
    return `${value.toFixed(2)} ${moneda}`;
  }
}

// Avatares visuales para la estética Netflix
const AVATARES: Record<number, string> = {
  1: '👨', // Juan
  2: '👩', // Maria VIP
  3: '🧔', // Carlos Sin Saldo
  4: '🤵', // Pedro Alto Riesgo
};

export default function App() {
  /// ESTADOS DE NAVEGACIÓN
  // SELECT_USER (Netflix) | PROFILE (Edición) | TIENDA (Compra)
  const [view, setView] = useState<'SELECT_USER' | 'PROFILE' | 'TIENDA'>('SELECT_USER');
  
  /// ESTADOS DE DATOS DINÁMICOS DESDE EL BACKEND
  const [usuarios, setUsuarios] = useState<CheckoutUsuarioPayload[]>([]);
  const [productos, setProductos] = useState<ProductoPayload[]>([]);
  const [activeUserId, setActiveUserId] = useState<number | null>(null);

  /// ESTADOS DE FORMULARIO DE COMPRA
  const [direccion, setDireccion] = useState({
    pais: PAIS_LOCAL_REF,
    ciudad: 'Quito',
    calle: 'Av. Amazonas N34-120',
    codigoPostal: '170135',
    referencia: 'Edificio central, oficina 402',
  });

  const [pagoMetodo, setPagoMetodo] = useState<string>('TARJETA');
  const [pagoMoneda, setPagoMoneda] = useState<string>('USD');

  const [cupon, setCupon] = useState({
    codigo: 'DESCUENTO10',
    porcentajeDescuento: 10,
    activo: false,
    montoMinimo: 100,
  });

  // Cantidades en carrito
  const [cartQty, setCartQty] = useState<Record<number, number>>({
    101: 0,
    102: 0,
    103: 0,
  });

  /// ESTADOS DE EDICIÓN DE PERFIL EN PANTALLA 2
  const [editSaldo, setEditSaldo] = useState<number>(0);
  const [editVip, setEditVip] = useState<boolean>(false);
  const [editRiesgo, setEditRiesgo] = useState<number>(0);
  const [profileSaving, setProfileSaving] = useState<boolean>(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState<boolean>(false);

  /// ESTADOS DE CARGA Y RESPUESTAS DEL BACKEND
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<CheckoutSuccessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorTrace, setErrorTrace] = useState<PedagogicalErrorTrace | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Cargar usuarios y productos de backend
  const fetchData = async () => {
    setIsInitialLoading(true);
    setError(null);
    try {
      const resUsr = await fetch(API_SYSTEM_USUARIOS);
      if (resUsr.ok) {
        const dataUsr = await resUsr.json();
        setUsuarios(dataUsr);
      } else {
        setError(`Backend respondió con error: ${resUsr.status}`);
      }
      
      const resProd = await fetch(API_SYSTEM_PRODUCTOS);
      if (resProd.ok) {
        const dataProd = await resProd.json();
        setProductos(dataProd);
      }
    } catch (e) {
      console.error('Error al sincronizar con el backend', e);
      setError('No se pudo conectar con http://localhost:3000. Verifica que el backend esté encendido.');
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Obtener objeto de usuario activo actual
  const activeUser = useMemo(() => {
    return usuarios.find(u => u.id === activeUserId) || null;
  }, [usuarios, activeUserId]);

  // Al cambiar el usuario activo, inicializar los campos de edición en pantalla 2
  useEffect(() => {
    if (activeUser) {
      setEditSaldo(activeUser.saldo);
      setEditVip(activeUser.esVip);
      setEditRiesgo(activeUser.nivelRiesgo);
      setProfileSaveSuccess(false);
      
      // Limpiar carro y trazas anteriores
      setCartQty({
        101: 0,
        102: 0,
        103: 0,
      });
      setError(null);
      setErrorTrace(null);
      setSuccess(null);
    }
  }, [activeUserId, activeUser]);

  // Reiniciar la base de datos a su estado original
  const resetDatabase = async () => {
    try {
      const res = await fetch(API_SYSTEM_RESET, { method: 'POST' });
      if (res.ok) {
        await fetchData();
        // Limpiar estados de checkout
        setError(null);
        setErrorTrace(null);
        setSuccess(null);
        setProfileSaveSuccess(false);
        // Si hay usuario activo, refrescar campos de edición
        if (activeUser) {
          const freshUsr = usuarios.find(u => u.id === activeUserId);
          if (freshUsr) {
            setEditSaldo(freshUsr.saldo);
            setEditVip(freshUsr.esVip);
            setEditRiesgo(freshUsr.nivelRiesgo);
          }
        }
        alert('Base de datos en memoria reiniciada exitosamente.');
      }
    } catch (e) {
      alert('Error al conectar con el backend para reiniciar.');
    }
  };

  // Guardar datos editados del usuario activo en el backend
  const guardarPerfil = async () => {
    if (!activeUser) return;
    setProfileSaving(true);
    setProfileSaveSuccess(false);
    try {
      const res = await fetch(`${API_SYSTEM_USUARIOS}/${activeUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          saldo: editSaldo,
          esVip: editVip,
          nivelRiesgo: editRiesgo,
        }),
      });
      if (res.ok) {
        await fetchData(); // Refrescar del backend
        setProfileSaveSuccess(true);
        setTimeout(() => setProfileSaveSuccess(false), 3000);
      } else {
        alert('Error al guardar datos en el servidor.');
      }
    } catch (e) {
      alert('Error de conexión con el backend.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Cálculos matemáticos en el frontend para el ticket interactivo
  const estimacionUsd = useMemo(() => {
    let subtotal = 0;
    let pesoTotal = 0;

    for (const prod of productos) {
      const qty = cartQty[prod.id] ?? 0;
      if (qty > 0) {
        subtotal += prod.precio * qty;
        pesoTotal += prod.peso * qty;
      }
    }

    let descuento = 0;
    if (activeUser?.esVip) {
      descuento += subtotal * 0.10;
    }

    if (cupon.activo && subtotal >= cupon.montoMinimo) {
      descuento += (subtotal * cupon.porcentajeDescuento) / 100;
    }

    let costoEnvio = 0;
    if (subtotal > 0) {
      costoEnvio = 5;
      costoEnvio += pesoTotal * 0.5;

      if (direccion.pais.trim().toLowerCase() !== PAIS_LOCAL_REF.toLowerCase()) {
        costoEnvio += 15;
      }

      costoEnvio += 10; // prioridad por defecto
    }

    const total = Math.max(0, subtotal - descuento + costoEnvio);
    return { subtotal, descuento, costoEnvio, total };
  }, [cartQty, activeUser, cupon, direccion.pais, productos]);

  // Valor convertido en base a la tasa de cambio simulada
  const valorConvertido = useMemo(() => {
    const tasa = TASAS_MOCK[pagoMoneda] ?? 1.0;
    return estimacionUsd.total * tasa;
  }, [estimacionUsd.total, pagoMoneda]);

  // Llamar al POST /checkout del backend
  const procesarCompra = async () => {
    setError(null);
    setErrorTrace(null);
    setSuccess(null);

    const productosSeleccionados = Object.values(cartQty).some((qty) => qty > 0);
    if (!productosSeleccionados) {
      setError('El carrito está vacío. Agrega al menos un producto para iniciar el checkout.');
      return;
    }

    setLoading(true);

    try {
      const body = construirCheckoutBody({
        usuarioId: activeUser!.id,
        cartQty,
        direccion,
        pagoMetodo,
        pagoMoneda,
        cupon,
      });

      const res = await fetch(API_CHECKOUT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Error en la validación comercial');
        if (json.pedagogicalTrace) {
          setErrorTrace(json.pedagogicalTrace as PedagogicalErrorTrace);
        }
        return;
      }

      setSuccess(json as CheckoutSuccessResponse);
      // Tras compra exitosa, refrescar stock y saldo del backend inmediatamente!
      await fetchData();
    } catch (e) {
      setError('No se pudo establecer conexión con el backend NestJS (localhost:3000).');
    } finally {
      setLoading(false);
    }
  };

  const errorEnSaldo = errorTrace?.source === 'ProcesadorPagoService' || errorTrace?.source === 'Usuario';
  const errorEnStock = errorTrace?.source === 'Producto';
  const errorEnEnvio = errorTrace?.source === 'CalculadorEnvioService' || errorTrace?.source === 'Direccion';
  const errorEnCupon = errorTrace?.source === 'Cupon';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans antialiased">
      
      {/* GLOBAL HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/25">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white">
                  DDD Pedagogical Lab
                </h1>
                <span className="rounded-full bg-indigo-950/60 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 ring-1 ring-indigo-850">
                  Interactive Simulator
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Demostración Didáctica de Reglas de Negocio en Entidades Ricas
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {activeUser && (
              <div className="flex items-center gap-1 rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs">
                <span className="text-slate-400 mr-1">Comprador:</span>
                <span className="font-bold text-indigo-400 flex items-center gap-1">
                  <span>{AVATARES[activeUser.id]}</span>
                  <span>{activeUser.nombre.split(' (')[0]}</span>
                </span>
              </div>
            )}
            
            <button
              onClick={resetDatabase}
              className="flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-850 px-3 py-1.5 text-xs text-slate-200 transition active:scale-[0.98]"
              title="Restablecer stocks y saldos por defecto"
            >
              <RotateCcw className="h-3.5 w-3.5 text-indigo-400" />
              <span>Reset DB</span>
            </button>

            {activeUser && (
              <button
                onClick={() => setView('SELECT_USER')}
                className="flex items-center gap-1 rounded-xl bg-indigo-950 hover:bg-indigo-900/80 border border-indigo-900 text-indigo-300 px-3 py-1.5 text-xs transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Cambiar Persona</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* PANTALLA 1: NETFLIX-STYLE PROFILE SELECTOR */}
      {view === 'SELECT_USER' && (
        <section className="mx-auto max-w-5xl px-4 py-20 text-center animate-fade-slide-up">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            ¿Quién está comprando hoy?
          </h2>
          <p className="mt-3 text-slate-400 text-sm max-w-xl mx-auto">
            Selecciona un perfil académico preconfigurado para simular la ejecución e infracción de las invariantes comerciales en el backend.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {usuarios.length === 0 && (
              <div className="col-span-full py-10 rounded-3xl border border-dashed border-slate-800 bg-slate-900/10 text-slate-500">
                <p>No se pudieron cargar los perfiles desde el backend.</p>
                <p className="text-[10px] mt-2">Asegúrate de que el servidor NestJS esté corriendo en http://localhost:3000</p>
                <button 
                  onClick={fetchData}
                  className="mt-4 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 rounded-xl text-xs transition"
                >
                  Reintentar Conexión
                </button>
              </div>
            )}
            {usuarios.map((u) => (
              <div
                key={u.id}
                onClick={() => {
                  setActiveUserId(u.id);
                  setView('PROFILE'); // UX Requerido: Primero va a ver/editar sus datos
                }}
                className="group relative cursor-pointer overflow-hidden rounded-3xl border border-slate-900 bg-slate-900/30 p-6 transition hover:border-indigo-500/50 hover:bg-indigo-950/10 hover:shadow-xl hover:shadow-indigo-950/20 active:scale-[0.98]"
              >
                {/* Avatar Cyberpunk */}
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-900 border border-slate-800 text-5xl transition group-hover:scale-105 group-hover:border-indigo-500/30 group-hover:bg-indigo-950/40">
                  {AVATARES[u.id] || ''}
                </div>

                <h3 className="mt-5 text-base font-bold text-white group-hover:text-indigo-400 transition">
                  {u.nombre.split(' (')[0]}
                </h3>
                <span className="mt-1 block text-xs text-slate-400 font-mono">
                  {formatMoney(u.saldo, 'USD')}
                </span>

                {/* Explicación didáctica de su perfil */}
                <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                  {u.id === 1 && 'Usuario normal para transacciones limpias sin errores.'}
                  {u.id === 2 && 'Cliente VIP. Dispara automáticamente 10% de descuento en el subtotal.'}
                  {u.id === 3 && 'Saldo en cero. Úsalo para probar excepciones de pago rechazado.'}
                  {u.id === 4 && 'Puntuación de riesgo del 90%. Úsalo para disparar bloqueos por fraude.'}
                </p>

                <div className="mt-5 inline-flex items-center gap-1 rounded-xl bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-950/40 transition">
                  Configurar y Entrar <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-xs text-slate-550 border-t border-slate-900/60 pt-6">
            Tip académico: Todos los datos son dinámicos. Puedes cambiarlos y restaurarlos con el botón de "Reset DB" en cualquier momento.
          </div>
        </section>
      )}

      {/* PANTALLA 2: PROFILE PROFILE EDITOR / BILLING STATS */}
      {view === 'PROFILE' && activeUser && (
        <section className="mx-auto max-w-3xl px-4 py-12 animate-fade-slide-up">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => setView('SELECT_USER')}
              className="flex items-center gap-1.5 text-xs text-slate-450 hover:text-white transition"
            >
              <ArrowLeft className="h-4 w-4" /> Volver a perfiles
            </button>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Paso 2 de 3: Configuración</span>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-900 bg-slate-900/20 p-8 backdrop-blur-md shadow-2xl">
            {/* Header del Perfil */}
            <div className="flex items-center gap-4 border-b border-slate-850 pb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-3xl">
                {AVATARES[activeUser.id]}
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white">{activeUser.nombre}</h2>
                <p className="text-xs text-slate-400 font-mono">{activeUser.email}</p>
              </div>
            </div>

            {/* Inputs editables del Simulador */}
            <div className="mt-8 space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Sliders className="h-4 w-4" /> Personaliza los Invariantes del Modelo en Caliente
              </h3>
              
              {/* 1. Billetera / Saldo */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Saldo de Billetera (USD)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={editSaldo}
                      onChange={(e) => setEditSaldo(Math.max(0, Number(e.target.value)))}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-7 pr-3 py-2 text-sm text-white font-mono outline-none focus:border-indigo-500"
                    />
                  </div>
                  {/* Botones rápidos */}
                  <button
                    onClick={() => setEditSaldo((s) => s + 100)}
                    className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs hover:bg-slate-800 text-slate-350 transition"
                  >
                    +$100
                  </button>
                  <button
                    onClick={() => setEditSaldo((s) => s + 500)}
                    className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs hover:bg-slate-800 text-slate-350 transition"
                  >
                    +$500
                  </button>
                  <button
                    onClick={() => setEditSaldo(0)}
                    className="rounded-xl border border-red-950 bg-red-950/20 px-3 py-1.5 text-xs hover:bg-red-950/40 text-red-400 transition"
                  >
                    Vaciar ($0)
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Modificar este saldo simulará fondos abundantes o insuficientes cuando el <span className="font-mono text-indigo-400">ProcesadorPagoService</span> realice el retiro en el backend.
                </p>
              </div>

              {/* 2. Nivel de Riesgo y VIP */}
              <div className="grid gap-6 sm:grid-cols-2">
                
                {/* VIP */}
                <div className="rounded-2xl border border-slate-850 bg-slate-900/40 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-semibold text-white">Estado Cliente VIP</span>
                      <span className="text-[9px] text-slate-500 mt-1 block">Aplica 10% de descuento VIP fijo.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditVip(!editVip)}
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        editVip ? 'bg-indigo-600' : 'bg-slate-700'
                      }`}
                    >
                      <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        editVip ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Riesgo */}
                <div className="rounded-2xl border border-slate-850 bg-slate-900/40 p-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-white">Nivel de Riesgo de Fraude</span>
                    <span className={`font-bold ${editRiesgo > 80 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {editRiesgo}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editRiesgo}
                    onChange={(e) => setEditRiesgo(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <span className="text-[9px] text-slate-500 block">
                    {editRiesgo > 80 ? 'Al superar el 80%, el Validador de Fraude bloqueará la compra.' : 'Cumple política de fraude estándar.'}
                  </span>
                </div>

              </div>

            </div>

            {/* Acciones del perfil */}
            <div className="mt-8 border-t border-slate-850 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <button
                onClick={guardarPerfil}
                disabled={profileSaving}
                className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-500/10 transition active:scale-[0.98]"
              >
                {profileSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Guardando en backend...
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" /> Guardar Configuración en Backend
                  </>
                )}
              </button>

              {profileSaveSuccess && (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
                  Configuración persistida con éxito en el backend.
                </span>
              )}

              <button
                onClick={() => setView('TIENDA')}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 px-8 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-emerald-500/15 active:scale-[0.98] transition"
              >
                <ShoppingCart className="h-4 w-4" />
                ¡Ir a la Tienda a Simular Compra!
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>
            </div>

          </div>
        </section>
      )}

      {/* PANTALLA 3: STORE AND SIMULATION MARKET */}
      {view === 'TIENDA' && activeUser && (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-slide-up">
          
          {/* Cabecera / Breadcrumb */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => setView('PROFILE')}
              className="flex items-center gap-1.5 text-xs text-slate-450 hover:text-white transition"
            >
              <ArrowLeft className="h-4 w-4" /> Volver a Configurar Perfil (Paso 2)
            </button>
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Paso 3 de 3: Simular Mercado</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
            
            {/* LADO IZQUIERDO: CATÁLOGO Y CONFIGURACIONES DE ENTREGA */}
            <div className="space-y-6">
              
              {/* MINI PANEL DEL COMPRADOR (VISUAL SUMMARY) */}
              <div className="rounded-3xl border border-slate-900 bg-slate-900/30 p-5 backdrop-blur-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-950 text-indigo-400 text-2xl">
                    {AVATARES[activeUser.id]}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">Comprando como {activeUser.nombre}</h3>
                    <p className="text-[10px] text-slate-450 mt-0.5">
                      Moneda Preferida: <span className="font-mono text-slate-300">{activeUser.monedaPreferida}</span> · Riesgo: <span className="font-bold text-indigo-400">{activeUser.nivelRiesgo}%</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="block text-[10px] text-slate-500">Saldo Actual Base (Backend)</span>
                  <span className={`font-mono text-base font-bold ${errorEnSaldo ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                    {formatMoney(activeUser.saldo, 'USD')}
                  </span>
                </div>
              </div>

              {/* CATÁLOGO DE PRODUCTOS (VALORES CARGADOS EN VIVO DESDE BACKEND) */}
              <section className={`rounded-3xl border transition-all duration-300 ${
                errorEnStock ? 'border-red-500/50 bg-red-950/10 shadow-lg shadow-red-900/5' : 'border-slate-900 bg-slate-900/20'
              } p-6 backdrop-blur-sm`}>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                      errorEnStock ? 'bg-red-950 text-red-400' : 'bg-indigo-950 text-indigo-400'
                    }`}>
                      <Package className="h-4 w-4" />
                    </span>
                    <div>
                      <h2 className="text-sm font-bold text-white">Catálogo en Vivo (Base de Datos Backend)</h2>
                      <p className="text-[10px] text-slate-450">
                        Carga directa del <span className="font-mono text-indigo-400">InMemoryProductoRepository</span>. Refleja el stock en tiempo real.
                      </p>
                    </div>
                  </div>
                  {errorEnStock && (
                    <span className="animate-pulse rounded-full bg-red-950/70 px-2 py-0.5 text-[10px] font-semibold text-red-400 ring-1 ring-red-800">
                      Fallo de Stock
                    </span>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {productos.map((p) => {
                    const qty = cartQty[p.id] ?? 0;
                    return (
                      <article
                        key={p.id}
                        className={`flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 ${
                          qty > 0 ? 'border-indigo-500/50 bg-indigo-950/10' : 'border-slate-850 bg-slate-900/30'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h3 className="text-xs font-bold text-white leading-tight">{p.nombre}</h3>
                            <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-400 ring-1 ring-slate-800">
                              {p.categoria}
                            </span>
                          </div>
                          
                          <dl className="mt-3 space-y-1 text-[10px] text-slate-400">
                            <div className="flex justify-between">
                              <dt>Precio</dt>
                              <dd className="font-mono font-bold text-white">{formatMoney(p.precio, 'USD')}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt>Stock Backend</dt>
                              <dd className={`font-semibold ${p.stock === 0 ? 'text-red-400 font-bold' : 'text-slate-200'}`}>
                                {p.stock === 0 ? 'Agotado' : `${p.stock} uds`}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt>Peso</dt>
                              <dd className="text-slate-350">{p.peso} kg</dd>
                            </div>
                          </dl>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-2">
                          {qty === 0 ? (
                            <button
                              type="button"
                              onClick={() =>
                                setCartQty((prev) => ({
                                  ...prev,
                                  [p.id]: 1,
                                }))
                              }
                              className={`w-full rounded-xl py-1.5 text-center text-[10px] font-bold transition-all ${
                                p.stock === 0
                                  ? 'bg-red-950/45 text-red-450 border border-red-900/30 hover:bg-red-950/60'
                                  : 'bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800'
                              }`}
                            >
                              {p.stock === 0 ? 'Probar Agotado' : 'Añadir al Carro'}
                            </button>
                          ) : (
                            <div className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-2 py-1">
                              <button
                                type="button"
                                className="text-xs font-bold text-slate-450 hover:text-white px-2"
                                onClick={() =>
                                  setCartQty((prev) => ({
                                    ...prev,
                                    [p.id]: Math.max(0, (prev[p.id] ?? 0) - 1),
                                  }))
                                }
                              >
                                −
                              </button>
                              <span className="font-mono text-xs font-bold text-indigo-400">{qty}</span>
                              <button
                                type="button"
                                className="text-xs font-bold text-slate-450 hover:text-white px-2"
                                onClick={() =>
                                  setCartQty((prev) => ({
                                    ...prev,
                                    [p.id]: (prev[p.id] ?? 0) + 1,
                                  }))
                                }
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>

              {/* DIRECCIÓN Y LOGÍSTICA */}
              <section className={`rounded-3xl border transition-all duration-300 ${
                errorEnEnvio ? 'border-red-500/50 bg-red-950/10 shadow-lg shadow-red-900/5' : 'border-slate-900 bg-slate-900/20'
              } p-6 backdrop-blur-sm`}>
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                      errorEnEnvio ? 'bg-red-950 text-red-400' : 'bg-indigo-950 text-indigo-400'
                    }`}>
                      <MapPin className="h-4 w-4" />
                    </span>
                    <div>
                      <h2 className="text-sm font-bold text-white">Dirección de Entrega</h2>
                      <p className="text-[10px] text-slate-455">
                        Value Object <span className="font-mono text-indigo-400">Direccion</span> (Auto-validado al instanciarse)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block text-xs">
                    <span className="mb-1 block text-[10px] font-semibold text-slate-450">País de Destino</span>
                    <input
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                      value={direccion.pais}
                      onChange={(e) => setDireccion({ ...direccion, pais: e.target.value })}
                    />
                  </label>
                  <label className="block text-xs">
                    <span className="mb-1 block text-[10px] font-semibold text-slate-450">Ciudad</span>
                    <input
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                      value={direccion.ciudad}
                      onChange={(e) => setDireccion({ ...direccion, ciudad: e.target.value })}
                    />
                  </label>
                  <label className="block text-xs">
                    <span className="mb-1 block text-[10px] font-semibold text-slate-455">Código Postal</span>
                    <input
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                      value={direccion.codigoPostal}
                      onChange={(e) => setDireccion({ ...direccion, codigoPostal: e.target.value })}
                    />
                  </label>
                  <label className="block text-xs sm:col-span-3">
                    <span className="mb-1 block text-[10px] font-semibold text-slate-450">Calle / Avenida</span>
                    <input
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                      value={direccion.calle}
                      onChange={(e) => setDireccion({ ...direccion, calle: e.target.value })}
                    />
                  </label>
                  <label className="block text-xs sm:col-span-3">
                    <span className="mb-1 block text-[10px] font-semibold text-slate-450">Referencia de Domicilio</span>
                    <input
                      className="w-full rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                      value={direccion.referencia}
                      onChange={(e) => setDireccion({ ...direccion, referencia: e.target.value })}
                    />
                  </label>
                </div>
              </section>

              {/* PAGO Y CUPÓN */}
              <div className="grid gap-6 sm:grid-cols-2">
                <section className="rounded-3xl border border-slate-900 bg-slate-900/20 p-6 backdrop-blur-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-950 text-indigo-400">
                      <CreditCard className="h-4 w-4" />
                    </span>
                    <h2 className="text-sm font-bold text-white">Método de Pago</h2>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-xs">
                      <span className="mb-1 block text-[10px] font-semibold text-slate-450">Método</span>
                      <select
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
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

                    <label className="block text-xs">
                      <span className="mb-1 block text-[10px] font-semibold text-slate-450">Moneda</span>
                      <select
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
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
                  </div>
                </section>

                <section className={`rounded-3xl border transition-all duration-305 ${
                  errorEnCupon ? 'border-red-500/50 bg-red-950/10 shadow-lg shadow-red-900/5' : 'border-slate-900 bg-slate-900/20'
                } p-6 backdrop-blur-sm`}>
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-950 text-indigo-400">
                        <Ticket className="h-4 w-4" />
                      </span>
                      <h2 className="text-sm font-bold text-white">Cupón</h2>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <label className="block text-xs flex-1">
                        <span className="mb-1 block text-[10px] font-semibold text-slate-400">Código</span>
                        <input
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 font-mono text-xs text-white outline-none focus:border-indigo-500"
                          value={cupon.codigo}
                          onChange={(e) => setCupon({ ...cupon, codigo: e.target.value.toUpperCase() })}
                        />
                      </label>
                      <label className="block text-xs w-20">
                        <span className="mb-1 block text-[10px] font-semibold text-slate-400">Pct (%)</span>
                        <input
                          type="number"
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                          value={cupon.porcentajeDescuento}
                          onChange={(e) => setCupon({ ...cupon, porcentajeDescuento: Number(e.target.value) })}
                        />
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between rounded-xl bg-slate-900/60 p-2 text-xs border border-slate-850">
                      <span className="text-[10px] text-slate-400">Activar Cupón</span>
                      <button
                        type="button"
                        onClick={() => setCupon({ ...cupon, activo: !cupon.activo })}
                        className={`relative h-6 w-11 rounded-full transition-colors ${
                          cupon.activo ? 'bg-indigo-600' : 'bg-slate-700'
                        }`}
                      >
                        <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                          cupon.activo ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    <label className="block text-xs">
                      <span className="mb-1 block text-[10px] font-semibold text-slate-400">Mínimo Compra (USD)</span>
                      <input
                        type="number"
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1 text-xs text-white outline-none focus:border-indigo-500"
                        value={cupon.montoMinimo}
                        onChange={(e) => setCupon({ ...cupon, montoMinimo: Number(e.target.value) })}
                      />
                    </label>
                  </div>
                </section>
              </div>

            </div>

            {/* LADO DERECHO: FACTURA INTERACTIVA Y DDD TERMINAL */}
            <div className="space-y-6">
              
              {/* FACTURA DIGITAL */}
              <section className={`relative overflow-hidden rounded-3xl border transition-all duration-300 bg-slate-900/40 p-6 backdrop-blur-md shadow-2xl ${
                errorTrace ? 'border-red-500/20 shadow-red-950/5' : 'border-slate-850 shadow-indigo-950/10'
              }`}>
                <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                <div className="mb-4 flex items-center justify-between border-b border-slate-850 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide uppercase">Factura Comercial</h3>
                    <p className="text-[9px] text-slate-500 font-mono">ORDER-REF-{Date.now().toString().slice(-6)}</p>
                  </div>
                  <span className="rounded bg-indigo-950/60 px-2 py-0.5 text-[9px] font-bold text-indigo-400 border border-indigo-900/40 font-mono">
                    DDD ACTIVE
                  </span>
                </div>

                <div className="space-y-3 py-2">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Items Seleccionados</span>
                  {Object.values(cartQty).every((q) => q === 0) ? (
                    <p className="text-xs text-slate-500 italic">El carrito está vacío.</p>
                  ) : (
                    <ul className="space-y-2 border-b border-slate-850 pb-4">
                      {productos.map((p) => {
                        const q = cartQty[p.id] ?? 0;
                        if (q <= 0) return null;
                        return (
                          <li key={p.id} className="flex justify-between text-xs">
                            <span className="text-slate-350">
                              {p.nombre} <span className="font-mono text-indigo-400">x{q}</span>
                            </span>
                            <span className="font-mono text-slate-200">{formatMoney(p.precio * q, 'USD')}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div className="space-y-2 py-2 text-xs border-b border-slate-850 pb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal (USD)</span>
                    <span className="font-mono text-slate-200">{formatMoney(estimacionUsd.subtotal, 'USD')}</span>
                  </div>

                  {estimacionUsd.descuento > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span className="flex items-center gap-1">
                        Descuentos Aplicados
                        {activeUser.esVip && <span className="text-[8px] bg-violet-950 text-violet-400 px-1 py-0.5 rounded">VIP</span>}
                      </span>
                      <span className="font-mono">- {formatMoney(estimacionUsd.descuento, 'USD')}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-slate-400">Envío Logístico (USD)</span>
                    <span className="font-mono text-slate-200">
                      {estimacionUsd.costoEnvio > 0 ? formatMoney(estimacionUsd.costoEnvio, 'USD') : '$0.00 USD'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold text-white uppercase">Total Estimado USD</span>
                    <span className="font-mono text-sm font-semibold text-slate-300">{formatMoney(estimacionUsd.total, 'USD')}</span>
                  </div>

                  {pagoMoneda !== 'USD' && (
                    <div className="flex items-baseline justify-between rounded-xl bg-indigo-950/20 px-3 py-2 border border-indigo-900/30">
                      <div>
                        <span className="block text-indigo-300 font-bold uppercase text-[9px]">Total Convertido (Tasa)</span>
                        <span className="text-[8px] text-slate-500 font-mono">1 USD = {TASAS_MOCK[pagoMoneda]} {pagoMoneda}</span>
                      </div>
                      <span className="font-mono text-base font-extrabold text-indigo-400">
                        {formatMoney(valorConvertido, pagoMoneda)}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={procesarCompra}
                  disabled={loading}
                  className="mt-6 group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-3.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/10 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      Procesando transacción pura…
                    </>
                  ) : (
                    <>
                      Transmitir Transacción (POST /checkout)
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
              </section>

              {/* DDD EXCEPTION DIAGNOSTICS TERMINAL (SI HAY ERROR) */}
              {errorTrace && (
                <section className="animate-fade-slide-up overflow-hidden rounded-3xl border border-red-500/40 bg-slate-950 shadow-lg shadow-red-950/20">
                  <div className="flex items-center gap-2 bg-red-950/50 px-4 py-2 text-red-400 border-b border-red-900/40">
                    <Terminal className="h-4 w-4 text-red-500" />
                    <span className="font-mono text-[9px] font-bold tracking-wider uppercase">
                      EXCEPCIÓN DE DOMINIO CAPTURADA
                    </span>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-950 text-red-550">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white">{error}</h3>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-400 font-sans">
                          {errorTrace.explanation}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 rounded-xl bg-slate-900/80 p-3 text-[10px] font-mono border border-slate-900">
                      <div className="flex justify-between">
                        <span className="text-slate-550">Capa DDD:</span>
                        <span className={`px-1.5 rounded text-[9px] ${
                          errorTrace.type === 'ENTITY' ? 'bg-indigo-950 text-indigo-400' : 'bg-sky-950 text-sky-400'
                        }`}>
                          {errorTrace.type}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-550">Clase del Modelo:</span>
                        <span className="text-slate-300 font-semibold">{errorTrace.source}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-550">Validación / Método:</span>
                        <span className="text-amber-400 font-semibold">{errorTrace.method}()</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Restricción lógica (Código Backend)</span>
                      <div className="mt-1 overflow-x-auto rounded-xl bg-slate-900 p-3 text-[10px] font-mono text-red-300 border border-slate-900 shadow-inner">
                        <code>{errorTrace.codeSnippet}</code>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* TIMELINE DE COMPRA EXITOSA (PEDAGOGICAL TRACE) */}
              {success && (
                <section className="animate-fade-slide-up overflow-hidden rounded-3xl border border-emerald-500/40 bg-slate-955 shadow-lg shadow-emerald-950/20">
                  <div className="flex items-center gap-2 bg-emerald-950/50 px-4 py-2.5 text-emerald-400 border-b border-emerald-900/40">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="font-mono text-[9px] font-bold tracking-wider uppercase">
                      COMPRA COMPLETADA CORRECTAMENTE
                    </span>
                  </div>
                  
                  <div className="p-5">
                    <p className="text-xs font-bold text-white">{success.mensaje}</p>
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                      La orden fue confirmada en el backend. Los cambios se persistieron en el repositorio simulado. Traza de ejecución didáctica:
                    </p>

                    <div className="mt-4 space-y-4">
                      {success.pedagogicalTrace.map((step) => (
                        <div key={step.step} className="relative pl-6 before:absolute before:left-2 before:top-2 before:h-full before:w-0.5 before:bg-slate-900 last:before:hidden">
                          <span className="absolute left-0 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[8px] font-bold text-indigo-400 ring-1 ring-slate-800">
                            {step.step}
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="font-mono text-[10px] font-bold text-white">{step.source}.{step.method}()</span>
                              <span className={`px-1 py-0.2 rounded text-[8px] font-semibold ${
                                step.type === 'ENTITY' ? 'bg-indigo-950 text-indigo-400' : 'bg-sky-950 text-sky-400'
                              }`}>
                                {step.type}
                              </span>
                            </div>
                            <p className="mt-0.5 text-[10px] leading-relaxed text-slate-450">{step.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-2xl bg-slate-900/60 p-3 text-[10px] border border-slate-900 space-y-1">
                      <span className="block font-bold text-slate-400">Billetera Actualizada tras Checkout</span>
                      <div className="flex justify-between">
                        <span className="text-slate-550">Nuevo Saldo:</span>
                        <span className="font-mono text-emerald-400 font-bold">
                          {formatMoney(success.cliente.saldoRestante, success.resumenCompra.moneda)}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* FOOTER DDD EXPLICATIVO */}
              <aside className="rounded-3xl border border-slate-900 bg-slate-900/20 p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-white">Inyección de Invariantes</h3>
                </div>
                <ul className="space-y-3 text-xs">
                  <li className="flex gap-2">
                    <Box className="h-4 w-4 shrink-0 text-indigo-400 mt-0.5" />
                    <div>
                      <strong className="text-white block text-[11px]">Entidades Clave</strong>
                      <span className="text-[10px] text-slate-455 leading-relaxed block mt-0.5">
                        Validan invariantes intrínsecos al cargar (ej. no comprar si el stock es menor a lo solicitado).
                      </span>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <Cpu className="h-4 w-4 shrink-0 text-sky-400 mt-0.5" />
                    <div>
                      <strong className="text-white block text-[11px]">Servicios del Dominio</strong>
                      <span className="text-[10px] text-slate-455 leading-relaxed block mt-0.5">
                        Resuelven políticas que cruzan entidades (conversión FX, políticas anti-fraude, tasas logísticas).
                      </span>
                    </div>
                  </li>
                </ul>
              </aside>

            </div>

          </div>
        </section>
      )}

      {/* FOOTER GENERAL */}
      <footer className="border-t border-slate-900 bg-slate-950 py-12 text-center text-xs text-slate-550">
        Lab DDD Académico · NestJS backend puro · React frontend desacoplado · IoC y SOLID
      </footer>
    </div>
  );
}
