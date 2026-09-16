import { useEffect, useState } from 'react';
import { BellRing, CalendarDays, Megaphone, SlidersHorizontal } from 'lucide-react';
import { esNativo } from '@/core/notifications/nativo';
import { activar, estadoActual, soportaPush } from '@/core/notifications/push';
import { Button, Sheet, useToast } from '@/ui';

/* ============================================================================
   INVITACIÓN A ACTIVAR LOS AVISOS
   ----------------------------------------------------------------------------
   Los avisos solo se activaban desde Mi perfil, y al probar la app con alumnos
   de verdad resultó que nadie sabía que existían. Por eso ahora se ofrecen
   solos, al entrar.

   PRIMERO LA APP, DESPUÉS EL TELÉFONO
   Lo que aparece solo es esta hoja, no el permiso del sistema. En iPhone ese
   permiso se puede pedir UNA sola vez: si alguien aprieta "No permitir" por
   reflejo, la app ya no puede volver a preguntar y solo queda ir a Ajustes.
   Esta hoja explica antes para qué sirven, y el permiso del teléfono aparece
   recién cuando la persona dice que sí.

   SIN INSISTIR
   Quien dice "Ahora no" no la vuelve a ver al día siguiente: se espera una
   semana, y después de tres veces no se ofrece más. Mi perfil sigue ahí.
   Nunca aparece a quien ya los tiene activados, ni a quien ya los bloqueó.
   ========================================================================== */

const RECUERDO = 'avisos:invitacion';
const VECES_MAXIMAS = 3;
const ENTRE_INVITACIONES_MS = 7 * 24 * 60 * 60 * 1000;

/** Deja que la pantalla de inicio termine de aparecer antes de ofrecer nada. */
const ESPERA_MS = 1500;

interface Recuerdo {
  veces: number;
  ultima: number;
}

function leerRecuerdo(): Recuerdo {
  try {
    const dato: unknown = JSON.parse(localStorage.getItem(RECUERDO) ?? 'null');
    if (dato && typeof dato === 'object') {
      const { veces, ultima } = dato as Partial<Recuerdo>;
      return { veces: Number(veces) || 0, ultima: Number(ultima) || 0 };
    }
  } catch {
    // Un dato ilegible se trata como la primera vez.
  }
  return { veces: 0, ultima: 0 };
}

function anotarRechazo(): void {
  const { veces } = leerRecuerdo();
  try {
    localStorage.setItem(RECUERDO, JSON.stringify({ veces: veces + 1, ultima: Date.now() }));
  } catch {
    // Sin almacenamiento se volverá a ofrecer la próxima vez. Es el mal menor.
  }
}

function tocaInvitar(): boolean {
  const { veces, ultima } = leerRecuerdo();
  if (veces >= VECES_MAXIMAS) return false;
  return veces === 0 || Date.now() - ultima >= ENTRE_INVITACIONES_MS;
}

const MOTIVOS = [
  { icon: Megaphone, texto: 'Comunicados importantes y cambios de último minuto.' },
  { icon: CalendarDays, texto: 'Eventos nuevos, para que no se te pasen las inscripciones.' },
  { icon: SlidersHorizontal, texto: 'Los apagas cuando quieras, desde Mi perfil.' },
];

export function InvitacionAvisos() {
  const notify = useToast();
  const [abierta, setAbierta] = useState(false);
  const [trabajando, setTrabajando] = useState(false);

  useEffect(() => {
    if (!soportaPush() || !tocaInvitar()) return;

    let vigente = true;
    const espera = window.setTimeout(() => {
      /* Solo a quien puede activarlos y no lo ha hecho. 'activo', 'bloqueado'
         y 'sin-servidor' quedan fuera: ofrecer algo que ya tiene, o que no
         puede tener, es ruido. */
      estadoActual()
        .then((estado) => {
          if (vigente && estado === 'inactivo') setAbierta(true);
        })
        .catch(() => {
          // Si no se puede averiguar, no se ofrece. Mi perfil sigue disponible.
        });
    }, ESPERA_MS);

    return () => {
      vigente = false;
      window.clearTimeout(espera);
    };
  }, []);

  const ahoraNo = () => {
    anotarRechazo();
    setAbierta(false);
  };

  const activarAhora = async () => {
    setTrabajando(true);
    try {
      const estado = await activar();
      if (estado === 'activo') {
        notify('Listo, ya te van a llegar los avisos.');
      } else if (estado === 'bloqueado') {
        notify(
          esNativo()
            ? 'El teléfono bloqueó los avisos. Se cambia en sus ajustes.'
            : 'Tu navegador bloqueó los avisos. Se cambia en sus ajustes.',
          'info',
        );
      } else {
        // Cerró el permiso del sistema sin contestar: cuenta como "Ahora no".
        anotarRechazo();
      }
    } catch (caught) {
      /* Se anota igual: si el problema es del servidor, ofrecerlo en cada
         entrada solo repetiría el mismo error. */
      anotarRechazo();
      notify(caught instanceof Error ? caught.message : 'No se pudieron activar los avisos.', 'info');
    } finally {
      setTrabajando(false);
      setAbierta(false);
    }
  };

  return (
    <Sheet
      open={abierta}
      // Mientras el teléfono está preguntando, cerrar la hoja no hace nada.
      onClose={trabajando ? () => {} : ahoraNo}
      title="¿Te avisamos cuando haya algo nuevo?"
      description="Te llega una notificación cuando el Centro de Alumnos publica algo, aunque tengas la app cerrada."
      footer={
        <div className="flex flex-col gap-2">
          <Button
            size="lg"
            icon={BellRing}
            loading={trabajando}
            onClick={() => void activarAhora()}
            className="w-full sm:w-full"
          >
            Activar avisos
          </Button>
          <Button variant="ghost" onClick={ahoraNo} disabled={trabajando} className="w-full">
            Ahora no
          </Button>
        </div>
      }
    >
      <ul className="space-y-3.5">
        {MOTIVOS.map(({ icon: Icono, texto }) => (
          <li key={texto} className="flex items-start gap-3">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              <Icono size={16} />
            </span>
            <span className="text-[13.5px] leading-relaxed text-ink-2">{texto}</span>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
