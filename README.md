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
* **Visualización DICOM**: Visor interactivo a nivel local y en servidor mediante CornerstoneJS.
* **Multitenancy Estético (Dynamic Branding)**: Carga dinámica de logotipos, colores (primario, fondo, tarjetas, etc.), tipografía y estilos por Tenant en tiempo real.
* **Control de Acceso Granular (Funcionalidad y Atributos)**: Ocultación de campos sensibles a nivel de lectura e inhabilitación/readonly para campos sin permisos de actualización.

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
          ├─ BrandingService ──► Carga y aplica tokens CSS del Tenant (colores y logo)
          │
          ▼
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

## Tecnologías

### Frontend & Core
| Tecnología | Versión | Uso |
|---|---|---|
| Angular | 21.x | Framework SPA de desarrollo frontend con Signals |
| TypeScript | 5.x | Lenguaje de desarrollo fuertemente tipado |
| RxJS | 7.x | Manejo de flujos de datos asíncronos y reactivos |
| Vanilla CSS | CSS3 | Estructuración y diseño responsivo sin frameworks adicionales |

### Librerías Especializadas e Integraciones
| Tecnología | Versión | Uso |
|---|---|---|
| CornerstoneJS | 2.x | Renderizado y manipulación interactiva de archivos médicos DICOM |
| OnlyOffice SDK | — | Integración para la co-edición y visualización de plantillas en tiempo real |
| Canvas / Web Workers | — | Procesamiento en segundo plano de imágenes médicas complejas |

---

## Instalación y Ejecución

### 1. Requisitos Previos
* Node.js (v18 o superior recomendado)
* Angular CLI instalado de forma global (`npm install -g @angular/cli`)

### 2. Configurar Variables de Entorno
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

### 3. Compilar e Iniciar la Aplicación

Instalar las dependencias del proyecto:
```bash
npm install
```

Iniciar el servidor de desarrollo local:
```bash
npm start
```
*Nota: El script de pre-arranque compilará automáticamente los web workers necesarios para CornerstoneJS (DICOM).*

La aplicación estará disponible en: `http://localhost:4200`

---

## Pantallas Principales

| Componente / Ruta | Flujo / Vista | Descripción |
|---|---|---|
| `/login` | Inicio de Sesión | Autenticación de usuarios por tenant, cargando la personalización del sistema |
| `/documents` | Panel de Documentos | Búsqueda, filtrado y previsualización de documentos clínicos autorizados |
| `/document-upload` | Carga de Documentos | Formulario con procesamiento OCR y carga de imágenes clínicas |
| `/patients` | Historias Clínicas | Visualización y registro de pacientes e historiales (control granular por campo) |
| `/reports` | Diseñador QBE | Interfaz interactiva de reportes con filtros y descarga de archivos PDF/Excel/HTML |
| `/roles` | Control de Acceso (RBAC) | Configuración granular de permisos de lectura y edición de atributos para roles |

---

## Módulo de Seguridad: algoritmos y políticas

### Multitenancy Estético (Dynamic Branding)
El frontend consume la API de inquilinos durante el inicio de sesión. Una vez resuelto el tenant del usuario, `BrandingService` inyecta dinámicamente variables CSS personalizadas (`--primary-color`, `--logo-url`, `--font-family`) directamente en la raíz del documento (`:root`). Esto permite un aislamiento estético absoluto entre clínicas sin requerir builds separadas.

### Control de Acceso por Atributos (Field-Level Security)
* **Directiva de Permisos**: Los componentes y campos de formularios utilizan directivas y condicionales reactivos (`auth.hasPermission('PATIENT_READ_DIAGNOSIS')`).
* **Visualización Restringida**: Si el rol del usuario no tiene permisos de lectura para un atributo sensible (p. ej. el diagnóstico de un paciente), el frontend oculta la celda o la reemplaza por caracteres enmascarados.
* **Formularios de Edición Controlados**: Si un usuario tiene permiso de lectura pero no de edición sobre un campo, este se renderiza en estado `readonly` o `disabled`, evitando solicitudes de edición inválidas.

---

## Por qué control de accesos a nivel de atributos y no de endpoints simple

| Tipo de Control | Permite ocultar campos sensibles | Flexibilidad por Rol | Complejidad de UI |
|---|---|---|---|
| **Control por Endpoint (`/paciente/{id}`)** | No (Muestra la pantalla completa o nada) | Baja | Baja |
| **Control a nivel de Atributo (SGD-HC)** | **Sí** (Oculta dirección, diagnóstico, etc.) | **Alta** (Granular por permiso) | Media (Renderizado condicional) |

---

## Documentación Técnica

- [`docs/refactor_granular_permissions.md`](docs/refactor_granular_permissions.md) — Guía detallada para el uso de directivas y control de visibilidad de campos de formulario.

---

## Equipo

| Integrante | Rol |
|---|---|
| **Evert Rodríguez Araúz** | Backend Developer / Arquitecto de Software |
| *[Integrante 2]* | *[Rol]* |
| *[Integrante 3]* | *[Rol]* |

---

*Proyecto desarrollado para la materia de Sistemas de Información II — UAGRM*
