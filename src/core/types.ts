/* ============================================================================
   TIPOS DE DOMINIO
   ----------------------------------------------------------------------------
   Modelo de datos derivado directamente del documento de requisitos.
   Cada entidad de contenido creada por usuarios lleva estado de moderación
   (§7.1) y autoría identificada (§7).
   ========================================================================== */

export type ID = string;

/* --- Roles y permisos (§8) -------------------------------------------------- */

/** Jerarquía de acceso: estudiante < moderador < administrador. */
export type Role = 'student' | 'moderator' | 'admin';

export const ROLE_ORDER: Record<Role, number> = {
  student: 0,
  moderator: 1,
  admin: 2,
};

export const ROLE_LABEL: Record<Role, string> = {
  student: 'Estudiante',
  moderator: 'Moderador',
  admin: 'Administrador',
};

/* --- Moderación (§7.1) ------------------------------------------------------ */

export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested';

export const MODERATION_LABEL: Record<ModerationStatus, string> = {
  pending: 'En revisión',
  approved: 'Publicado',
  rejected: 'Rechazado',
  changes_requested: 'Cambios solicitados',
};

/** Campos que comparte todo contenido sujeto a revisión previa. */
export interface Moderatable {
  status: ModerationStatus;
  /** Comentario del moderador al rechazar o pedir cambios. */
  moderationNote?: string;
  moderatedBy?: ID;
  moderatedAt?: string;
}

/** Campos comunes a toda entidad persistida. */
export interface BaseEntity {
  id: ID;
  createdAt: string;
  updatedAt: string;
}

/** Referencia ligera al autor, para no depender de un join en la vista. */
export interface AuthorRef {
  id: ID;
  name: string;
  grade: string;
  avatarKey?: string;
}

/* --- Usuarios (§6.8) -------------------------------------------------------- */

export interface User extends BaseEntity {
  name: string;
  email: string;
  grade: string;
  role: Role;
  /** Clave del manifiesto de imágenes; la foto es opcional (§6.8). */
  avatarKey?: string;
  bio?: string;
  active: boolean;
  /** Teléfono de contacto. Opcional: aparece en la base de contactos. */
  phone?: string;
  /**
   * Oculta la cuenta de la base de contactos. Cada persona decide si figura
   * en el buscador; el correo y el teléfono nunca se muestran sin su permiso.
   */
  hideFromDirectory?: boolean;
}

/* --- Proyectos del colegio — solo administradores publican ------------------
   Iniciativas que existen o existieron en el establecimiento, contadas para
   que los cursos más pequeños entiendan qué hay y cómo sumarse.            */

export type ProjectStatus = 'activo' | 'historico';

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  activo: 'En marcha',
  historico: 'Histórico',
};

export interface Project extends BaseEntity {
  title: string;
  /** Frase corta que se lee en la tarjeta del listado. */
  summary: string;
  /** Relato completo: de qué se trata, cómo partió y qué ha logrado. */
  description: string;
  /** Área temática. Se define en content/taxonomies.ts */
  area: string;
  status: ProjectStatus;
  /** Año en que partió. */
  startYear: number;
  /** Año en que terminó. `null` mientras siga vigente. */
  endYear: number | null;
  imageKey?: string;
  /** Quién lo lleva adelante: un curso, una academia, un taller. */
  ledBy?: string;
  /** Cómo participar. Es el dato que más busca un alumno de básica. */
  howToJoin?: string;
}

/* --- Noticias (§6.2) — solo administradores publican ------------------------ */

export interface NewsPost extends BaseEntity, Moderatable {
  title: string;
  summary: string;
  body: string;
  /** Categoría editorial libre, definida en content/taxonomies.ts */
  category: string;
  imageKey?: string;
  author: AuthorRef;
  /** Fija la noticia arriba en Inicio y Noticias. */
  featured: boolean;
  publishedAt: string;
}

/* --- Eventos (§6.3) --------------------------------------------------------- */

export interface EventItem extends BaseEntity, Moderatable {
  title: string;
  description: string;
  category: string;
  imageKey?: string;
  /** ISO 8601. */
  startsAt: string;
  endsAt?: string;
  location: string;
  /** Requisitos de participación (§6.3). */
  requirements?: string;
  contactName?: string;
  contactEmail?: string;
  organizer: AuthorRef;
}

/* --- Comunicados del Centro de Alumnos -------------------------------------
   Información breve del día a día. A diferencia de las noticias (§6.2), que
   son piezas editoriales con imagen y bajada, un comunicado es un aviso corto
   y fechado: cambio de horario, suspensión de una actividad, recordatorios.  */

export type AnnouncementPriority = 'normal' | 'importante' | 'urgente';

export const ANNOUNCEMENT_PRIORITY_LABEL: Record<AnnouncementPriority, string> = {
  normal: 'Informativo',
  importante: 'Importante',
  urgente: 'Urgente',
};

/**
 * Qué clase de comunicado es.
 *   'general'     el aviso del día a día.
 *   'inscripcion' anuncia una convocatoria abierta.
 *
 * Las inscripciones NO se gestionan dentro de la aplicación: el colegio no lo
 * autoriza. El comunicado informa de la convocatoria y explica en su texto
 * cómo participar ("habla con tu profesor jefe", "formulario en secretaría").
 */
export type AnnouncementKind = 'general' | 'inscripcion';

export const ANNOUNCEMENT_KIND_LABEL: Record<AnnouncementKind, string> = {
  general: 'Comunicado',
  inscripcion: 'Inscripción',
};

export interface Announcement extends BaseEntity {
  title: string;
  body: string;
  kind: AnnouncementKind;
  priority: AnnouncementPriority;
  /** A quién está dirigido: "Toda la comunidad", "III y IV Medio"… */
  audience: string;
  /** Lo mantiene arriba del listado mientras siga vigente. */
  pinned: boolean;
  /**
   * Último día para postular. Solo en los de tipo 'inscripcion' y opcional.
   * Cuando está, la convocatoria aparece sola en el calendario mensual.
   */
  deadline?: string;
  /**
   * Cuándo se hace la actividad, si ya está definida. Es distinto del plazo
   * para postular: se puede postular hasta el 12 y la actividad ser el 20.
   */
  activityDate?: string;
  /**
   * Quién está a cargo: los jefes del proyecto, tal como se les conoce en el
   * colegio. Texto libre, porque pueden ser uno, varios, un curso o un
   * profesor, y estructurarlo obligaría a un formulario que nadie llenaría.
   */
  leads?: string;
  author: AuthorRef;
  publishedAt: string;
}

/* --- Beneficios canjeables por QR -------------------------------------------
   Convenios conseguidos por el Centro de Alumnos. Cada beneficio guarda el
   la plataforma no procesa pagos ni valida canjes: solo le muestra al
   estudiante el código que el local acordó con el Centro de Alumnos.                    */

export interface Benefit extends BaseEntity {
  /** Nombre del beneficio tal como lo ve el estudiante. */
  name: string;
  /** Comercio, marca o institución que lo otorga. */
  partner: string;
  /** Una línea de resumen para el listado. */
  summary: string;
  /** Descripción completa: qué es y de qué se trata. */
  description: string;
  /** Condiciones de uso: vigencia, tope, restricciones. */
  terms?: string;
  category: string;
  logoImageKey?: string;
  /** Cómo se canjea. Cada local tiene su forma; si falta, la ficha no promete
   *  nada y el panel avisa que hay que completarlo. */
  redeem?: BenefitRedeem;
  /** @deprecated Código de canje inventado por la app. Ya no se muestra ni se
   *  guarda: al editar un convenio se borra. */
  code?: string;
  /** Fecha de término del convenio, ISO 8601. */
  validUntil?: string;
  active: boolean;
}

/**
 * Las formas de canjear un convenio. Cada una la define el local, no la app:
 *   · codigo       un código que el local entregó, y que se dicta o se muestra.
 *   · qr           un QR que el local entregó, y que escanean en caja.
 *   · enlace       una tienda en línea, con o sin cupón.
 *   · indicaciones basta con seguir unos pasos: mostrar la credencial, decir
 *                  que uno es del colegio…
 */
export type RedeemMethod = 'codigo' | 'qr' | 'enlace' | 'indicaciones';

export interface BenefitRedeem {
  method: RedeemMethod;
  /** El código del local (forma `codigo`) o el cupón de la tienda (`enlace`). */
  code?: string;
  /** El QR como imagen, tal como lo mandó el local (forma `qr`). */
  qrImage?: string;
  /** O el contenido del QR, si el local lo mandó como texto o enlace. */
  qrValue?: string;
  /** Dirección de la tienda en línea (forma `enlace`). */
  url?: string;
  /** Pasos a seguir, uno por línea. En `indicaciones` es lo único que hay. */
  steps?: string;
}

/* --- 365 · Resultados de las selecciones ------------------------------------
   Cinco disciplinas por tres categorías. Un resultado corresponde siempre a
   una selección concreta (disciplina + categoría).                           */

export type SportDiscipline = 'futbol' | 'basquetbol' | 'tenis' | 'voleibol' | 'atletismo';

export type SportLevel = 'infantil' | 'intermedia' | 'superior';

export type MatchOutcome = 'victoria' | 'empate' | 'derrota' | 'participacion';

export const OUTCOME_LABEL: Record<MatchOutcome, string> = {
  victoria: 'Victoria',
  empate: 'Empate',
  derrota: 'Derrota',
  participacion: 'Participación',
};

export interface SportsResult extends BaseEntity {
  discipline: SportDiscipline;
  level: SportLevel;
  /** Fecha del encuentro o de la competencia, ISO 8601. */
  playedAt: string;
  /** Rival del encuentro, o nombre de la prueba en atletismo. */
  opponent: string;
  /** Torneo o campeonato al que pertenece. */
  competition?: string;
  location?: string;
  /**
   * Marcador. En disciplinas sin marcador (atletismo) se dejan en `null` y el
   * resultado se cuenta como participación.
   */
  scoreFor: number | null;
  scoreAgainst: number | null;
  outcome: MatchOutcome;
  /** Detalle libre: goleadores, tiempos, posiciones obtenidas. */
  highlights?: string;
  author: AuthorRef;
}

/* --- Casino ------------------------------------------------------------------
   La minuta del almuerzo. Al Centro de Alumnos le llega por mes, así que se
   guarda un documento por mes con sus días adentro: se carga de una vez y se
   corrige de una vez. Los alumnos solo la leen; no hay calificaciones ni
   comentarios, porque la app no publica nada escrito por estudiantes.        */

export interface MenuDelDia {
  /** Día en hora local: "2026-09-18". */
  fecha: string;
  /** Plato de fondo. Vacío si ese día no hay servicio. */
  principal: string;
  entrada?: string;
  /** Opción vegetariana o alternativa al plato de fondo. */
  alternativa?: string;
  postre?: string;
  /** Feriado o jornada sin clases: ese día no se sirve almuerzo. */
  sinServicio?: boolean;
}

export interface MinutaCasino extends BaseEntity {
  /** Mes de la minuta: "2026-09". Hay una sola por mes. */
  mes: string;
  dias: MenuDelDia[];
  /** Aviso general del mes, p. ej. "La minuta puede cambiar sin aviso". */
  nota?: string;
}

/* --- Central de apuntes ------------------------------------------------------
   Enlaces a las carpetas de Drive de cada generación. La app no guarda los
   apuntes: solo lleva a la carpeta, y quién puede abrirla lo sigue decidiendo
   Google con los permisos de esa carpeta.                                     */

export interface CarpetaApuntes extends BaseEntity {
  titulo: string;
  /** Enlace a la carpeta. Solo se abren los que empiezan con https://. */
  url: string;
  /**
   * Año de egreso de la generación: 2027. Se guarda el año y no el curso para
   * que el enlace siga sirviendo cuando esa generación pase de curso: si fuera
   * por curso, habría que cambiar todos los enlaces cada marzo. Sin año, la
   * carpeta es para todas las generaciones.
   */
  generacion?: number;
  descripcion?: string;
}
