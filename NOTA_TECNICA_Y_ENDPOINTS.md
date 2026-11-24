# NOTA TÉCNICA Y DOCUMENTACIÓN DE ENDPOINTS
## Proyecto: Marketing Manager - Web Innovasoft
**Ubicación del proyecto:** `C:\Users\sseba\Desktop\Web-Innovasoft\web-proyectp`  
**API REST consumida exclusivamente:** `https://fakestoreapi.com/users`  
**Tecnología:** Angular 22 (Standalone Components, Signals, Router Guards, HttpClient con Fetch), Bootstrap 5 y Bootstrap Icons.

---

## 1. Login y Registro de Usuarios Básico

### 1.1 Formularios y Validaciones
- **Inicio de Sesión (`/gestion-interna`):**
  - Validación de usuario o correo electrónico (requerido).
  - Validación de contraseña (mínimo 4 caracteres, requerida).
  - Botón de alternancia para ver/ocultar contraseña (icono de ojo).
  -           - Mensajes de error claros e informativos si las credenciales no coinciden.
- **Registro de Usuarios:**
  - Campos: Nombre, Apellidos, Nombre de usuario (mínimo 3 caracteres), Correo electrónico, Contraseña (mínimo 6 caracteres), Confirmación de contraseña (validación de coincidencia exacta), Teléfono, Ciudad y Selección de Rol (`usuario` o `admin`).
  - **Correo Único:** Verificación obligatoria contra la base de usuarios existente antes de registrar; si el correo ya existe, se rechaza la operación con una advertencia visible.
  - **Hash de Contraseña Criptográfico:** La contraseña se cifra mediante la **Web Crypto API nativa del navegador con algoritmo SHA-256 (`crypto.subtle.digest('SHA-256')`)** antes de ser persistida.
- **Recuperación de Contraseña:**
  - Formulario integrado con validación de correo registrado.
  - Generación de token temporal de restablecimiento (ej: `REC-XXXXXX`) con feedback visual de confirmación.
- **Sesión y Logout:**
  - Creación de token de sesión simulado (formato JWT estructurado con firma y expiración de 24 horas).
  - Persistencia de sesión en `localStorage` (`marketing_manager_session`).
  - Botón de **Cerrar Sesión** visible en el panel superior, el cual destruye el token, limpia el estado reactivo (`AuthService.currentUser`) y redirige al login con notificación.

---

## 2. Panel Administrativo (CRUD's)

### 2.1 Ruta Protegida y Control de Acceso
- Ruta: `/panel-interno`
- Protegida mediante `authGuard` funcional en Angular. Si un usuario no autenticado intenta ingresar directamente, es redirigido a `/gestion-interna?unauthorized=true`.
- **Control de Roles:**
  - `admin`: Permiso total para Listar, Buscar, Crear, Editar y Eliminar usuarios, además de alternar roles.
  - `usuario`: Modo consulta y creación. Las acciones de eliminación están restringidas y advertidas si no posee privilegios administrativos.

### 2.2 Funcionalidades CRUD y Bitácora
1. **Listar:**
   - Tabla responsiva y moderna con avatares generados por iniciales, nombre completo, nombre de usuario, correo con enlace mailto, teléfono, ciudad, badge de rol y bitácora.
2. **Buscar:**
   - Barra de búsqueda reactiva en tiempo real que filtra instantáneamente por nombre, apellido, username, correo electrónico, ciudad o teléfono.
   - Filtro complementario por Rol (`Todos`, `Solo Administradores`, `Solo Usuarios`).
3. **Paginación:**
   - Selector configurable de registros por página (5, 10, 20).
   - Botones de Primera página (`«`), Anterior (`‹`), números de página, Siguiente (`›`) y Última página (`»`).
   - Indicador de estado: *"Mostrando X a Y de Z usuarios"*.
4. **Crear (POST):**
   - Modal interactivo con validación de datos en el cliente.
   - Ejecuta petición HTTP `POST https://fakestoreapi.com/users`.
   - Asigna automáticamente la bitácora: fecha/hora ISO actual y usuario activo como autor.
5. **Editar (PUT):**
   - Modal pre-poblado con los datos del usuario seleccionado.
   - Permite actualizar datos personales, dirección, rol y opcionalmente re-hashear una nueva contraseña con SHA-256.
   - Ejecuta petición HTTP `PUT https://fakestoreapi.com/users/:id`.
   - Actualiza la bitácora con la fecha exacta y el usuario que realizó la modificación.
6. **Eliminar (DELETE) con Modal de Confirmación:**
   - Modal de advertencia que muestra los datos del usuario a eliminar e informa que la acción es irreversible.
   - Ejecuta petición HTTP `DELETE https://fakestoreapi.com/users/:id`.
   - Remueve el registro de la tabla y del almacenamiento persistente.
7. **Bitácora por Registro:**
   - Cada fila y modal de detalle muestra:
     - **Fecha de última modificación:** Formateada en hora local (ej. `11 nov 2026, 10:15:30`).
     - **Usuario de última modificación:** Badge con el username del autor (ej. `admin`, `sistema` o `usuario_creador`).
8. **Feedback Visible (Sistema de Toasts):**
   - Notificaciones emergentes automáticas en la esquina inferior derecha con colores semánticos:
     - Verde (Éxito): Usuario creado, editado, eliminado o API sincronizada.
     - Rojo (Error): Fallo de conexión o validación.
     - Amarillo (Advertencia): Restricción de permisos.

---

## 3. Landing

Página pública responsiva (`/`) con propuesta de valor integral:
1. **Navbar:**
   - Logo institucional, navegación anclada suave, estado de sesión dinámico (muestra *"Iniciar Sesión"* o *"Panel (username)"*).
2. **Hero Section:**
   - Título de alto impacto: *"Impulsa tu negocio al siguiente nivel"*.
   - Propuesta de valor clara enfocada en resultados comerciales.
   - Botones CTA: *"Descubre Nuestros Servicios"* y *"Hablemos"*.
3. **Propuesta de Valor & Soluciones (con imágenes optimizadas):**
   - Estrategia Digital 360° (uso de `img1.jpeg`).
   - Paid Media de Alto Retorno - Más solicitado (uso de `img2.jpeg`).
   - Desarrollo Web & SEO  (uso de `img3.jpeg`).
4. **Métricas de Impacto / KPIs:**
   - `+500K` Leads y contactos generados.
   - `3.8x` Retorno promedio de inversión (ROI).
   - `98.4%` Tasa de retención de clientes.
   - `+12` Ciudades atendidas.
5. **Testimonios Reales con Métricas:**
   - 3 casos de éxito de directores comerciales con métricas medibles (`+340% Conversión`, `ROI 4.2x`, `-45% CAC`).
6. **Planes y Precios:**
   - Básico ($299/mes), Profesional ($599/mes - Destacado) y Corporativo (A Medida).
7. **Formulario de Captura de Leads:**
   - Formulario interactivo con validaciones en cliente (Nombre, Correo corporativo, Teléfono, Servicio, Mensaje).
   - Feedback instantáneo de confirmación tras el envío sin recargar la página.
8. **Alianza Estratégica & Footer:**
   - Mención y enlace oficial a la alianza con **Branding Digital** (`https://brandingdigital.com.mx/`).
   - Enlaces de navegación y acceso directo a la gestión interna.

---

## 4. Consumo de API's REST (FakeStoreAPI)

### 4.1 Endpoints Implementados

| Método | Endpoint | Descripción | Estado Esperado |
|---|---|---|---|
| **GET** | `https://fakestoreapi.com/users` | Lista todos los usuarios para la tabla CRUD | `200 OK` |
| **GET** | `https://fakestoreapi.com/users/:id` | Obtiene el detalle de un usuario por su ID | `200 OK` |
| **POST** | `https://fakestoreapi.com/users` | Crea un nuevo usuario enviando payload JSON | `200 OK` / `201 Created` |
| **PUT** | `https://fakestoreapi.com/users/:id` | Actualiza los datos de un usuario existente | `200 OK` |
| **DELETE** | `https://fakestoreapi.com/users/:id` | Elimina un usuario por su ID | `200 OK` |

### 4.2 Manejo de Estados y Errores
- **Indicadores de Carga:** Spinners en tablas y botones durante llamadas asíncronas (`isLoading`, `modalSubmitting`, `isDeleting`).
- **Manejo de Errores:** Interceptación de `HttpErrorResponse` con fallback automático a la caché de `localStorage` para garantizar disponibilidad continua incluso ante caídas de red externas.
- **Validación Previa:** Verificación estricta de tipos y campos obligatorios antes de disparar las peticiones HTTP.

---

## 5. Esquema de Datos (Data Schema)

### 5.1 Definición TypeScript (`src/app/models/user.model.ts`)
```typescript
export interface UserGeolocation {
  lat: string;
  long: string;
}

export interface UserAddress {
  city?: string;
  street?: string;
  number?: number;
  zipcode?: string;
  geolocation?: UserGeolocation;
}

export interface UserName {
  firstname: string;
  lastname: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  password?: string;
  passwordHash?: string; // Hash SHA-256 nativo
  name: UserName;
  phone?: string;
  address?: UserAddress;
  role?: 'admin' | 'usuario';
  lastModified?: string; // Fecha ISO de auditoría
  lastModifiedBy?: string; // Usuario autor de auditoría
  __v?: number;
}

export interface AuthSession {
  token: string;
  user: User;
  loginTime: string;
  expiresAt: string;
}
```

### 5.2 JSON Schema (IETF)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "User",
  "type": "object",
  "required": ["id", "email", "username", "name"],
  "properties": {
    "id": { "type": "integer" },
    "email": { "type": "string", "format": "email" },
    "username": { "type": "string", "minLength": 3 },
    "password": { "type": "string" },
    "passwordHash": { "type": "string" },
    "name": {
      "type": "object",
      "required": ["firstname", "lastname"],
      "properties": {
        "firstname": { "type": "string" },
        "lastname": { "type": "string" }
      }
    },
    "phone": { "type": "string" },
    "address": {
      "type": "object",
      "properties": {
        "city": { "type": "string" },
        "street": { "type": "string" },
        "number": { "type": "number" },
        "zipcode": { "type": "string" },
        "geolocation": {
          "type": "object",
          "properties": {
            "lat": { "type": "string" },
            "long": { "type": "string" }
          }
        }
      }
    },
    "role": { "type": "string", "enum": ["admin", "usuario"] },
    "lastModified": { "type": "string", "format": "date-time" },
    "lastModifiedBy": { "type": "string" }
  }
}
```

---

## 6. Archivos Entregados para Pruebas

Los siguientes archivos se encuentran ubicados directamente en la raíz de `C:\Users\sseba\Desktop\Web-Innovasoft\web-proyectp`:

1. **`fakestore-api-endpoints.json`**: Especificación formal de todos los endpoints, parámetros, cabeceras y códigos de respuesta.
2. **`fakestore-api-response-sample.json`**: Respuestas JSON reales obtenidas durante las pruebas de los métodos GET, POST, PUT y DELETE.
3. **`fakestore-users.postman_collection.json`**: Colección v2.1 para importar en **Postman** o **Insomnia**, con tests automatizados integrados y variables de entorno (`{{base_url}}`).
4. **`NOTA_TECNICA_Y_ENDPOINTS.md`**: Esta nota técnica completa con rutas, endpoints y esquemas.

---

## 7. Instrucciones para Ejecutar el Proyecto
Para iniciar la aplicación en el servidor local de desarrollo:

```bash
cd "C:\Users\sseba\Desktop\Web-Innovasoft"
npm start
```
*O alternativamente:*
```bash
npx ng serve web-proyectp
```

La aplicación estará disponible en `http://localhost:4200/`.
- Landing: `http://localhost:4200/`
- Login y Registro: `http://localhost:4200/gestion-interna`
- Panel Administrativo: `http://localhost:4200/panel-interno` (requiere login)
