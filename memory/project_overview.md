---
name: Project Overview
description: Stack, estructura y convenciones del proyecto SGD-HC frontend
type: project
---

**Stack:** Angular 21 (standalone components, signals, OnPush), TailwindCSS 4, FontAwesome, ngx-translate, OnlyOffice

**Propósito:** Sistema de Gestión Documental de Historias Clínicas — gestión de pacientes, documentos clínicos, usuarios, roles y plantillas médicas.

**Design system:** tokens CSS bajo prefijo `hc-*` en `src/styles.css` (light/dark mode via `.dark` class). Paleta teal (primary) + slate (neutrals). Capa `@layer components` con clases como `.hc-card`, `.hc-btn-primary`, `.hc-input`, `.hc-table`, `.hc-stat-card`.

**i18n:** `/public/i18n/es.json` y `en.json`, usando `TranslatePipe` y clave `APP_NAME`, secciones por feature (AUTH, NAV, NAVBAR, DASHBOARD, PATIENTS, DOCUMENTS, USERS, ROLES, TENANTS).

**Branch activo:** `evert`

**Why:** Proyecto universitario de 7mo semestre SI2.
**How to apply:** Mantener convenciones de clases hc-*, usar signals de Angular, ChangeDetectionStrategy.OnPush en todos los componentes.
