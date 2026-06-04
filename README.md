# SGD-HC Frontend — Cliente Angular del Sistema de Gestión Documental y Clínico

**Sistemas de Información II — Universidad Autónoma Gabriel René Moreno (UAGRM)**

## Entregables

| Recurso | Enlace |
|---|---|
| Documentación de Permisos (Frontend) | [`docs/refactor_granular_permissions.md`](docs/refactor_granular_permissions.md) |
| Repositorio público | https://github.com/InformationSystem2/SI2-SGD-HC-frontend |

---

## Información del Proyecto

Este directorio contiene la aplicación cliente de **SGD-HC (Sistema de Gestión Documental y Clínico)**, desarrollada utilizando **Angular 21** con **Signals** para una reactividad moderna, y estilizada con **Vanilla CSS** personalizado para un diseño limpio, premium y responsive.

El frontend integra características avanzadas tales como:
- **Visualización DICOM** interactiva a nivel local y en servidor mediante CornerstoneJS.
- **Multitenancy Estético (Dynamic Branding)**: Carga dinámica de logotipos, colores (primario, fondo, tarjetas, etc.), tipografía y estilos por Tenant en tiempo real.
- **Control de Acceso Granular (Funcionalidad y Atributos)**: Ocultación de campos sensibles a nivel de lectura (`*` opcional para edición) e inhabilitación/readonly para campos sin permisos de actualización.

---

## Arquitectura de Flujo de Permisos

```
   Usuario (Login) 
          │  
          ▼
   AuthService (login()) ──► Llama a /auth/login y obtiene JWT
          │
          ▼
   AuthService (fetchPermissions()) ──► Consulta /auth/me/permissions (Backend)
          │
          ├─ LocalStorage ──► Guarda tokens y lista de permisos
          │
   guards / components ──► Evalúan visibilidad y acceso mediante auth.hasPermission()
          │
   onSubmit() ──► Mapea valores omitiendo (null) campos sin permisos de edición
```

---

## Estructura del Proyecto

```
sgd_angular/
├── src/
│   ├── app/
│   │   ├── core/                   # Módulos globales del sistema
│   │   │   ├── auth/               # Autenticación, guardias, interceptores y estado
│   │   │   │   ├── guards/         # auth.guard, role.guard (superuser, permissionGuard)
│   │   │   │   ├── interceptors/   # auth.interceptor (envío de token JWT y X-Tenant-ID)
│   │   │   │   ├── models/         # auth.models (AuthState)
│   │   │   │   └── services/       # auth.service (hasPermission, login, logout)
│   │   │   └── services/           # branding.service (carga y aplica tokens CSS del Tenant)
│   │   │
│   │   ├── features/               # Módulos funcionales de negocio (Lazy Loaded)
│   │   │   ├── auth/               # Páginas de Login
│   │   │   ├── dicom/              # Visor y cargador de imágenes DICOM
│   │   │   ├── documents/          # Gestión de documentos y plantillas
│   │   │   ├── patients/           # Historial clínico y registro de pacientes
│   │   │   ├── reports/            # Diseñador y visualizador de reportes
│   │   │   ├── roles/              # Gestión de roles y asignación de permisos
│   │   │   ├── tenants/            # Gestión de Clínicas, apariencia y suscripciones
│   │   │   └── users/              # Gestión de usuarios del sistema (listado, registro, edición)
│   │   │
│   │   ├── layout/                 # Layouts globales
│   │   │   └── components/         # sidebar, navbar
│   │   │
│   │   ├── app.component.ts        # Componente raíz
│   │   ├── app.config.ts           # Proveedores globales de Angular
│   │   └── app.routes.ts           # Definición de rutas globales y guardias de módulos
│   │
│   ├── assets/                     # Archivos estáticos y traducciones i18n
│   ├── environments/               # Configuraciones por entorno (dev, docker, prod)
│   └── styles.css                  # Hoja de estilos global y variables CSS base
│
├── docs/
│   └── refactor_granular_permissions.md # Guía para implementar permisos de atributos
├── angular.json                    # Configuración del CLI de Angular
├── package.json                    # Scripts del proyecto y dependencias
└── README.md
```

---

## Configuración del Entorno

Las variables de entorno se definen en `src/environments/`:

```typescript
// src/environments/environment.ts (Desarrollo local)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',                  // API del Backend principal (Spring Boot)
  reportsApiUrl: 'http://localhost:8001/api/reports',    // API del Microservicio de Reportes (Python)
  micservApiUrl: 'http://localhost:8001/api',            // API general del microservicio
  onlyofficeDocServerUrl: 'http://localhost:8088/',      // Servidor OnlyOffice
};
```

---

## Ejecución Local

### Prerrequisitos
- Node.js (versión 18 o superior recomendada)
- Angular CLI instalado globalmente (`npm install -g @angular/cli`)

### Instrucciones de Arranque
1. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
2. Inicia el servidor de desarrollo local:
   ```bash
   npm start
   ```
   *Nota: El script de pre-arranque compilará automáticamente los web workers necesarios para CornerstoneJS (DICOM).*

3. Accede al sistema en tu navegador en [http://localhost:4200](http://localhost:4200).
