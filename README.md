# Laboratorio Academico: Modelo de Dominio Anemico (Antipatron)

Esta rama (**`Anemico`**) contiene el codigo base original de la aplicacion, el cual implementa el antipatron de diseno conocido como **Modelo de Dominio Anemico** (Anemic Domain Model).

El proposito de este codigo es netamente didactico y academico: ilustrar las malas practicas de diseno en proyectos orientados a objetos antes de realizar una refactorizacion guiada por **Domain-Driven Design (DDD)** e inyeccion de dependencias en la rama **`DomainService`**.

---

## Los 4 Fallos de Diseno Criticos en esta Rama

Para tu defensa academica o presentacion, estos son los puntos clave que demuestran por que este diseno es ineficiente y propenso a errores:

### 1. Entidades "Tontas" (Bolsas de Datos)

Las clases de dominio como `Producto.ts` o `Usuario.ts` solo contienen atributos privados con getters y setters publicos sin validacion.

- **Problema**: Carecen por completo de comportamiento y encapsulamiento. No autoprotegen sus reglas de negocio al instanciarse. El setter de stock permite modificar el valor sin ninguna regla de negocio, dejando el control y la responsabilidad al servicio externo.

### 2. Violacion del Principio "Tell, Don't Ask"

El servicio de aplicacion `CheckoutApplicationService.ts` tiene que "inspeccionar" el stock de los productos y el saldo del usuario desde el exterior mediante condicionales antes de poder realizar cualquier operacion.

### 3. Mutacion Insegura de Estado desde el Exterior

El servicio de aplicacion es quien modifica manualmente el estado interno de las entidades:

```typescript
producto.setStock(producto.getStock() - 1); // Mutacion directa externa
usuario.setSaldo(usuario.getSaldo() - total); // Violacion de limites de agregados
```

- **Problema**: Si el desarrollador olvida colocar esta logica en un nuevo servicio, el sistema podria permitir compras con stocks negativos o saldos insuficientes. El control de integridad queda disperso y depende del caso de uso.

### 4. Mutacion Efimera en Memoria (Nula Persistencia)

Dado que el controlador `checkout.controller.ts` recibe los datos completos del usuario y el producto directamente del cuerpo JSON del cliente (HTTP Request):

- El cliente (Postman) es quien define el estado del dominio.
- Al terminar el ciclo de vida de la peticion HTTP, todos los cambios en memoria desaparecen. No hay persistencia centralizada en el backend.

---

## Como Simularlo en Postman

Para probar la ruta de esta rama, inicia el servidor en desarrollo (`npm run start:dev` desde la raiz de esta rama) y realiza la siguiente peticion en Postman:

- **Metodo**: `POST`
- **URL**: `http://localhost:3000/checkout`
- **Headers**: `Content-Type: application/json`
- **Cuerpo (JSON)**:

```json
{
  "usuario": {
    "id": 100,
    "nombre": "Juan Perez",
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

- **Comportamiento Anemico**: El JSON de arriba define dinamicamente el estado. Si cambias `"saldo": 1500` por `"saldo": 0` en el cuerpo del JSON, la peticion fallara con `"Saldo insuficiente"`. Esto evidencia que **el cliente tiene control total de la base de datos**, lo cual es un fallo de seguridad y diseno.

---

## Tabla Comparativa: Rama `Anemico` vs. Rama `DomainService`

| Aspecto Arquitectonico | Rama `Anemico` (Procedural) | Rama `DomainService` (DDD Rico) |
| :--- | :--- | :--- |
| **Entidades de Dominio** | Anemicas (bolsas de datos con atributos publicos). | Ricas (comportamiento encapsulado y autovalidaciones). |
| **Validacion de Invariantes** | Dispersa en el caso de uso (Capa de Aplicacion). | Interna dentro de cada entidad (ej. `Producto.descontarStock()`). |
| **Logica entre Entidades** | Acoplada proceduralmente en el servicio de aplicacion. | Resuelta en Domain Services desacoplados. |
| **Inversion de Control (IoC)** | Acoplamiento directo sin abstraccion de interfaces. | Inyeccion de interfaces (`IUsuarioRepository`, `IProveedorCambioMoneda`). |
| **Persistencia** | Inexistente (el JSON define el estado del dominio). | Repositorios en memoria con persistencia. |
| **Experiencia Didactica** | Ninguna (fallos genericos HTTP sin explicacion). | Pedagogical Trace que dibuja el flujo o la excepcion con fragmentos de codigo. |

---

## Estructura de Carpetas

```
src/
  domain/
    entities/          -- Entidades (Usuario, Producto, Orden, Cupon, Envio)
  application/
    services/          -- Caso de uso (CheckoutApplicationService)
  presentation/
    controllers/       -- Controladores HTTP (NestJS)
```

---

## Tecnologias

- NestJS (framework Node.js con arquitectura de modulos)
- TypeScript (tipado estatico)
- Arquitectura plana sin separacion de responsabilidades
