# Integración Frontend ↔ Backend

## Base URL

| Entorno     | URL                          |
|-------------|------------------------------|
| Desarrollo  | `http://localhost:8080/api`  |
| Producción  | `http://dominio.com/api`     |

Definida en `src/environments/environment.ts` y `environment.prod.ts`.

---

## Interceptor de autenticación

**Archivo:** `src/app/core/interceptors/auth.interceptor.ts`

Añade automáticamente el header `Authorization: Bearer <token>` a **todas** las peticiones HTTP cuando hay un token en memoria. Se registra globalmente en `app.config.ts` mediante `withInterceptors([authInterceptor])`.

---

## Guard de rutas

**Archivo:** `src/app/core/auth/guards/auth.guard.ts`

Protege las rutas del layout principal. Verifica que el usuario esté autenticado (`accessToken` presente) **y** que el token no haya expirado. Si falla alguna condición, redirige a `/auth/login`.

> Las rutas `roles` y `usuarios` tienen el guard comentado actualmente (`// canActivate: [authGuard]`).

---

## Endpoints consumidos

### Autenticación

**Servicio:** `src/app/core/auth/services/auth.service.ts`

| Método | Endpoint           | Descripción                        |
|--------|--------------------|------------------------------------|
| POST   | `/auth/login`      | Inicia sesión, recibe JWT          |

**Request:**
```json
{ "username": "string", "password": "string" }
```

**Response:**
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "tokenType": "string",
  "expiresIn": 3600000
}
```

El token JWT se decodifica en el cliente para extraer `sub` (username) y `roles`. Se persiste en `localStorage` junto con `expiresAt`.

---

### Usuarios

**Servicio:** `src/app/features/users/services/user.service.ts`  
**Base:** `/module_users/users`

| Método | Endpoint                  | Descripción              |
|--------|---------------------------|--------------------------|
| GET    | `/module_users/users`     | Listar todos los usuarios |
| GET    | `/module_users/users/{id}` | Obtener usuario por ID   |
| POST   | `/module_users/users`     | Crear nuevo usuario      |
| PUT    | `/module_users/users/{id}` | Actualizar usuario       |
| DELETE | `/module_users/users/{id}` | Eliminar usuario         |

**Modelo de respuesta (`User`):**
```typescript
// src/app/features/users/models/user.model.ts
{
  id:              number;
  username:        string;
  email:           string;
  firstName:       string;
  lastName:        string;
  phone?:          string;
  documentType?:   string;
  documentNumber?: string;
  gender?:         string;
  isActive:        boolean;
  rolesIds:        number[];   // IDs de roles asignados
}
```

**Body para crear (`CreateUserRequest`):**
```typescript
{
  email:           string;
  firstName:       string;
  lastName:        string;
  password:        string;
  rolesIds:        number[];
  documentType?:   string;
  documentNumber?: string;
  phone?:          string;
  gender?:         string;
}
```

**Body para actualizar (`UpdateUserRequest`):**
```typescript
{
  firstName:       string;
  lastName:        string;
  isActive:        boolean;
  rolesIds:        number[];
  documentType?:   string;
  documentNumber?: string;
  phone?:          string;
}
```

**Autoridades requeridas (backend):** `USER_CREATE`, `USER_READ`, `USER_UPDATE`, `USER_DELETE`

---

### Roles

**Servicio:** `src/app/features/roles/services/roles.service.ts`  
**Base:** `/module_users/roles`

| Método | Endpoint                   | Descripción            |
|--------|----------------------------|------------------------|
| GET    | `/module_users/roles`      | Listar todos los roles |
| GET    | `/module_users/roles/{id}` | Obtener rol por ID     |
| POST   | `/module_users/roles`      | Crear nuevo rol        |
| PUT    | `/module_users/roles/{id}` | Actualizar rol         |
| DELETE | `/module_users/roles/{id}` | Eliminar rol           |

**Modelo de respuesta (`Role`):**
```typescript
// src/app/features/roles/models/role.models.ts
{
  id:             number;
  name:           string;
  description:    string;
  active:         boolean;
  permissionsIds: number[];   // IDs de permisos asignados
}
```

**Body para crear (`CreateRoleRequest`):**
```typescript
{
  name:           string;
  description:    string;
  permissionsIds: number[];
}
```

**Body para actualizar (`UpdateRoleRequest`):**
```typescript
{
  name:           string;
  description:    string;
  active:         boolean;
  permissionsIds: number[];
}
```

---

### Permisos

**Servicio:** `src/app/features/permissions/services/permissions.service.ts`  
**Base:** `/module_users/permissions`

| Método | Endpoint                          | Descripción                |
|--------|-----------------------------------|----------------------------|
| GET    | `/module_users/permissions`       | Listar todos los permisos  |
| GET    | `/module_users/permissions/{id}`  | Obtener permiso por ID     |
| POST   | `/module_users/permissions`       | Crear nuevo permiso        |
| PUT    | `/module_users/permissions/{id}`  | Actualizar permiso         |
| DELETE | `/module_users/permissions/{id}`  | Eliminar permiso           |

**Modelo de respuesta (`Permission`):**
```typescript
// src/app/features/permissions/models/permission.model.ts
{
  id:          number;
  name:        string;
  module:      string;      // agrupa permisos por módulo (ej. "USERS")
  action:      string;      // acción específica (ej. "USER_READ")
  description: string;
  active:      boolean;
}
```

> El frontend solo consume `GET /permissions` (lectura para mostrar en el formulario de roles). El CRUD completo de permisos existe en el backend pero no tiene pantalla en el frontend aún.

---

## Mapa de archivos

```
src/app/
├── core/
│   ├── auth/
│   │   ├── guards/auth.guard.ts          ← protege rutas con JWT
│   │   ├── models/auth.models.ts         ← LoginRequest, LoginResponse, AuthState
│   │   └── services/auth.service.ts      ← login, logout, token en memoria
│   ├── interceptors/
│   │   └── auth.interceptor.ts           ← añade Bearer token a cada petición
│   └── services/
│       ├── language.service.ts
│       └── theme.service.ts
│
├── features/
│   ├── auth/
│   │   └── pages/login/login.ts          ← llama a authService.login()
│   ├── permissions/
│   │   ├── models/permission.model.ts
│   │   └── services/permissions.service.ts
│   ├── roles/
│   │   ├── models/role.models.ts
│   │   └── services/roles.service.ts
│   └── users/
│       ├── models/user.model.ts
│       └── services/user.service.ts
│
└── environments/
    ├── environment.ts                    ← apiUrl desarrollo
    └── environment.prod.ts               ← apiUrl producción
```
