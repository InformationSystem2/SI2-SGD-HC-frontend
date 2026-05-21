---
name: UI Refactor Clínico 2026-05-11
description: Refactorización moderna orientada a clínicas — qué se cambió y por qué
type: project
---

**Fecha:** 2026-05-11

Archivos modificados:
- `src/styles.css` → añadida capa `@layer components` con: `.hc-card`, `.hc-btn-primary`, `.hc-btn-secondary`, `.hc-btn-icon-*`, `.hc-input`, `.hc-select`, `.hc-label`, `.hc-badge-*`, `.hc-page-header`, `.hc-page-title`, `.hc-section-label`, `.hc-alert-*`, `.hc-table-wrap`, `.hc-table`, `.hc-table-empty`, `.hc-pagination`, `.hc-page-btn`, `.hc-stat-card`, `.hc-action-card`
- `dashboard-page.ts/.html` → redesign completo: header de bienvenida degradado, 4 stat cards (PatientService + DocumentService), quick actions, tabla de docs recientes
- `login.html/.ts` → layout split: panel izquierdo con branding clínico + panel derecho con formulario. Añadido `features[]` en el TS
- `patient-list.ts/.html` → búsqueda en tiempo real por nombre/documento/teléfono via signal `search`, computed `filtered`
- `navbar.html` → indicador "En línea" + avatar inicial + mejoras visuales
- `sidebar.html` → subtítulo "Historias Clínicas", avatar inicial en footer
- `public/i18n/es.json` + `en.json` → claves DASHBOARD.*, NAVBAR.SYSTEM_ONLINE, PATIENTS.SEARCH_*, DOCUMENTS.COL_NAME

**Why:** El usuario pidió estilos modernos orientados a clínicas. El dashboard estaba vacío, el login era básico y no había búsqueda en listas.
**How to apply:** Continuar usando las clases del design system. El dashboard carga desde PatientService y DocumentService en ngOnInit.
