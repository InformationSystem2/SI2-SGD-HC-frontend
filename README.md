# SGD-HC — Frontend · Angular

**Sistema de Gestión Documental y Clínico.**  
Sistemas de Información II · Universidad Autónoma Gabriel René Moreno (UAGRM)

| Recurso | Enlace |
|---|---|
| Repositorio público | https://github.com/InformationSystem2/SI2-SGD-HC-frontend |
| Documentación de permisos | [`docs/refactor_granular_permissions.md`](docs/refactor_granular_permissions.md) |

---

## Descripción

Cliente SPA de SGD-HC desarrollado con **Angular 21** y **Signals** para reactividad moderna. Estilizado con **Vanilla CSS** sin frameworks adicionales para control total sobre el diseño.

Capacidades destacadas:

- **Visor DICOM** — renderizado interactivo de imágenes médicas con CornerstoneJS.
- **Dynamic Branding (Multitenancy estético)** — colores, logo, tipografía y variables CSS cargadas por tenant en tiempo real.
- **Control de acceso granular (RBAC)** — ocultación y deshabilitación de campos según permisos del rol.
- **Perfil de Usuario** — edición de datos personales e información del perfil, con soporte para cambio seguro de contraseña.
- **Asistente Inteligente (Chat)** — chat interactivo para ayuda técnica, consulta de guías de uso y resolución de dudas sobre el sistema.
- **Notificaciones y Recordatorios** — integración de alertas en tiempo real y alertas de límites de plan de recursos (60%-100%), con indicadores de recordatorio visual (punto amarillo) en el dropdown de navegación y en el listado general para elementos no leídos.
- **Workflows** — seguimiento visual de flujos de revisión y tareas asignadas.

---

## Flujo de autenticación y permisos

```
Usuario (Login)
      │
      ▼
AuthService.login()          → POST /auth/login → JWT
      │
      ▼
AuthService.fetchPermissions() → GET /auth/me/permissions
      │
      ├─ localStorage          → accessToken, expiresAt, permissions
      ├─ BrandingService       → inyecta variables CSS del tenant en :root
      │
      ▼
Guards / Componentes           → auth.hasPermission() / auth.hasAnyPermission()
      │
      ▼
Formularios                    → campos condicionales según permisos de lectura/edición
```

---

## Estructura del proyecto

```
src/
├── app/
│   ├── core/
│   │   ├── auth/
│   │   │   ├── guards/        # authGuard, roleGuard, permissionGuard
│   │   │   ├── models/        # AuthState, LoginRequest, LoginResponse
│   │   │   └── services/      # AuthService (login, logout, hasPermission, fetchPermissions)
│   │   ├── interceptors/      # auth.interceptor (Bearer token + X-Tenant-ID)
│   │   ├── services/          # BrandingService, PushNotificationService
│   │   └── utils/             # Utilidades compartidas
│   │
│   ├── features/              # Módulos de negocio (Lazy Loaded)
│   │   ├── auth/              # Login, recuperación y restablecimiento de contraseña
│   │   ├── audit/             # Visor de logs de auditoría
│   │   ├── backups/           # Gestión y descarga de respaldos
│   │   ├── dashboard/         # Panel principal con métricas
│   │   ├── dicom/             # Cargador y visor DICOM (CornerstoneJS)
│   │   ├── documents/         # Listado, carga y edición de documentos clínicos
│   │   ├── historial/         # Historial clínico por paciente
│   │   ├── notifications/     # Centro de notificaciones push
│   │   ├── patients/          # Registro y detalle de pacientes
│   │   ├── permissions/       # Gestión de permisos del sistema
│   │   ├── reports/           # Diseñador QBE y exportación PDF/Excel/HTML
│   │   ├── roles/             # Creación y edición de roles + asignación de permisos
│   │   ├── tenants/           # Perfil de clínica, branding y suscripción
│   │   ├── users/             # Listado, registro y edición de usuarios
│   │   └── workflow/          # Flujos de revisión, tareas y comentarios
│   │
│   ├── layout/
│   │   └── components/        # Sidebar, Navbar, layout raíz
│   │
│   ├── app.component.ts
│   ├── app.config.ts          # Proveedores globales (HTTP, Router, i18n)
│   └── app.routes.ts          # Rutas globales y guards de módulo
│
├── assets/                    # Imágenes estáticas y ficheros de traducción (i18n)
├── environments/              # environment.ts · environment.docker.ts · environment.prod.ts
└── styles.css                 # Variables CSS globales y reset
```

---

## Tecnologías

| Tecnología | Versión | Rol |
|---|---|---|
| Angular | 21.x | Framework SPA con Signals |
| TypeScript | 5.x | Tipado estático |
| RxJS | 7.x | Streams asíncronos y HTTP |
| Vanilla CSS | CSS3 | Diseño sin frameworks externos |
| CornerstoneJS | 2.x | Renderizado DICOM |
| OnlyOffice SDK | — | Co-edición de plantillas en tiempo real |
| Firebase (FCM) | — | Notificaciones push |

---

## Puesta en marcha

### Requisitos previos

- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Variables de entorno

Editar `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',          // Spring Boot
  reportsApiUrl: 'http://localhost:8001/api/reports', // FastAPI
  micservApiUrl: 'http://localhost:8001/api',
  onlyofficeDocServerUrl: 'http://localhost:8088/',
};
```

### Instalar y ejecutar

```bash
npm install
npm start
```

La aplicación queda disponible en `http://localhost:4200`.

> El script `prestart` compila automáticamente los Web Workers de CornerstoneJS.

---

## Pantallas principales

| Ruta | Módulo | Descripción |
|---|---|---|
| `/auth/login` | auth | Inicio de sesión con branding del tenant |
| `/dashboard` | dashboard | Panel con métricas y accesos rápidos |
| `/documents` | documents | Búsqueda, filtrado y previsualización de documentos |
| `/patients` | patients | Registro y detalle de pacientes |
| `/historial` | historial | Historial clínico por paciente |
| `/dicom` | dicom | Carga y visualización de imágenes DICOM |
| `/reports` | reports | Diseñador QBE y exportación de informes |
| `/roles` | roles | Gestión de roles y asignación de permisos RBAC |
| `/users` | users | Administración de usuarios del tenant |
| `/profile` | users | Perfil personal de usuario y cambio de contraseña |
| `/tenants` | tenants | Configuración de clínica, branding y suscripción |
| `/workflows` | workflow | Flujos de revisión y bandeja de tareas |
| `/notifications` | notifications | Centro de notificaciones y alertas |
| `/audit` | audit | Registro de auditoría de acciones |
| `/backups` | backups | Gestión de respaldos |

---

## Seguridad en el cliente

### Dynamic Branding
Al autenticarse, `BrandingService` consume `/tenants/current/branding` e inyecta variables CSS (`--primary-color`, `--bg-color`, `--logo-url`, etc.) directamente en `:root`. El cambio es instantáneo y no requiere builds separadas por clínica.

### RBAC en el frontend
- **Guards**: `authGuard` protege rutas autenticadas; `permissionGuard` restringe módulos según permisos del rol.
- **`hasPermission()`**: método reactivo de `AuthService` consultado en templates para mostrar u ocultar secciones.
- **Campos condicionales**: los formularios deshabilitan o eliminan campos según los permisos de lectura/edición del rol activo.

---

## Documentación técnica

- [`docs/refactor_granular_permissions.md`](docs/refactor_granular_permissions.md) — Guía de implementación de permisos granulares en el frontend.

---

## Equipo

| Integrante | Rol |
|---|---|
| **Evert Rodríguez Araúz** | Backend Developer / Arquitecto de Software |

---

*Sistemas de Información II · UAGRM*
