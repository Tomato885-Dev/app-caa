import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { activar, desactivar, estadoActual, type EstadoPush } from '@/core/notifications/push';
import { Button, Card, SectionHeader, useToast } from '@/ui';

/* ============================================================================
   AVISOS EN EL TELÉFONO
   ----------------------------------------------------------------------------
   El interruptor por dispositivo. Cada aparato concede su propio permiso, así
   que activarlo en el teléfono no lo activa en el computador: se dice en voz
   alta en vez de dejar que la persona lo descubra sola.

   CUANDO ESTÁ BLOQUEADO NO SE INSISTE
   Si alguien ya dijo que no, el navegador no vuelve a preguntar por mucho que
   se pulse el botón. Ofrecer un botón que no hace nada es peor que explicar
   dónde se cambia, así que se explica.
   ========================================================================== */

const TEXTOS: Record<EstadoPush, { titulo: string; detalle: string }> = {
  activo: {
    titulo: 'Avisos activados en este dispositivo',
    detalle:
      'Te llegará una notificación cuando el Centro de Alumnos publique algo importante, aunque tengas la app cerrada.',
  },
  inactivo: {
    titulo: 'Avisos desactivados',
    detalle:
      'Actívalos para enterarte de los comunicados sin tener que entrar a mirar. Puedes apagarlos cuando quieras.',
  },
  bloqueado: {
    titulo: 'Los avisos están bloqueados',
    detalle:
      'Dijiste que no la primera vez, y desde la app no se puede volver a preguntar. Se cambia en la configuración del navegador: busca los permisos de este sitio y permite las notificaciones.',
  },
  'no-soportado': {
    titulo: 'Este navegador no admite avisos',
    detalle:
      'En iPhone hay que agregar la app a la pantalla de inicio para recibirlos. Cuando la aplicación esté en App Store y Google Play, esto dejará de hacer falta.',
  },
  'sin-servidor': {
    titulo: 'Avisos no disponibles',
    detalle: 'Estás en la versión de demostración, que funciona solo dentro de este navegador.',
  },
};

export function NotificationsSection() {
  const notify = useToast();
  const [estado, setEstado] = useState<EstadoPush | null>(null);
  const [trabajando, setTrabajando] = useState(false);

  useEffect(() => {
    let vigente = true;
    void estadoActual().then((valor) => {
      if (vigente) setEstado(valor);
    });
    return () => {
      vigente = false;
    };
  }, []);

  // Mientras se averigua no se muestra nada: un interruptor que aparece
  // apagado y salta a encendido se lee como que uno lo apagó sin querer.
  if (estado === null) return null;

  const texto = TEXTOS[estado];
  const puedeActuar = estado === 'activo' || estado === 'inactivo';

  const alternar = async () => {
    setTrabajando(true);
    try {
      const siguiente = estado === 'activo' ? await desactivar() : await activar();
      setEstado(siguiente);

      if (siguiente === 'activo') notify('Listo, ya te van a llegar los avisos.');
      else if (siguiente === 'bloqueado') {
        notify('Tu navegador bloqueó los avisos. Se cambia en sus ajustes.', 'info');
      } else if (estado === 'activo') notify('Avisos desactivados en este dispositivo.', 'info');
    } catch (caught) {
      notify(caught instanceof Error ? caught.message : 'No se pudo cambiar.', 'info');
    } finally {
      setTrabajando(false);
    }
  };

  return (
    <section className="mb-6">
      <SectionHeader title="Avisos" />
      <Card>
        <div className="flex items-start gap-3">
          <div
            className={
              'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl ' +
              (estado === 'activo'
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                : 'bg-surface-3 text-ink-3')
            }
          >
            {estado === 'activo' ? <Bell size={18} /> : <BellOff size={18} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-semibold text-ink">{texto.titulo}</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-2">{texto.detalle}</p>
          </div>
        </div>

        {puedeActuar ? (
          <Button
            variant={estado === 'activo' ? 'ghost' : 'secondary'}
            size="sm"
            icon={estado === 'activo' ? BellOff : Bell}
            loading={trabajando}
            onClick={() => void alternar()}
            className="mt-3 w-full"
          >
            {estado === 'activo' ? 'Desactivar en este dispositivo' : 'Activar los avisos'}
          </Button>
        ) : null}

        {estado === 'activo' ? (
          <p className="mt-2.5 text-[11.5px] leading-relaxed text-ink-3">
            Vale solo para este dispositivo. Si también usas la app en otro, actívalos ahí.
          </p>
        ) : null}
      </Card>
    </section>
  );
}
