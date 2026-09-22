import { useMemo } from 'react';
import { BookOpen, ExternalLink, Folders, Info, Sparkles } from 'lucide-react';
import { useAuth } from '@/core/auth/AuthContext';
import type { CarpetaApuntes } from '@/core/types';
import { Card, CardListSkeleton, EmptyState, Page, PageHeader, SectionHeader, cn } from '@/ui';
import { ordenarCarpetas, useCarpetas } from './api';
import { cursoDeGeneracion, esEnlaceSeguro, generacionDe } from './generacion';
import { useMarcarVisto } from '@/core/novedades/useNovedades';

/* ============================================================================
   CENTRAL DE APUNTES
   ----------------------------------------------------------------------------
   Cada generación tiene su carpeta de Drive con apuntes. La app no guarda los
   apuntes: lleva a la carpeta, y quién puede abrirla lo decide Google.

   QUÉ VE CADA UNO
   Un alumno ve la carpeta de SU generación, calculada desde su curso, y las
   que son para todos. Las de otras generaciones no le sirven y solo harían
   ruido. El equipo del Centro de Alumnos ve todas, para poder revisarlas; y si
   el curso de alguien no se reconoce, también ve todas, antes que ninguna.
   ========================================================================== */

export function ApuntesPage() {
  /* Al abrir esta seccion, lo que habia sin ver deja de estar sin ver. */
  useMarcarVisto('apuntes');

  const { user, role } = useAuth();
  const { data, isLoading } = useCarpetas();

  const miGeneracion = generacionDe(user?.grade);
  const esEquipo = role === 'moderator' || role === 'admin';
  const verTodas = esEquipo || miGeneracion === null;

  const { mias, paraTodos, otras } = useMemo(() => {
    const carpetas = ordenarCarpetas(data ?? []);
    return {
      mias: carpetas.filter((c) => miGeneracion !== null && c.generacion === miGeneracion),
      paraTodos: carpetas.filter((c) => c.generacion == null),
      otras: carpetas.filter((c) => c.generacion != null && c.generacion !== miGeneracion),
    };
  }, [data, miGeneracion]);

  // Las otras generaciones, agrupadas por año, solo para quien puede verlas.
  const otrasPorGeneracion = useMemo(() => {
    const grupos = new Map<number, CarpetaApuntes[]>();
    otras.forEach((c) => grupos.set(c.generacion!, [...(grupos.get(c.generacion!) ?? []), c]));
    return [...grupos.entries()];
  }, [otras]);

  const nada = mias.length === 0 && paraTodos.length === 0 && (!verTodas || otras.length === 0);

  return (
    <Page>
      <PageHeader
        title="Central de apuntes"
        description="Los apuntes de tu generación, en su carpeta de Drive."
      />

      {isLoading ? (
        <CardListSkeleton count={2} />
      ) : nada ? (
        <EmptyState
          icon={BookOpen}
          title="Tu generación todavía no tiene carpeta"
          description="Cuando el Centro de Alumnos la agregue, aparecerá aquí."
        />
      ) : (
        <>
          {miGeneracion !== null ? (
            <section className="mb-6">
              <SectionHeader
                title={`Generación ${miGeneracion}`}
                description={`Tu generación${cursoDeGeneracion(miGeneracion) ? ` · ${cursoDeGeneracion(miGeneracion)}` : ''}`}
              />
              {mias.length ? (
                <div className="lista-animada space-y-2.5">
                  {mias.map((carpeta) => (
                    <CarpetaCard key={carpeta.id} carpeta={carpeta} destacada />
                  ))}
                </div>
              ) : (
                <Card>
                  <p className="text-[13.5px] text-ink-2">
                    Tu generación todavía no tiene carpeta. Cuando el Centro de Alumnos la agregue,
                    aparecerá aquí.
                  </p>
                </Card>
              )}
            </section>
          ) : null}

          {paraTodos.length ? (
            <section className="mb-6">
              <SectionHeader title="Para todos" description="Material que sirve a cualquier generación." />
              <div className="lista-animada space-y-2.5">
                {paraTodos.map((carpeta) => (
                  <CarpetaCard key={carpeta.id} carpeta={carpeta} />
                ))}
              </div>
            </section>
          ) : null}

          {verTodas
            ? otrasPorGeneracion.map(([generacion, carpetas]) => (
                <section key={generacion} className="mb-6">
                  <SectionHeader
                    title={`Generación ${generacion}`}
                    description={cursoDeGeneracion(generacion) ?? 'Ya egresó'}
                  />
                  <div className="lista-animada space-y-2.5">
                    {carpetas.map((carpeta) => (
                      <CarpetaCard key={carpeta.id} carpeta={carpeta} />
                    ))}
                  </div>
                </section>
              ))
            : null}

          <p className="flex gap-2 px-1 text-[12.5px] leading-relaxed text-ink-3">
            <Info size={15} className="mt-0.5 shrink-0" />
            Si Drive no te deja entrar, abre la carpeta con tu correo @verbo.cl: cada carpeta se
            comparte solo con su generación.
          </p>
        </>
      )}
    </Page>
  );
}

/* ============================================================================
   TARJETA DE UNA CARPETA
   ----------------------------------------------------------------------------
   Cada carpeta se ve como una portada de material: a la izquierda, un cuadro
   verde con el icono grande de "muchas carpetas" —dos carpetas apiladas, que
   sugiere apuntes acumulados y no una carpeta vacía— y a la derecha el título
   con su descripción. Debajo, un botón ancho para abrirla en Drive.

   LA DE MI GENERACIÓN, SEÑALADA
   Cuando la tarjeta pertenece a la generación de quien mira, lleva un anillo
   dorado y una pequeña etiqueta arriba: es lo que la persona vino a buscar y
   no debería costarle encontrarla entre las demás.
   ========================================================================== */

function CarpetaCard({ carpeta, destacada }: { carpeta: CarpetaApuntes; destacada?: boolean }) {
  const seguro = esEnlaceSeguro(carpeta.url);
  const esDrive = seguro && /(^|\.)google\.com$/i.test(new URL(carpeta.url.trim()).hostname);

  return (
    <Card
      flush
      className={cn(
        'relative',
        destacada && 'ring-2 ring-accent-400 dark:ring-accent-500',
      )}
    >
      {destacada ? (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-accent-500 px-2.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wide text-on-accent shadow-raised">
          <Sparkles size={11} />
          Tu generación
        </span>
      ) : null}

      <div className="flex items-stretch gap-3.5 p-4 pb-3.5">
        {/* El icono va sobre un cuadro con gradiente verde: el mismo verde de
            la marca, para que la carpeta se sienta parte de la app y no un
            adorno pegado. */}
        <span
          aria-hidden
          className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-raised"
        >
          <Folders size={26} strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1 self-center">
          <h3 className="text-[16px] font-extrabold leading-tight tracking-tight text-ink">
            {carpeta.titulo}
          </h3>
          {carpeta.descripcion ? (
            <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-ink-2">
              {carpeta.descripcion}
            </p>
          ) : null}
        </div>
      </div>

      {seguro ? (
        <a
          href={carpeta.url.trim()}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'flex items-center justify-center gap-2 border-t border-line px-4 py-3',
            'bg-brand-50 text-[13.5px] font-bold text-brand-700 transition',
            'hover:bg-brand-100 active:scale-[0.99]',
            'dark:bg-brand-950 dark:text-brand-200 dark:hover:bg-brand-900',
          )}
        >
          {esDrive ? 'Abrir en Drive' : 'Abrir carpeta'}
          <ExternalLink size={14} />
        </a>
      ) : (
        <p className="border-t border-line px-4 py-3 text-[12.5px] text-ink-3">
          El enlace de esta carpeta no es válido. Avísale al Centro de Alumnos.
        </p>
      )}
    </Card>
  );
}
