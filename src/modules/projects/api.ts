import { db } from '@/core/data';
import type { CreateInput } from '@/core/data';
import { useCollection, useDataMutation, useEntity } from '@/core/hooks/useData';
import type { ID, Project } from '@/core/types';

export function useProjectList() {
  return useCollection('projects', db.projects);
}

export function useProject(id: ID | undefined) {
  return useEntity('projects', db.projects, id);
}

/**
 * Los que siguen en marcha primero, y dentro de cada grupo, del más nuevo al
 * más antiguo. Un alumno que entra buscando en qué meterse ve primero lo que
 * todavía existe.
 */
export function sortProjects(items: Project[]): Project[] {
  return [...items].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'activo' ? -1 : 1;
    return b.startYear - a.startYear;
  });
}

/** Rango de años en texto: "2018 – hoy" o "2017 – 2023". */
export function projectYears(project: Project): string {
  if (project.endYear === null) return `${project.startYear} – hoy`;
  if (project.endYear === project.startYear) return String(project.startYear);
  return `${project.startYear} – ${project.endYear}`;
}

export function useCreateProject() {
  return useDataMutation((input: CreateInput<Project>) => db.projects.create(input), ['projects']);
}

export function useUpdateProject() {
  return useDataMutation(
    ({ id, patch }: { id: ID; patch: Partial<Project> }) => db.projects.update(id, patch),
    ['projects'],
  );
}

export function useDeleteProject() {
  return useDataMutation((id: ID) => db.projects.remove(id), ['projects']);
}
