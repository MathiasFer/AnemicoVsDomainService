# Laboratorio de Diseno Orientado a Dominio (DDD)

Este proyecto academico ha sido estructurado y refactorizado profesionalmente aplicando **Domain-Driven Design (DDD)** sobre **NestJS** en el backend y una interfaz interactiva de alta fidelidad en **React + Tailwind CSS** en el frontend.

El proposito principal es contrastar un **Modelo de Dominio Anemico** frente a un **Modelo de Dominio Rico (Modelo Enriquecido)**, visualizando en tiempo real como las entidades y los servicios de dominio validan las reglas de negocio e invariantes.

---

## Estructura del Proyecto

El proyecto esta dividido en dos componentes independientes:

- **`/backend`**: Servidor NestJS (TypeScript) que expone las API comerciales, gestiona la persistencia en memoria y acumula trazas pedagogicas de ejecucion.
- **`/frontend`**: Cliente React + Vite + Tailwind CSS v4, que renderiza la Factura Interactiva y el terminal de diagnosticos de dominio.

---

## Como Iniciar el Laboratorio

### 1. Iniciar el Servidor de Backend

```bash
cd backend
npm install
npm run start:dev
```

- El backend se ejecutara en: `http://localhost:3000`
- Verifica su estado accediendo a: `http://localhost:3000/health` (deberia responder `ok`).

### 2. Iniciar el Servidor de Frontend

```bash
cd frontend
npm install
npm run dev
```

- El frontend se levantara en: `http://localhost:5173` (o el puerto que indique la consola).

---

## Escenarios Didacticos Preconfigurados para Pruebas

Para evidenciar la robustez y control de las Entidades Ricas y Servicios de Dominio, la aplicacion cuenta con datos precargados en memoria que puedes probar desde la interfaz:

### Usuarios de Prueba

1. **Juan Perez (Usuario Estandar)**: Saldo de `$1000.00 USD`, nivel de riesgo `10%`. Transaccion normal y exitosa.
2. **Maria Lopez (Usuario VIP)**: Saldo de `$500.00 USD`, es VIP (`true`). Dispara automaticamente un Descuento VIP del 10% acumulable en el subtotal.
3. **Carlos Ruiz (Sin Saldo)**: Saldo de `$0.00 USD`. Dispara una excepcion didactica de Saldo Insuficiente coordinada por `ProcesadorPagoService`.
4. **Pedro Gomez (Alto Riesgo)**: Saldo de `$2000.00 USD`, riesgo del `90%`. Dispara una excepcion de Prevencion de Fraude coordinada por `ValidadorFraudeService` (bloquea a usuarios con riesgo mayor a 80%).

### Productos de Prueba

- **Laptop Gamer (ID: 101)**: Precio `$1200.00 USD`, stock inicial `5` unidades. Envio nacional sin restricciones.
- **Mouse Optico (ID: 102)**: Precio `$20.00 USD`, stock inicial `0` unidades. Dispara una excepcion de Stock Insuficiente dentro de la entidad `Producto`.
- **Bateria de Litio (ID: 103)**: Precio `$80.00 USD`, stock inicial `10` unidades, marcada como restringida para envio aereo. Dispara una excepcion de Restriccion de Envio en `CalculadorEnvioService`.

### Reglas Geograficas e Internacionales

- Ecuador se considera el pais origen.
- Si cambias el pais en la direccion (ej: Colombia, Espana), se disparara un recargo de envio de `+$15.00 USD` gestionado por `CalculadorEnvioService`.
- Si el total de una compra internacional supera los `$1000.00 USD`, el `ValidadorFraudeService` bloqueara la transaccion, requiriendo verificacion aduanera fisica.

### Conversion Monetaria y Tipos de Cambio

- Si seleccionas una moneda distinta al USD (como EUR, COP, MXN, CLP), el frontend simulara la tasa de cambio con el backend, mostrando el monto exacto debitado en la divisa preferida.

---

## Domain Services Implementados

1. **CalculadorDescuentoService** -- Aplica descuentos VIP y por cupon
2. **CalculadorEnvioService** -- Calcula costos de envio con validacion de restricciones
3. **ValidadorFraudeService** -- Valida montos, niveles de riesgo y limites internacionales
4. **ProcesadorPagoService** -- Coordina pagos entre Usuario y Value Object Pago
5. **ConversorMonedaService** -- Convierte divisas mediante interface inyectada

---

## Value Objects

- **Direccion** -- Ubicacion de entrega con validacion de campos obligatorios
- **Pago** -- Transaccion inmutable con estados (PENDIENTE, APROBADO, RECHAZADO)
- **OrdenItem** -- Snapshot de producto en orden con calculos de subtotal e impuestos
- **Moneda** -- Divisa con tasa de cambio
- **Cupon** -- Beneficio con porcentaje de descuento y monto minimo

---

## Estructura de Carpetas

```
backend/src/
  domain/
    entities/          -- Entidades ricas (Usuario, Producto, Orden)
    value-objects/     -- Objetos de valor inmutables (Direccion, Pago, Cupon, etc.)
    services/          -- Domain Services puros
    interfaces/        -- Puertos para infraestructura
    exceptions/        -- DomainException pedagogico
  application/
    services/          -- Casos de uso (CheckoutApplicationService)
    dtos/              -- Data Transfer Objects
  infrastructure/
    repositories/      -- Implementaciones en memoria
    providers/         -- Adaptadores externos (tipo de cambio)
  presentation/
    controllers/       -- Controladores HTTP (NestJS)

frontend/src/
  App.tsx              -- Interfaz interactiva principal
  lib/checkoutLogic.ts -- Logica de calculo en frontend
  types/checkout.ts    -- Definiciones de tipos
```

---

## Tecnologias

**Backend:**
- NestJS (framework Node.js con arquitectura de modulos)
- TypeScript (tipado estatico)
- Arquitectura de capas: Presentation, Application, Domain, Infrastructure

**Frontend:**
- React 19 + Vite
- Tailwind CSS v4
- Lucide React (iconografia)
