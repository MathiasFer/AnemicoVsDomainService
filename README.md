# Laboratorio Academico: Modelo Anemico vs Domain Service

Proyecto de demostracion academica que contrasta dos enfoques de diseño de software orientado a objetos: el **Modelo de Dominio Anemico** (antipatron) frente al **Domain-Driven Design con Domain Services** (patron recomendado).

El objetivo es evidenciar, mediante codigo funcional y una interfaz interactiva, las diferencias arquitectonicas, de mantenibilidad y de robustez entre ambos enfoques en un escenario de comercio electronico.

---

## Estructura del Repositorio

El proyecto se organiza en tres ramas principales, cada una con un proposito especifico:

| Rama | Contenido | Proposito |
|:---|:---|:---|
| `main` | Este archivo y estructura general | Punto de entrada y documentacion central |
| `Anemico` | Backend NestJS sin separacion de responsabilidades | Ejemplificar el antipatron Modelo Anemico |
| `DomainService` | Backend NestJS + Frontend React con DDD completo | Demostrar la solucion con Domain Services |

---

## Ramas del Proyecto

### Rama `Anemico` -- El Problema

Implementa un sistema de checkout donde toda la logica de negocio vive en un unico servicio de aplicacion. Las entidades son meras estructuras de datos sin comportamiento.

**Caracteristicas:**
- Entidades con getters y setters publicos sin validacion
- Logica de negocio dispersa en el servicio de aplicacion
- Sin Value Objects, sin Domain Services, sin interfaces
- Validaciones genericas de HTTP sin trazabilidad
- El cliente define el estado del dominio via JSON

### Rama `DomainService` -- La Solucion

Reestructura el mismo sistema aplicando los principios de Domain-Driven Design con una arquitectura de capas clara y entidades ricas con comportamiento.

**Caracteristicas:**
- Entidades con invariantes autovalidados (Usuario, Producto, Orden)
- 5 Domain Services puros con responsabilidad unica
- Value Objects inmutables con validacion en constructor
- Interfaces para desacoplamiento de infraestructura
- Excepciones de dominio con metadatos pedagogicos
- Frontend interactivo que visualiza cada paso del patron

---

## Comparacion Arquitectonica

| Aspecto | Modelo Anemico | Domain Service |
|:---|:---|:---|
| **Entidades** | Bolsas de datos sin comportamiento | Entidades ricas con invariantes |
| **Validacion** | Dispersa en capa de aplicacion | Interna en cada entidad |
| **Logica entre entidades** | Acoplada proceduralmente | Resuelta en Domain Services |
| **Inyeccion de dependencias** | Sin abstracciones | Interfaces (IUsuarioRepository, etc.) |
| **Persistencia** | Inexistente (estado en JSON del cliente) | Repositorios en memoria con persistencia |
| **Excepciones** | Genericas HTTP | DomainException con trazabilidad pedagogica |
| **Valor object** | No existen | Direccion, Pago, OrdenItem, Moneda, Cupon |
| **Domain Services** | No existen | CalculadorDescuento, CalculadorEnvio, ValidadorFraude, ProcesadorPago, ConversorMoneda |

---

## Tecnologias Utilizadas

**Backend:**
- NestJS (framework Node.js con arquitectura de modulos)
- TypeScript (tipado estatico)
- Arquitectura de capas: Presentation, Application, Domain, Infrastructure

**Frontend (rama DomainService):**
- React 19 + Vite
- Tailwind CSS v4
- Lucide React (iconografia)

---

## Como Ejecutar

### Rama Anemico

```bash
git checkout Anemico
npm install
npm run start:dev
```

El servidor estara disponible en `http://localhost:3000`. Se expone un unico endpoint POST `/checkout` para pruebas con Postman.

### Rama DomainService

```bash
git checkout DomainService
```

**Backend:**
```bash
cd backend
npm install
npm run start:dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

El backend estara en `http://localhost:3000` y el frontend en `http://localhost:5173`.

---

## Escenarios de Prueba Preconfigurados

### Usuarios (ramas DomainService)

| Usuario | Saldo | VIP | Riesgo | Escenario |
|:---|:---|:---|:---|:---|
| Juan Perez | $1000 | No | 10% | Transaccion exitosa |
| Maria Lopez | $500 | Si | 15% | Descuento VIP automatico del 10% |
| Carlos Ruiz | $0 | No | 20% | Saldo insuficiente (ProcesadorPagoService) |
| Pedro Gomez | $2000 | No | 90% | Bloqueo por fraude (ValidadorFraudeService) |

### Productos

| Producto | Precio | Stock | Restriccion |
|:---|:---|:---|:---|
| Laptop Gamer | $1200 | 5 | Ninguna |
| Mouse Optico | $20 | 0 | Stock insuficiente |
| Bateria de Litio | $80 | 10 | Envio restringido |

---

## Domain Services Implementados

1. **CalculadorDescuentoService** -- Aplica descuentos VIP y por cupon
2. **CalculadorEnvioService** -- Calcula costos de envio con validacion de restricciones
3. **ValidadorFraudeService** -- Valida montos, niveles de riesgo y limites internacionales
4. **ProcesadorPagoService** -- Coordina pagos entre Usuario y Value Object Pago
5. **ConversorMonedaService** -- Convierte divisas mediante interface inyectada

---

## Estructura de Carpetas (rama DomainService)

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

## Licencia

Proyecto academico para fines de demostracion y presentacion.
