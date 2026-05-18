# 🎓 Laboratorio de Diseño Orientado a Dominio (DDD)

Este proyecto académico ha sido estructurado y refactorizado profesionalmente aplicando **Domain-Driven Design (DDD)** sobre **NestJS** en el backend y una interfaz interactiva de alta fidelidad en **React + Tailwind CSS** en el frontend.

El propósito principal es contrastar un **Modelo de Dominio Anémico** frente a un **Modelo de Dominio Rico (Modelo Enriquecido)**, visualizando en tiempo real cómo las entidades y los servicios de dominio validan las reglas de negocio e invariantes.

---

## 📂 Estructura del Proyecto

El proyecto está dividido limpiamente en dos componentes independientes en la raíz de `ecommerce-ddd`:

*   [`/backend`](file:///c:/Users/User/Documents/AnemicoVsDomainService/ecommerce-ddd/backend): Servidor NestJS (TypeScript) que expone las API comerciales, gestiona la persistencia en memoria y acumula trazas pedagógicas de ejecución.
*   [`/frontend`](file:///c:/Users/User/Documents/AnemicoVsDomainService/ecommerce-ddd/frontend): Cliente React + Vite + Tailwind CSS v4, que renderiza la **Factura Interactiva** y el terminal de diagnósticos de dominio.

---

## 🚀 Cómo Iniciar el Laboratorio

### 1. Iniciar el Servidor de Backend
Abre una terminal en el directorio del backend y ejecuta:
```bash
cd backend
npm run start:dev
```
*   El backend se ejecutará en: `http://localhost:3000`
*   Verifica su estado accediendo a: `http://localhost:3000/health` (debería responder `ok`).

### 2. Iniciar el Servidor de Frontend
Abre otra terminal independiente en el directorio del frontend y ejecuta:
```bash
cd frontend
npm run dev
```
*   El frontend se levantará en: `http://localhost:5173` (o el puerto que te indique la consola).
*   ¡Abre tu navegador en esa URL para comenzar a jugar con las reglas!

---

## 🧠 Escenarios Didácticos Preconfigurados para Pruebas

Para evidenciar la robustez y control de las **Entidades Ricas** y **Servicios de Dominio**, la aplicación cuenta con datos precargados en memoria que puedes probar con un simple clic desde la interfaz:

### 👤 Usuarios de Prueba (Buzón de Billetera y Fraude)
1.  **Juan Pérez (Usuario Estándar)**: Saldo de `$1000.00 USD`, nivel de riesgo `10%`. Transacción normal y exitosa.
2.  **María López (Usuario VIP)**: Saldo de `$500.00 USD`, es VIP (`true`). Dispara automáticamente un **Descuento VIP del 10%** acumulable en el subtotal.
3.  **Carlos Ruiz (Sin Saldo)**: Saldo de `$0.00 USD`. Dispara una excepción didáctica de **Saldo Insuficiente** coordinada por `ProcesadorPagoService`.
4.  **Pedro Gómez (Alto Riesgo)**: Saldo de `$2000.00 USD`, riesgo del `90%`. Dispara una excepción de **Prevención de Fraude** coordinada por `ValidadorFraudeService` (bloquea a usuarios con riesgo > 80%).

### 📦 Productos de Prueba (Inventario y Logística)
*   **Laptop Gamer (ID: 101)**: Precio `$1200.00 USD`, stock inicial `5` unidades. Envío nacional sin restricciones.
*   **Mouse Óptico (ID: 102)**: Precio `$20.00 USD`, stock inicial `0` unidades. Dispara instantáneamente una excepción de **Stock Insuficiente** dentro de la entidad `Producto`.
*   **Batería de Litio (ID: 103)**: Precio `$80.00 USD`, stock inicial `10` unidades, pero marcada como **restringida para envío aéreo** en aduanas. Dispara una excepción de **Restricción de Envío** en `CalculadorEnvioService`.

### 🌍 Reglas Geográficas e Internacionales (Value Object Dirección)
*   Ecuador se considera el país origen.
*   Si cambias el país en la dirección (ej: Colombia, España), se disparará un recargo de envío de **+$15.00 USD** gestionado por `CalculadorEnvioService`.
*   Si el total de una compra internacional supera los `$1000.00 USD`, el `ValidadorFraudeService` bloqueará la transacción, requiriendo verificación aduanera física.

### 💱 Conversión Monetaria y Tipos de Cambio (Offline)
*   Si seleccionas una moneda distinta al USD (como EUR, COP, MXN, CLP), el frontend simulará la tasa de cambio con el backend, mostrando el monto exacto debitado en la divisa preferida.
