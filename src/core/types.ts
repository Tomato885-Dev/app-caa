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
  /** Enlaza el evento con una actividad con inscripción abierta. */
  signupActivityId?: ID;
}

/* --- Inscripciones (§6.4) --------------------------------------------------- */

export type SignupActivityKind =
  | 'accion_social'
  | 'scout'
  | 'torneo'
  | 'proyecto'
  | 'centro_alumnos'
  | 'otro';

export interface SignupActivity extends BaseEntity, Moderatable {
  title: string;
  description: string;
  kind: SignupActivityKind;
  imageKey?: string;
  organizer: AuthorRef;
  /** Fecha límite de inscripción, ISO 8601. */
  closesAt: string;
  /** Cupos totales. `null` = sin límite. */
  capacity: number | null;
  location?: string;
  requirements?: string;
  /** Preguntas adicionales del formulario de inscripción. */
  questions: SignupQuestion[];
  open: boolean;
}

export interface SignupQuestion {
  id: ID;
  label: string;
  type: 'text' | 'textarea' | 'select';
  required: boolean;
  options?: string[];
}

export interface Registration extends BaseEntity {
  activityId: ID;
  user: AuthorRef;
  answers: Record<string, string>;
  state: 'confirmed' | 'waitlist' | 'cancelled';
}

/* --- Comunidad y actividades permanentes (§6.6) ----------------------------- */

export interface CommunityGroup extends BaseEntity, Moderatable {
  name: string;
  shortDescription: string;
  about: string;
  /** Objetivos de la organización (§6.6). */
  goals: string[];
  /** Cómo participar (§6.6). */
  howToJoin: string;
  category: string;
  coverImageKey?: string;
  logoImageKey?: string;
  /** Responsables (§6.6). */
  leads: AuthorRef[];
  /** Enlaces de contacto (§6.6). */
  links: ContactLink[];
  meetingInfo?: string;
}

export interface ContactLink {
  label: string;
  /** mailto:, https:// o tel: */
  url: string;
}

/* --- Marketplace (§6.7) ----------------------------------------------------- */

export interface MarketplaceListing extends BaseEntity, Moderatable {
  title: string;
  description: string;
  category: string;
  type: 'producto' | 'servicio';
  /**
   * Precio referencial en texto ("$3.000", "A convenir").
   * La plataforma NO procesa pagos (§6.7 y §7.2): es solo difusión.
   */
  priceLabel: string;
  imageKeys: string[];
  seller: AuthorRef;
  /** Medio de contacto externo elegido por quien publica. */
  contact: ContactLink;
  available: boolean;
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

export interface Announcement extends BaseEntity {
  title: string;
  body: string;
  priority: AnnouncementPriority;
  /** A quién está dirigido: "Toda la comunidad", "III y IV Medio"… */
  audience: string;
  /** Lo mantiene arriba del listado mientras siga vigente. */
  pinned: boolean;
  author: AuthorRef;
  publishedAt: string;
}

/* --- Beneficios canjeables por QR -------------------------------------------
   Convenios conseguidos por el Centro de Alumnos. Cada beneficio guarda el
   contenido que se codifica en el código QR; la plataforma no procesa pagos
   ni valida canjes: solo muestra el código al estudiante.                    */

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
  /** Texto que se codifica en el QR: un código, una URL o un identificador. */
  qrValue: string;
  /** Código legible, por si el lector del comercio no funciona. */
  code?: string;
  /** Fecha de término del convenio, ISO 8601. */
  validUntil?: string;
  active: boolean;
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

/* --- Reportes de usuarios (§8.2) -------------------------------------------- */

/** Identifica el tipo de contenido reportado o moderado. */
export type ContentKind =
  | 'news'
  | 'event'
  | 'signupActivity'
  | 'communityGroup'
  | 'marketplaceListing';

export interface Report extends BaseEntity {
  contentKind: ContentKind;
  contentId: ID;
  contentTitle: string;
  reason: string;
  detail?: string;
  reporter: AuthorRef;
  state: 'open' | 'reviewed' | 'dismissed';
  resolutionNote?: string;
}
