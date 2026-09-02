/* ============================================================================
   CONFIGURACIÓN GENERAL DE LA APLICACIÓN
   ----------------------------------------------------------------------------
   Punto único de personalización para cada Centro de Alumnos que use la app.
   Cambiar aquí el nombre, la institución, los dominios de correo permitidos,
   los cursos disponibles y qué módulos están activos.

   NO se necesita tocar código de componentes para adaptar la app.
   ========================================================================== */

export interface AppConfig {
  /** Identidad visible de la organización. */
  organization: {
    /** Nombre corto que aparece en la barra superior. */
    shortName: string;
    /** Nombre completo, usado en pantalla de acceso y perfil. */
    fullName: string;
    /** Nombre de la institución. Genérico a propósito. */
    institution: string;
    /** Periodo/directiva vigente. Aparece en "Acerca de". */
    term: string;
  };

  /** Reglas de acceso (§5 y §7 del documento). */
  auth: {
    /**
     * Dominios de correo institucional autorizados.
     * Solo se permite el ingreso con una dirección de estos dominios exactos:
     * la comparación NO acepta subdominios. Para habilitar, por ejemplo,
     * @alumnos.verbo.cl, hay que añadirlo aquí como una entrada más.
     *
     * OJO: esto es el PRIMER filtro, no el único. Además del dominio, el
     * correo debe pertenecer a una cuenta existente, y las cuentas se generan
     * desde la nómina oficial (`src/content/roster.ts`). Un @verbo.cl que no
     * figure en esa nómina no puede acceder.
     */
    allowedEmailDomains: string[];
    /** Texto de ayuda mostrado bajo el campo de correo. */
    emailHint: string;
    /**
     * Muestra el selector de cuentas de demostración en el login.
     *
     * ⚠️ ANTES DE ABRIR LA APP A LA COMUNIDAD: ponerlo en `false`.
     * Mientras esté en `true`, cualquiera que llegue a la pantalla de acceso
     * puede entrar como administrador con un clic, sin escribir un correo.
     */
    enableDemoAccounts: boolean;
    /**
     * Exige comprobar el correo con un código antes de dejar entrar.
     * Ponerlo en `false` solo mientras no haya servicio de correo y se
     * necesite probar la app sin ese paso.
     */
    requireEmailVerification: boolean;
    verification: {
      /**
       * Servicio que envía el correo con el código.
       *
       * VACÍO = modo desarrollo: no se envía nada y el código se muestra en
       * pantalla. Sirve para probar el flujo completo sin montar un servidor.
       *
       * CON URL = modo real: la app hace un POST a esa dirección con
       * `{ to, name, code, expiresInMinutes }` y el servicio manda el correo.
       * Hay un servidor de ejemplo en `docs/servidor-de-correo/`.
       */
      endpoint: string;
      /** Remitente que verá el estudiante. Solo texto informativo. */
      fromLabel: string;
    };
  };

  /** Cursos/niveles disponibles. Cada cuenta se asocia a uno (§7). */
  grades: string[];

  /**
   * Módulos habilitados. Un módulo registrado pero ausente de esta lista
   * queda invisible: sirve para lanzamientos por etapas (§11.6 del documento).
   */
  enabledModules: string[];

  /** Cuántos accesos directos muestra la barra inferior antes de "Más". */
  bottomNavSlots: number;

  /** Comportamiento de moderación (§7.1). */
  moderation: {
    /** Si es true, todo contenido creado por estudiantes nace en revisión. */
    requireApprovalForStudentContent: boolean;
    /** Motivos predefinidos para reportar contenido. */
    reportReasons: string[];
  };
}

export const appConfig: AppConfig = {
  organization: {
    shortName: 'Centro de Alumnos',
    fullName: 'Centro de Alumnos',
    institution: 'Comunidad Estudiantil',
    term: 'Periodo 2026',
  },

  auth: {
    allowedEmailDomains: ['verbo.cl'],
    emailHint:
      'Solo pueden ingresar los estudiantes de la nómina oficial, con su correo @verbo.cl.',
    // ⚠️ Cambiar a `false` antes del lanzamiento (ver la nota de arriba).
    enableDemoAccounts: true,

    requireEmailVerification: true,
    verification: {
      // Vacío = el código se muestra en pantalla en vez de enviarse.
      endpoint: '',
      fromLabel: 'Centro de Alumnos',
    },
  },

  /*
   * Cursos del establecimiento. Deben coincidir con los `grade` de la nómina
   * (`src/content/roster.ts`); los filtros de la base de contactos se generan
   * desde aquí y ocultan solos los cursos sin estudiantes.
   *
   * III y IV Medio quedan declarados a la espera de sus nóminas.
   */
  grades: [
    '8° Básico A',
    '8° Básico B',
    '8° Básico C',
    '8° Básico D',
    'I Medio A',
    'I Medio B',
    'I Medio C',
    'I Medio D',
    'I Medio E',
    'II Medio A',
    'II Medio B',
    'II Medio C',
    'II Medio D',
    'II Medio E',
    'III Medio A',
    'III Medio B',
    'III Medio C',
    'III Medio D',
    'III Medio E',
    'IV Medio A',
    'IV Medio B',
    'IV Medio C',
    'IV Medio D',
    'IV Medio E',
  ],

  enabledModules: [
    'home',
    'announcements',
    'news',
    'calendar',
    'events',
    'sports',
    'benefits',
    'projects',
    'directory',
    'profile',
    'admin',
  ],

  bottomNavSlots: 4,

  moderation: {
    requireApprovalForStudentContent: true,
    reportReasons: [
      'Contenido ofensivo o agresivo',
      'Información falsa o engañosa',
      'No corresponde a la categoría',
      'Contenido comercial no permitido',
      'Datos personales de terceros',
      'Otro motivo',
    ],
  },
};
