# Laboratorio Académico: Modelo de Dominio Anémico (Antipatrón)

Esta rama (**`Anemico`**) contiene el código base original de la aplicación, el cual implementa el antipatrón de diseño conocido como **Modelo de Dominio Anémico** (Anemic Domain Model). 

El propósito de este código es netamente didáctico y académico: ilustrar las malas prácticas de diseño en proyectos orientados a objetos antes de realizar una refactorización guiada por **Domain-Driven Design (DDD)** e inyección de dependencias en la rama **`DomainService`**.

---

## ⚠️ Los 4 Fallos de Diseño Críticos en esta Rama

Para tu defensa académica o presentación, estos son los puntos clave que demuestran por qué este diseño es ineficiente y propenso a errores:

### 1. Entidades "Tontas" (Bolsas de Datos)
Las clases de dominio como [Producto.ts](file:///c:/Users/User/Documents/AnemicoVsDomainService/ecommerce-ddd/src/domain/entities/Producto.ts) o [Usuario.ts](file:///c:/Users/User/Documents/AnemicoVsDomainService/ecommerce-ddd/src/domain/entities/Usuario.ts) solo contienen atributos públicos y constructores simples.
* **Problema**: Carecen por completo de comportamiento y encapsulamiento. No autoprotegen sus reglas de negocio al instanciarse.

### 2. Violación del Principio "Tell, Don't Ask" (Dile al objeto qué hacer, no le preguntes su estado)
El servicio de aplicación [CheckoutApplicationService.ts](file:///c:/Users/User/Documents/AnemicoVsDomainService/ecommerce-ddd/src/application/services/CheckoutApplicationService.ts) tiene que "inspeccionar" el stock de los productos y el saldo de la billetera del usuario desde el exterior mediante condicionales antes de poder realizar cualquier operación.

### 3. Mutación Insegura de Estado desde el Exterior
El servicio de aplicación es quien modifica manualmente el estado interno de las entidades:
```typescript
producto.stock = producto.stock - 1; // ❌ Mutación directa externa
usuario.saldo = usuario.saldo - total; // ❌ Violación de límites de agregados
```
* **Problema**: Si el desarrollador olvida colocar esta lógica en un nuevo servicio, el sistema podría permitir compras con stocks negativos o saldos insuficientes. El control de integridad queda disperso y depende del caso de uso.

### 4. Mutación Efímera en Memoria (Nula Persistencia)
Dado que el controlador [checkout.controller.ts](file:///c:/Users/User/Documents/AnemicoVsDomainService/ecommerce-ddd/src/presentation/controllers/checkout.controller.ts) recibe los datos completos del usuario y el producto directamente del cuerpo JSON del cliente (HTTP Request):
* El cliente (Postman) es quien le miente al servidor sobre el estado de su billetera.
* Al terminar el ciclo de vida de la petición HTTP, todos los cambios en memoria desaparecen. No hay persistencia centralizada en el backend.

---

## 🧪 Cómo Simularlo en Postman (Petición Rápida)

Para probar la ruta de esta rama, inicia el servidor en desarrollo (`npm run start:dev` desde la raíz de esta rama) y realiza la siguiente petición en Postman:

* **Método**: `POST`
* **URL**: `http://localhost:3000/checkout`
* **Headers**: `Content-Type: application/json`
* **Cuerpo (JSON)**:
```json
{
  "usuario": {
    "id": 100,
    "nombre": "Juan Pérez",
    "saldo": 1500,
    "puntosFidelidad": 0,
    "esVip": true
  },
  "productos": [
    {
      "id": 101,
      "nombre": "Laptop Gamer",
      "precio": 1200,
      "stock": 5,
      "peso": 2.5,
      "categoria": "TECNOLOGIA"
    }
  ],
  "envio": {
    "costo": 20
  },
  "cupon": null
}
```

* **Comportamiento Anémico**: El JSON de arriba define dinámicamente el estado. Si cambias `"saldo": 1500` por `"saldo": 0` en el cuerpo del JSON, la petición fallará con `"Saldo insuficiente"`. Esto evidencia que **el cliente tiene control total de la base de datos**, lo cual es un fallo de seguridad y diseño gravísimo.

---

## 📊 Tabla Comparativa: Rama `Anemico` vs. Rama `DomainService`

| Aspecto Arquitectónico | Rama `Anemico` (Procedural) | Rama `DomainService` (DDD Rico) |
| :--- | :--- | :--- |
| **Entidades de Dominio** | **Anémicas** (bolsas de datos con atributos públicos). | **Ricas** (comportamiento encapsulado y autovalidaciones). |
| **Validación de Invariantes** | Dispersa en el caso de uso (Capa de Aplicación). | Interna dentro de cada entidad (ej. `Producto.descontarStock()`). |
| **Lógica entre Entidades** | Acoplada proceduralmente en el servicio de aplicación. | Resuelta elegantemente en **Domain Services** desacoplados. |
| **Inversión de Control (IoC)**| Acoplamiento directo sin abstracción de interfaces. | Inyección de interfaces (`IUsuarioRepository`, `IProveedorCambioMoneda`). |
| **Persistencia** | Inexistente (el JSON define el estado del dominio). | **InMemory Repositories** en memoria con **clonación profunda** resiliencia a abortos. |
| **Experiencia Didáctica** | Ninguna (fallos genéricos HTTP sin explicación). | **Pedagogical Trace** que dibuja el flujo o la excepción con fragmentos de código. |
