import { appConfig } from '@/config/app.config';
import { ROLE_ORDER, type Role } from '@/core/types';
import type { AppModule, CalendarSource, ModerationSource } from './types';

/* ============================================================================
   REGISTRO DE MÓDULOS
   ----------------------------------------------------------------------------
   Consultas derivadas sobre la lista de módulos: navegación, rutas y fuentes
   de moderación. El router, el menú y el panel de administración leen de aquí,
   por lo que un módulo nuevo aparece en los tres lugares por sí solo.
   ========================================================================== */

let registry: AppModule[] = [];

export function registerModules(modules: AppModule[]): void {
  const ids = new Set<string>();
  for (const mod of modules) {
    if (ids.has(mod.id)) {
      throw new Error(`Módulo duplicado: "${mod.id}". Los ids deben ser únicos.`);
    }
    ids.add(mod.id);
  }
  registry = modules;
}

/** Todos los módulos registrados y habilitados en la configuración. */
export function getModules(): AppModule[] {
  return registry.filter((mod) => appConfig.enabledModules.includes(mod.id));
}

export function getModule(id: string): AppModule | undefined {
  return getModules().find((mod) => mod.id === id);
}

/** Módulo al que pertenece una ruta; usa la coincidencia más específica. */
export function findModuleByPath(pathname: string): AppModule | undefined {
  return getModules()
    .filter((mod) => pathname === mod.path || pathname.startsWith(`${mod.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0];
}

export function canAccess(mod: AppModule, role: Role | null): boolean {
  if (!role) return false;
  return ROLE_ORDER[role] >= ROLE_ORDER[mod.minRole ?? 'student'];
}

/** Módulos visibles para un rol, ya ordenados. */
export function getVisibleModules(role: Role | null): AppModule[] {
  return getModules()
    .filter((mod) => canAccess(mod, role))
    .sort((a, b) => a.nav.order - b.nav.order);
}

export interface NavGroups {
  /** Accesos directos de la barra inferior en móvil. */
  bottom: AppModule[];
  /** Resto de módulos, mostrados en "Más" y en el menú lateral. */
  overflow: AppModule[];
  /** Todos los visibles, en orden. */
  all: AppModule[];
}

/**
 * Reparte los módulos entre la barra inferior y el menú "Más".
 * La barra nunca crece: al agregar módulos, los nuevos caen en "Más".
 */
export function getNavGroups(role: Role | null): NavGroups {
  const all = getVisibleModules(role).filter((mod) => mod.nav.section !== 'hidden');
  const primary = all.filter((mod) => mod.nav.section === 'primary');
  const secondary = all.filter((mod) => mod.nav.section === 'secondary');

  const slots = Math.max(1, appConfig.bottomNavSlots);
  return {
    bottom: primary.slice(0, slots),
    overflow: [...primary.slice(slots), ...secondary],
    all,
  };
}

/** Fuentes de moderación aportadas por todos los módulos habilitados. */
export function getModerationSources(): ModerationSource[] {
  return getModules().flatMap((mod) => mod.moderationSources ?? []);
}

/** Fuentes de contenido fechado que alimentan el calendario mensual. */
export function getCalendarSources(): CalendarSource[] {
  return getModules().flatMap((mod) => mod.calendarSources ?? []);
}
