import { HelpTopic, HelpCategory } from '../models/help.models';

export const helpTopics: HelpTopic[] = [
  // ===== DOCUMENTOS =====
  {
    id: 'upload_document',
    title: '¿Cómo subir un nuevo documento?',
    description: 'Aprende a registrar y subir documentos de texto o digitales al sistema.',
    category: HelpCategory.DOCUMENTS,
    tags: ['documento', 'subir', 'cargar', 'archivo', 'guardar'],
    roles: [], // Todos
    steps: [
      {
        title: 'Ir a la sección de Documentos',
        description: 'Desde el menú lateral, haz clic en "Documentos".',
        iconName: 'file'
      },
      {
        title: 'Iniciar carga',
        description: 'Haz clic en el botón "+ Subir Documento" en la esquina superior derecha.',
        iconName: 'upload'
      },
      {
        title: 'Completar información',
        description: 'Ingresa el título, tipo de documento y selecciona el paciente correspondiente si es del historial clínico.',
        iconName: 'edit'
      },
      {
        title: 'Seleccionar archivo y guardar',
        description: 'Adjunta el archivo desde tu dispositivo y presiona "Guardar". Se registrará la firma digital del archivo de forma automática.',
        iconName: 'save'
      }
    ]
  },
  {
    id: 'search_documents',
    title: '¿Cómo buscar documentos y expedientes?',
    description: 'Encuentra documentos rápidamente usando filtros y palabras clave.',
    category: HelpCategory.DOCUMENTS,
    tags: ['buscar', 'documento', 'filtro', 'encontrar', 'expediente'],
    roles: [],
    steps: [
      {
        title: 'Navegar a Documentos',
        description: 'Haz clic en "Documentos" en el menú lateral principal.',
        iconName: 'file'
      },
      {
        title: 'Usar barra de búsqueda',
        description: 'Escribe el nombre del documento, autor o palabra clave en la barra superior.',
        iconName: 'search'
      },
      {
        title: 'Aplicar filtros avanzados',
        description: 'Filtra por tipo de documento, estado de la firma o rango de fechas de creación.',
        iconName: 'sliders'
      },
      {
        title: 'Ver detalle del documento',
        description: 'Haz clic sobre la fila del documento para visualizarlo en el editor de OnlyOffice o descargarlo.',
        iconName: 'eye'
      }
    ]
  },
  {
    id: 'manage_templates',
    title: '¿Cómo gestionar plantillas de documentos?',
    description: 'Aprende a crear y organizar plantillas reutilizables para tus documentos clínicos.',
    category: HelpCategory.DOCUMENTS,
    roles: ['ROLE_SUPERUSER', 'ROLE_ADMIN', 'ROLE_ARCHIVO', 'ROLE_MEDICO'],
    tags: ['plantilla', 'crear', 'guardar', 'documentos', 'reutilizar'],
    steps: [
      {
        title: 'Ir a Plantillas',
        description: 'En el menú lateral, expande "Documentos" y haz clic en "Plantillas".',
        iconName: 'file'
      },
      {
        title: 'Crear nueva plantilla',
        description: 'Haz clic en el botón "+ Nueva Plantilla" en la esquina superior derecha.',
        iconName: 'plus'
      },
      {
        title: 'Configurar detalles',
        description: 'Escribe el nombre de la plantilla, el departamento asignado y define si se compartirá con toda la clínica.',
        iconName: 'edit'
      },
      {
        title: 'Guardar plantilla',
        description: 'Haz clic en "Guardar" para añadirla a tu listado de formatos reutilizables.',
        iconName: 'save'
      }
    ]
  },
  {
    id: 'edit_onlyoffice',
    title: '¿Cómo editar documentos clínicos en OnlyOffice?',
    description: 'Edita tus historias clínicas en tiempo real con el editor integrado colaborativo.',
    category: HelpCategory.DOCUMENTS,
    roles: ['ROLE_SUPERUSER', 'ROLE_ADMIN', 'ROLE_ARCHIVO', 'ROLE_MEDICO'],
    tags: ['onlyoffice', 'editar', 'escribir', 'office', 'clínico', 'colaborar'],
    steps: [
      {
        title: 'Abrir un documento',
        description: 'Busca el documento en tu listado de "Documentos" y haz clic sobre él para abrir su detalle.',
        iconName: 'file'
      },
      {
        title: 'Hacer clic en Editar',
        description: 'Presiona el botón "Editar en OnlyOffice" para abrir la interfaz del editor incorporado.',
        iconName: 'edit'
      },
      {
        title: 'Realizar cambios',
        description: 'Modifica el texto de la historia clínica. OnlyOffice guarda los cambios automáticamente en segundo plano.',
        iconName: 'save'
      },
      {
        title: 'Cerrar y guardar versión',
        description: 'Al terminar, haz clic en "Cerrar". El sistema guardará una nueva versión inmutable del documento.',
        iconName: 'x'
      }
    ]
  },

  // ===== PACIENTES =====
  {
    id: 'register_patient',
    title: '¿Cómo registrar un nuevo paciente?',
    description: 'Registra los datos personales y de contacto de un paciente en el sistema.',
    category: HelpCategory.PATIENTS,
    roles: ['ROLE_SUPERUSER', 'ROLE_ADMIN', 'ROLE_ARCHIVO', 'ROLE_MEDICO'],
    tags: ['paciente', 'registrar', 'nuevo', 'crear', 'guardar'],
    steps: [
      {
        title: 'Ir a Pacientes',
        description: 'Selecciona "Pacientes" desde el menú lateral de navegación.',
        iconName: 'users'
      },
      {
        title: 'Crear nuevo paciente',
        description: 'Presiona el botón "+ Registrar Paciente" o "+ Nuevo".',
        iconName: 'plus'
      },
      {
        title: 'Rellenar datos requeridos',
        description: 'Ingresa Cédula de Identidad (CI), Nombre completo, Apellidos, Fecha de Nacimiento, Género y Teléfono.',
        iconName: 'edit'
      },
      {
        title: 'Guardar registro',
        description: 'Verifica que no existan errores en los datos ingresados y presiona "Guardar Paciente". El paciente ya tendrá su expediente creado.',
        iconName: 'save'
      }
    ]
  },

  // ===== IMÁGENES DICOM =====
  {
    id: 'view_dicom',
    title: '¿Cómo visualizar un estudio médico DICOM?',
    description: 'Carga y manipula imágenes médicas en formato DICOM directamente en la web.',
    category: HelpCategory.DICOM,
    roles: ['ROLE_SUPERUSER', 'ROLE_ADMIN', 'ROLE_MEDICO', 'ROLE_ARCHIVO'],
    tags: ['dicom', 'imagen', 'médica', 'visor', 'tomografía', 'radiografía'],
    steps: [
      {
        title: 'Acceder al listado DICOM',
        description: 'Navega al menú "Estudios DICOM" o abre la pestaña DICOM dentro de la ficha de un paciente.',
        iconName: 'activity'
      },
      {
        title: 'Seleccionar estudio',
        description: 'Busca el estudio médico correspondiente y presiona el icono de visualización (ojo).',
        iconName: 'eye'
      },
      {
        title: 'Cargar el visor interactivo',
        description: 'Espera que el cargador interactivo decodifique los archivos del estudio en tu navegador.',
        iconName: 'spinner'
      },
      {
        title: 'Manipular la imagen',
        description: 'Usa la barra de herramientas del visor para rotar, ajustar contraste (brillo), hacer zoom o medir áreas de la imagen.',
        iconName: 'sliders'
      }
    ]
  },

  // ===== REPORTES Y AUDITORÍA =====
  {
    id: 'view_audit_logs',
    title: '¿Cómo revisar la bitácora de auditoría?',
    description: 'Revisa de forma segura el registro cronológico de todas las operaciones realizadas.',
    category: HelpCategory.REPORTS,
    roles: ['ROLE_SUPERUSER', 'ROLE_ADMIN'],
    tags: ['auditoría', 'log', 'seguridad', 'bitácora', 'operaciones'],
    steps: [
      {
        title: 'Ir a Auditoría',
        description: 'Accede a la sección de "Auditoría" desde la barra lateral.',
        iconName: 'shield'
      },
      {
        title: 'Filtrar bitácora',
        description: 'Utiliza los filtros de búsqueda por usuario, rango de fechas o acción (subida, eliminación, inicio de sesión) para depurar.',
        iconName: 'search'
      },
      {
        title: 'Revisar detalles técnicos',
        description: 'Haz clic en el registro para ver detalles como la dirección IP, fecha/hora exacta y cambios realizados.',
        iconName: 'info'
      }
    ]
  },
  {
    id: 'view_reports',
    title: '¿Cómo visualizar los reportes y estadísticas clínicas?',
    description: 'Consulta los gráficos del dashboard, estadísticas de consultas y reportes de tu clínica.',
    category: HelpCategory.REPORTS,
    roles: ['ROLE_SUPERUSER', 'ROLE_ADMIN', 'ROLE_DIRECTOR', 'ROLE_MEDICO'],
    tags: ['reporte', 'estadística', 'dashboard', 'gráfico', 'consultas', 'rendimiento'],
    steps: [
      {
        title: 'Ir al Dashboard',
        description: 'Haz clic en "Dashboard" o "Reportes" en el menú de navegación principal.',
        iconName: 'activity'
      },
      {
        title: 'Revisar métricas principales',
        description: 'Analiza los contadores de pacientes atendidos, documentos emitidos y espacio de almacenamiento utilizado.',
        iconName: 'info'
      },
      {
        title: 'Ver gráficos estadísticos',
        description: 'Visualiza la evolución temporal de consultas y la distribución de documentos clínicos por especialidad.',
        iconName: 'sliders'
      },
      {
        title: 'Generar reportes imprimibles',
        description: 'Usa los filtros de fecha para exportar reportes detallados o imprimirlos mediante la opción del navegador.',
        iconName: 'download'
      }
    ]
  },

  // ===== COPIAS DE SEGURIDAD =====
  {
    id: 'manage_backups',
    title: '¿Cómo gestionar y generar copias de seguridad?',
    description: 'Genera respaldos manuales de la base de datos para prevenir pérdidas de información.',
    category: HelpCategory.BACKUPS,
    roles: ['ROLE_SUPERUSER'],
    tags: ['backup', 'respaldo', 'seguridad', 'base de datos', 'guardar'],
    steps: [
      {
        title: 'Acceder a Backups',
        description: 'Ingresa al módulo "Copias de Seguridad" en la sección de administración.',
        iconName: 'database'
      },
      {
        title: 'Generar copia',
        description: 'Presiona el botón "Generar Respaldo". El sistema creará un volcado del Postgres actual.',
        iconName: 'plus'
      },
      {
        title: 'Descargar el archivo',
        description: 'Una vez finalizado, haz clic en el botón de descarga para guardar el archivo comprimido (.zip o .sql) en un dispositivo externo.',
        iconName: 'download'
      }
    ]
  },

  // ===== USUARIOS Y ROLES =====
  {
    id: 'manage_users',
    title: '¿Cómo registrar y editar usuarios?',
    description: 'Aprende a administrar los accesos y credenciales de los trabajadores del sistema.',
    category: HelpCategory.USERS,
    roles: ['ROLE_SUPERUSER', 'ROLE_ADMIN'],
    tags: ['usuarios', 'roles', 'crear', 'permisos', 'editar', 'clave'],
    steps: [
      {
        title: 'Ir a Gestión de Usuarios',
        description: 'Desde el menú de navegación lateral, selecciona "Usuarios".',
        iconName: 'users'
      },
      {
        title: 'Registrar nuevo usuario',
        description: 'Haz clic en "Registrar Usuario" e introduce el nombre de usuario, contraseña, email y selecciona el rol deseado.',
        iconName: 'user-plus'
      },
      {
        title: 'Editar roles y estado',
        description: 'Para cambiar permisos o suspender una cuenta, haz clic en "Editar" en la fila del usuario correspondiente.',
        iconName: 'edit'
      },
      {
        title: 'Cambiar contraseñas',
        description: 'Si un usuario olvidó sus credenciales, haz clic en el botón de la llave ("Cambiar Contraseña") para reestablecerla de forma segura.',
        iconName: 'key'
      }
    ]
  },

  // ===== USO GENERAL =====
  {
    id: 'change_profile_password',
    title: '¿Cómo cambiar mi contraseña personal?',
    description: 'Mantén segura tu cuenta cambiando la clave de acceso de manera regular.',
    category: HelpCategory.GENERAL,
    roles: [],
    tags: ['contraseña', 'clave', 'perfil', 'mi cuenta', 'seguridad'],
    steps: [
      {
        title: 'Desplegar menú de perfil',
        description: 'Haz clic sobre tu nombre o avatar en la esquina superior derecha del Navbar.',
        iconName: 'user'
      },
      {
        title: 'Seleccionar Perfil',
        description: 'Haz clic en la opción "Mi Perfil" o "Cambiar Contraseña".',
        iconName: 'settings'
      },
      {
        title: 'Introducir nueva clave',
        description: 'Ingresa tu contraseña actual y luego escribe la nueva contraseña dos veces.',
        iconName: 'key'
      },
      {
        title: 'Confirmar cambio',
        description: 'Haz clic en "Guardar Cambios". Tu sesión se mantendrá activa con la nueva contraseña.',
        iconName: 'save'
      }
    ]
  },
  {
    id: 'manage_subscription',
    title: '¿Cómo gestionar y renovar la suscripción?',
    description: 'Aprende a renovar tu plan o cambiar a uno superior para ampliar tus límites.',
    category: HelpCategory.GENERAL,
    roles: ['ROLE_SUPERUSER', 'ROLE_ADMIN'],
    tags: ['suscripción', 'plan', 'pagar', 'renovar', 'actualizar', 'stripe', 'facturación'],
    steps: [
      {
        title: 'Navegar a Configuración de la Clínica',
        description: 'Desde el menú lateral, haz clic en "Configuración" y luego selecciona "Suscripción".',
        iconName: 'settings'
      },
      {
        title: 'Revisar estado y límites',
        description: 'Visualiza el consumo actual de usuarios, almacenamiento y llamadas a la API junto con la fecha de vencimiento.',
        iconName: 'info'
      },
      {
        title: 'Renovar o cambiar plan',
        description: 'Haz clic en "Renovar ahora" para mantener tu plan actual, o en "Seleccionar plan" en el plan superior deseado.',
        iconName: 'sliders'
      },
      {
        title: 'Ingresar datos de pago',
        description: 'En el modal seguro de Stripe, verifica el total en bolivianos (Bs.), ingresa los datos de tu tarjeta y presiona "Pagar".',
        iconName: 'dollar'
      }
    ]
  }
];

export const getTopicsByRole = (userRoles: string[]): HelpTopic[] => {
  if (!userRoles || userRoles.length === 0) {
    // Si no hay roles (usuario anónimo), retornar solo los temas públicos (sin roles específicos)
    return helpTopics.filter(topic => topic.roles.length === 0);
  }

  return helpTopics.filter(topic =>
    topic.roles.length === 0 || topic.roles.some(r => userRoles.includes(r))
  );
};

export const searchTopics = (query: string, userRoles: string[]): HelpTopic[] => {
  const lowerQuery = query.toLowerCase().trim();
  const filteredByRole = getTopicsByRole(userRoles);

  if (!lowerQuery) return filteredByRole;

  return filteredByRole.filter(topic =>
    topic.title.toLowerCase().includes(lowerQuery) ||
    topic.description.toLowerCase().includes(lowerQuery) ||
    topic.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

export const getTopicsByCategory = (category: HelpCategory, userRoles: string[]): HelpTopic[] => {
  const filteredByRole = getTopicsByRole(userRoles);
  return filteredByRole.filter(topic => topic.category === category);
};

export const getTopicById = (id: string): HelpTopic | undefined => {
  return helpTopics.find(topic => topic.id === id);
};
