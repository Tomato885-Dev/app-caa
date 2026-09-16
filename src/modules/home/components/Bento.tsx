import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, Megaphone, Ticket, UtensilsCrossed } from 'lucide-react';
import type { Announcement, Benefit, EventItem } from '@/core/types';
import { faltaPara, parseDate } from '@/core/utils/date';
import type { MenuDestacado } from '@/modules/casino/components/HoyEnElCasino';
import { AppImage, Avatar, cn } from '@/ui';

/* ============================================================================
   LA PORTADA EN BLOQUES ("BENTO")
   ----------------------------------------------------------------------------
   En vez de una grilla de íconos iguales que no dicen nada, Inicio muestra
   bloques de distinto tamaño con lo que está pasando AHORA: qué se come hoy,
   cuándo es lo próximo, el último aviso y cuántos descuentos hay.

   Cada bloque es a la vez un dato y un atajo. Así la portada cambia todos los
   días, y abrir la app siempre enseña algo nuevo: esa es la razón para volver.

   Si falta un dato (no hay minuta, no hay eventos), el bloque no desaparece:
   se queda como acceso, con una frase que invita a entrar.
   ========================================================================== */

function Bloque({
  to,
  className,
  children,
  delay = 0,
}: {
  to: string;
  className?: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <Link
      to={to}
      style={{ animationDelay: `${delay}ms` }}
      className={cn(
        'animate-in-up group relative flex flex-col overflow-hidden rounded-[1.6rem] p-4 shadow-card transition duration-200',
        'hover:-translate-y-1 hover:shadow-raised active:scale-[0.97]',
        className,
      )}
    >
      <ArrowUpRight
        aria-hidden
        size={18}
        className="absolute right-3.5 top-3.5 opacity-60 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
      />
      {children}
    </Link>
  );
}

function Etiqueta({ icon: Icon, children }: { icon: typeof Megaphone; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.12em]">
      <Icon size={13} strokeWidth={2.6} />
      {children}
    </span>
  );
}

export function Bento({
  casino,
  proximo,
  ultimoAviso,
  avisosDeLaSemana,
  colaboradores,
}: {
  casino: MenuDestacado | null;
  proximo?: EventItem;
  ultimoAviso?: Announcement;
  avisosDeLaSemana: number;
  colaboradores: Benefit[];
}) {
  const fecha = proximo ? parseDate(proximo.startsAt) : null;
  const mes = fecha
    ? new Intl.DateTimeFormat('es-CL', { month: 'short' }).format(fecha).replace('.', '')
    : '';

  return (
    <section aria-label="Lo de hoy" className="mb-8 grid grid-cols-2 gap-3">
      {/* Casino: alto, en amarillo. Es lo que más se mira. */}
      <Bloque to="/casino" className="row-span-2 min-h-[15rem] bg-accent-500 text-on-accent" delay={60}>
        <Etiqueta icon={UtensilsCrossed}>{casino ? `${casino.cuando} se come` : 'Casino'}</Etiqueta>
        <span
          aria-hidden
          className="pointer-events-none absolute -right-12 top-10 size-32 rounded-full bg-accent-300"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute right-6 top-24 size-5 rounded-full border-[3px] border-on-accent opacity-20"
        />
        <span className="relative mt-auto">
          {casino ? (
            <>
              <span className="line-clamp-4 block text-[21px] font-extrabold leading-[1.1] tracking-tight">
                {casino.destacado}
              </span>
              {casino.menu.postre && casino.menu.postre !== casino.destacado ? (
                <span className="mt-1.5 line-clamp-1 block text-[12px] font-semibold opacity-75">
                  + {casino.menu.postre}
                </span>
              ) : null}
            </>
          ) : (
            <span className="block text-[19px] font-extrabold leading-tight">
              Mira la minuta de la semana
            </span>
          )}
        </span>
      </Bloque>

      {/* Próximo evento: el número del día, grande. */}
      <Bloque to={proximo ? `/eventos/${proximo.id}` : '/eventos'} className="bg-brand-500 text-white" delay={120}>
        <Etiqueta icon={CalendarDays}>
          <span className="text-accent-500">
            {proximo ? faltaPara(proximo.startsAt, proximo.endsAt) ?? 'Próximo' : 'Eventos'}
          </span>
        </Etiqueta>
        {proximo && fecha ? (
          <>
            <span className="mt-2 flex items-baseline gap-1.5">
              <span className="text-[40px] font-black leading-none tracking-tighter">{fecha.getDate()}</span>
              <span className="text-[13px] font-extrabold uppercase text-brand-200">{mes}</span>
            </span>
            <span className="mt-1 line-clamp-2 text-[13px] font-bold leading-snug">{proximo.title}</span>
          </>
        ) : (
          <span className="mt-auto text-[15px] font-bold leading-snug">Todo lo que viene</span>
        )}
      </Bloque>

      {/* Avisos: cuántos salieron esta semana, y el último. */}
      <Bloque to="/comunicados" className="bg-brand-800 text-white dark:bg-surface-3" delay={180}>
        <Etiqueta icon={Megaphone}>
          <span className="text-brand-200 dark:text-ink-2">Avisos</span>
        </Etiqueta>
        <span className="mt-2 flex items-center gap-2">
          <span className="text-[40px] font-black leading-none tracking-tighter text-accent-500">
            {avisosDeLaSemana}
          </span>
          <span className="text-[11.5px] font-semibold leading-tight text-brand-200 dark:text-ink-2">
            esta
            <br />
            semana
          </span>
        </span>
        {ultimoAviso ? (
          <span className="mt-1 line-clamp-2 text-[13px] font-bold leading-snug">{ultimoAviso.title}</span>
        ) : null}
      </Bloque>

      {/* Colaboradores: a lo ancho, con los logos de verdad. */}
      <Bloque to="/colaboradores" className="col-span-2 flex-row items-center gap-3 bg-surface text-ink ring-1 ring-line" delay={240}>
        <span className="flex shrink-0 -space-x-4">
          {colaboradores.slice(0, 3).map((beneficio) => (
            <span
              key={beneficio.id}
              className="flex size-11 items-center justify-center overflow-hidden rounded-full border-[3px] border-surface bg-white"
            >
              {beneficio.logoImageKey ? (
                <AppImage imageKey={beneficio.logoImageKey} ratio="1/1" compact fit="contain" rounded={false} />
              ) : (
                <Avatar name={beneficio.partner} size="sm" />
              )}
            </span>
          ))}
          {colaboradores.length === 0 ? (
            <span className="flex size-11 items-center justify-center rounded-full bg-accent-500 text-on-accent">
              <Ticket size={20} />
            </span>
          ) : null}
        </span>
        <span className="min-w-0 pr-6">
          <span className="block text-[15px] font-extrabold leading-tight">
            {colaboradores.length > 0 ? `${colaboradores.length} descuentos` : 'Colaboradores'}
          </span>
          <span className="block text-[12.5px] text-ink-2">Para ti, y cómo canjear cada uno</span>
        </span>
      </Bloque>
    </section>
  );
}
