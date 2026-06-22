# 🤖 Asistente de Ayuda - Angular

Este módulo contiene el **Asistente Virtual** de ayuda integrado para guiar al usuario en las operaciones clave del Sistema de Gestión Documental (SGD).

---

## 📖 Características
- ✅ **Búsqueda en Tiempo Real**: Filtra guías según palabras clave mientras escribes.
- ✅ **Filtrado por Roles**: Muestra solo los temas relevantes según los privilegios del usuario (`ROLE_SUPERUSER`, `ROLE_ADMIN`, `ROLE_MEDICO`, `ROLE_ARCHIVO`, `ROLE_DIRECTOR`).
- ✅ **Temas por Categorías**: Organización de guías mediante 7 categorías coloridas.
- ✅ **Detalle Paso a Paso**: Instrucciones paso a paso con iconos autocontenidos.
- ✅ **Acceso Rápido**: Accesos directos a las tareas más habituales.

---

## 📁 Estructura de Archivos
```
src/app/features/help/
├── data/
│   └── help-topics.ts        # Base de datos local de guías y lógica de filtros
├── models/
│   └── help.models.ts        # Interfaces y tipos TypeScript
└── components/
    ├── help-icon/            # Componente de iconos SVG autocontenido
    ├── help-topic-detail/    # Componente visual para los pasos de una guía
    ├── help-chat-modal/      # Ventana modal del asistente
    └── help-chat-button/     # Botón flotante que activa el asistente
```

---

## ⚙️ Integración Global

El asistente está integrado en el diseño global del sistema (`MainLayout`), por lo que estará disponible en cualquier página del sistema automáticamente:

```typescript
// src/app/layout/main-layout/main-layout.ts
import { HelpChatButton } from '../../features/help/components/help-chat-button/help-chat-button';

@Component({
  ...
  imports: [..., HelpChatButton],
})
export class MainLayout { ... }
```

```html
<!-- src/app/layout/main-layout/main-layout.html -->
<div class="flex min-h-screen bg-hc-app">
  ...
  <!-- Botón flotante del Asistente -->
  <app-help-chat-button></app-help-chat-button>
</div>
```

---

## ➕ Agregar Nuevos Temas

Para agregar un nuevo tema o guía interactiva, edita el archivo `src/app/features/help/data/help-topics.ts`:

1. Añade un objeto al arreglo `helpTopics`:
```typescript
{
  id: 'ejemplo_nuevo_tema',
  title: '¿Cómo realizar una acción X?',
  description: 'Descripción corta de lo que aprenderá el usuario.',
  category: HelpCategory.GENERAL,
  roles: ['ROLE_MEDICO', 'ROLE_ADMIN'], // Deja vacío [] para que sea público para todos
  tags: ['acción', 'ejemplo', 'ayuda'],
  steps: [
    {
      title: 'Paso 1: Abrir el menú',
      description: 'Accede a la opción X del menú lateral.',
      iconName: 'sliders'
    },
    {
      title: 'Paso 2: Confirmar datos',
      description: 'Haz clic en el botón de confirmación.',
      iconName: 'save'
    }
  ]
}
```

2. Guarda el archivo y la aplicación se actualizará automáticamente.

---

## 🎨 Iconos Disponibles (`app-help-icon`)
El componente `app-help-icon` dibuja iconos SVG puros sin requerir librerías externas. Puedes usar los siguientes nombres en el campo `iconName` de cada paso:
- `file`, `upload`, `edit`, `save`, `search`, `sliders`, `eye`, `users`, `plus`, `activity`, `spinner`, `shield`, `info`, `database`, `download`, `user-plus`, `key`, `user`, `settings`, `x`, `chevron-right`, `arrow-left`, `message`, `book`, `dollar`, `question`.
