# Guía de Refactorización para Permisos Granulares y de Atributos (Frontend)

Esta guía documenta el estándar de diseño y el flujo implementado en el frontend de Angular para dar soporte a la seguridad a nivel de **Funcionalidad y Atributos**, en coherencia con el backend que almacena únicamente roles en el JWT y expone los permisos dinámicos del usuario mediante el endpoint `/api/auth/me/permissions`.

---

## 1. Funcionamiento del Servicio de Autenticación (`AuthService`)

Para evitar tokens JWT masivos y asegurar que los permisos puedan actualizarse en tiempo real sin esperar a que el token expire, el token solo contiene el listado de roles del usuario.

El frontend utiliza [AuthService](file:///home/nak/UAGRM/7moSemestre/SI2/Sistema%20de%20gestion%20documental%20sw/sgd_angular/src/app/core/auth/services/auth.service.ts) para consultar dinámicamente los permisos a nivel de atributos y funcionalidad:

1. **Inyección**: Se inyecta en el componente o guardia:
   ```typescript
   auth = inject(AuthService);
   ```
2. **Método de Verificación**:
   - `auth.hasPermission('permiso')`: Retorna un booleano indicando si el usuario posee la funcionalidad o el atributo (ej: `user:read:first_name` o `user:update:first_name`).
3. **Persistencia**: Los permisos se guardan de forma segura en el `localStorage` (`permissions`) al iniciar sesión y se refrescan automáticamente en segundo plano en cada recarga para garantizar consistencia.

---

## 2. Aplicación de Permisos en Formularios de Edición (HTML)

Cada campo del formulario debe regularse bajo políticas específicas de **Lectura** (visibilidad) y **Escritura** (edición):

* **Lectura (`user:read:<atributo>`)**: Envuelve la sección en un bloque `@if` de Angular para que el campo solo exista en el DOM si el usuario tiene permiso de lectura.
* **Escritura (`user:update:<atributo>`)**: Si el usuario no tiene permiso de edición, el control debe ser de solo lectura y tener una apariencia visual atenuada (`opacity-50`).

### Ejemplo Estructura HTML en Formularios de Edición:
```html
@if (auth.hasPermission('modulo:read:atributo')) {
  <div>
    <label class="hc-label">
      Nombre del Campo
      <!-- El asterisco de requerido solo se muestra si tiene permiso de edición -->
      @if (auth.hasPermission('modulo:update:atributo')) {
        <span class="text-hc-error">*</span>
      }
    </label>

    <!-- Inputs/Controles de Texto -->
    <input formControlName="miAtributo" type="text" class="hc-input"
      [readonly]="!auth.hasPermission('modulo:update:atributo')"
      [class.opacity-50]="!auth.hasPermission('modulo:update:atributo')" />

    <!-- Mensaje de Validación -->
    @if (auth.hasPermission('modulo:update:atributo') && form.get('miAtributo')?.invalid && form.get('miAtributo')?.touched) {
      <p class="text-hc-error text-xs mt-1">Este campo es requerido</p>
    }
  </div>
}
```

> [!NOTE]
> Para controles de tipo `<select>`, `<input type="checkbox">` o `<button type="button">`, se debe utilizar la directiva `[disabled]="!auth.hasPermission('modulo:update:atributo')"` en lugar de `[readonly]`.

---

## 3. Aplicación de Permisos en Formularios de Creación (HTML)

En los formularios de registro o creación, no existe un contexto de "Lectura de datos existentes" porque el recurso es nuevo. Sin embargo, ciertos atributos sensibles (como asignar roles, teléfono, etc.) pueden requerir permisos específicos de **Creación** (`user:create:<atributo>`).

Si el usuario no tiene permiso para crear dicho atributo, el campo debe ocultarse por completo del formulario de creación.

### Ejemplo Estructura HTML en Formularios de Creación:
```html
@if (auth.hasPermission('modulo:create:atributo')) {
  <div>
    <label class="hc-label">Atributo Restringido</label>
    <input formControlName="miAtributo" type="text" class="hc-input" />
  </div>
}
```

---

## 4. Aplicación de Permisos en Vistas de Detalle (Lectura)

En las pantallas destinadas únicamente a visualizar la información de un registro (modo lectura), debemos condicionar la visibilidad de los datos atributo por atributo. 

Si el usuario no tiene permiso de lectura para una propiedad en específico, esta no debe mostrarse en pantalla.

### Ejemplo en la Vista de Detalle:
```html
<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
  @if (auth.hasPermission('modulo:read:primer_campo')) {
    <div>
      <p class="text-xs text-hc-text-3">Primer Campo</p>
      <p class="text-sm font-medium text-hc-text">{{ registro.primerCampo }}</p>
    </div>
  }
  @if (auth.hasPermission('modulo:read:segundo_campo')) {
    <div>
      <p class="text-xs text-hc-text-3">Segundo Campo</p>
      <p class="text-sm font-medium text-hc-text">{{ registro.segundoCampo }}</p>
    </div>
  }
</div>
```

---

## 5. Aplicación de Permisos en Listados (Tablas)

En las pantallas de listado o tablas de datos, debemos proteger tanto el botón de creación de nuevos registros como las opciones o acciones disponibles para cada fila individual (ver, editar, eliminar, etc.).

### Ejemplo en Botón de Registro:
```html
@if (auth.hasPermission('modulo:create')) {
  <button (click)="goToRegister()" class="hc-btn-primary">
    Crear Nuevo Registro
  </button>
}
```

### Ejemplo en Acciones de Fila (Tabla):
```html
<td>
  <div class="flex items-center gap-1.5">
    <!-- Acción Ver Detalle -->
    @if (auth.hasPermission('modulo:read')) {
      <button (click)="goToDetail(item.id)" class="hc-btn-icon-primary">
        <fa-icon [icon]="faEye" />
      </button>
    }
    
    <!-- Acción Editar -->
    @if (auth.hasPermission('modulo:update')) {
      <button (click)="goToEdit(item.id)" class="hc-btn-icon-secondary">
        <fa-icon [icon]="faPencil" />
      </button>
    }
    
    <!-- Acción Eliminar -->
    @if (auth.hasPermission('modulo:delete')) {
      <button (click)="delete(item.id)" class="hc-btn-icon-danger">
        <fa-icon [icon]="faTrash" />
      </button>
    }
  </div>
</td>
```

---

## 6. Seguridad en Enrutamiento (`Routes`)

Para proteger el acceso directo mediante la URL del navegador, debemos configurar guardias de tipo `CanActivate` en las rutas de cada módulo utilizando la función `permissionGuard('permiso')`.

Cada ruta debe exigir el permiso funcional específico a su operación para evitar accesos no autorizados.

### Ejemplo de Configuración en `modulo.routes.ts`:
```typescript
import { Routes } from '@angular/router';
import { permissionGuard } from '../../core/auth/guards/role.guard';

export const moduloRoutes: Routes = [
  {
    path: 'list',
    canActivate: [permissionGuard('modulo:read')],
    loadComponent: () => import('./pages/list/list-component').then(m => m.ListComponent),
  },
  {
    path: 'register',
    canActivate: [permissionGuard('modulo:create')],
    loadComponent: () => import('./pages/register/register-component').then(m => m.RegisterComponent),
  },
  {
    path: 'form/:id',
    canActivate: [permissionGuard('modulo:update')],
    loadComponent: () => import('./pages/edit/edit-component').then(m => m.EditComponent),
  },
  {
    path: 'detail/:id',
    canActivate: [permissionGuard('modulo:read')],
    loadComponent: () => import('./pages/detail/detail-component').then(m => m.DetailComponent),
  }
];
```

---

## 7. Preparación del Payload en el Controlador (TS)

El backend valida rigurosamente los campos recibidos en los DTOs de creación o actualización. Si detecta un atributo sensible que el usuario no tiene permisos de crear/modificar y este contiene un valor, lanzará inmediatamente una excepción `AccessDeniedException`.

Para evitar este conflicto:
1. El modelo del DTO en el frontend (`CreateRequest` o `UpdateRequest`) debe definir las propiedades opcionales y admitir valores nulos (`string | null` o similar).
2. En el método de envío (`onSubmit`), cada campo condicional debe evaluarse. Si no se cuenta con el permiso correspondiente (`modulo:create:<atributo>` o `modulo:update:<atributo>`), **se debe enviar explícitamente `null`** (o ser omitido si es opcional y no restrictivo).

### Modificación del Modelo de Creación (`.model.ts`):
```typescript
export interface CreateModuloRequest {
  miAtributoSensible?: string | null;
  // ... otros campos
}
```

### Ejemplo en el Componente de Registro (`.ts`):
```typescript
onSubmit(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const { miAtributoSensible, camposComunes } = this.form.value;

  const payload: CreateModuloRequest = {
    ...camposComunes,
    // Si posee permiso, envía el valor; si no, envía null para cumplir con el backend
    miAtributoSensible: this.auth.hasPermission('modulo:create:atributo') ? miAtributoSensible : null,
  };

  this.miService.create(payload).subscribe(() => {
    this.router.navigate(['/modulo/list']);
  });
}
```

---

## 8. Resumen de Pasos para Nuevos Módulos

Para aplicar este esquema en otros módulos del sistema (como Pacientes, Documentos, etc.):

1. **Asegurar Rutas**: Configura `canActivate: [permissionGuard('modulo:permiso')]` en tu archivo de rutas.
2. **Definir modelos de payload**: Haz que los campos condicionales en los DTO de creación/edición en `.model.ts` sean opcionales y de tipo `T | null`.
3. **Inyectar el servicio**: Añade `auth = inject(AuthService)` en tu archivo de componentes `.ts`.
4. **Mapear payloads condicionales**: En `onSubmit()`, usa operadores ternarios asociados a `auth.hasPermission(...)` para asignar `null` a los campos restringidos que carezcan del permiso de escritura.
5. **Controlar la UI de Creación**: Envuelve los campos condicionales en el HTML con `@if (auth.hasPermission('modulo:create:campo'))`.
6. **Controlar la UI de Lectura/Detalles**: Envuelve la información con `@if (auth.hasPermission('modulo:read:campo'))` en las pantallas de detalle.
7. **Controlar la UI de Edición**: Envuelve los inputs con el bloque `@if` y bloquea la interacción usando `[readonly]` o `[disabled]` si no existe el permiso `modulo:update:campo`.
