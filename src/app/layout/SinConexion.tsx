import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw, WifiOff } from 'lucide-react';

/* ============================================================================
   AVISO DE QUE NO HAY CONEXIÓN
   ----------------------------------------------------------------------------
   Sin señal, la app se quedaba con las listas vacías o cargando para siempre y
   sin decir por qué. La persona concluye "la app no sirve", que es lo peor que
   puede pasar con setecientos usuarios: nadie reporta "no tenía internet",
   reportan "no me carga".

   Así que se dice. Una cinta arriba, con un botón para volver a intentarlo.

   DOS FORMAS DE ENTERARSE
   El teléfono avisa cuando se corta y cuando vuelve (`online` / `offline`), y
   eso es lo fiable. Pero `navigator.onLine` miente con frecuencia: en el
   colegio, con wifi conectada pero sin salida a internet, el teléfono jura que
   está en línea. Por eso también se mira el reloj de la última vez que una
   consulta terminó bien: si todas están fallando, algo pasa aunque el sistema
   diga que sí hay red.

   AL VOLVER LA SEÑAL SE REFRESCA SOLO
   No hay que apretar nada: en cuanto el teléfono dice que volvió, se piden los
   datos de nuevo y la cinta desaparece.
   ========================================================================== */

export function SinConexion() {
  const queryClient = useQueryClient();
  const [enLinea, setEnLinea] = useState(() => navigator.onLine !== false);
  const [fallando, setFallando] = useState(false);
  const [reintentando, setReintentando] = useState(false);

  useEffect(() => {
    const seFue = () => setEnLinea(false);
    const volvio = () => {
      setEnLinea(true);
      setFallando(false);
      // Al volver la señal, lo que quedó a medias se vuelve a pedir solo.
      void queryClient.refetchQueries();
    };

    window.addEventListener('offline', seFue);
    window.addEventListener('online', volvio);
    return () => {
      window.removeEventListener('offline', seFue);
      window.removeEventListener('online', volvio);
    };
  }, [queryClient]);

  /* El caso del wifi que no lleva a ninguna parte: el sistema dice que hay
     conexión pero todas las consultas terminan en error. Se mira el estado de
     la caché en vez de creerle al teléfono. */
  useEffect(() => {
    const revisar = () => {
      const consultas = queryClient.getQueryCache().getAll();
      const conResultado = consultas.filter((c) => c.state.status !== 'pending');
      if (conResultado.length === 0) {
        setFallando(false);
        return;
      }
      setFallando(conResultado.every((c) => c.state.status === 'error'));
    };

    revisar();
    return queryClient.getQueryCache().subscribe(revisar);
  }, [queryClient]);

  const reintentar = async () => {
    setReintentando(true);
    try {
      await queryClient.refetchQueries();
      if (navigator.onLine !== false) setEnLinea(true);
    } finally {
      setReintentando(false);
    }
  };

  if (enLinea && !fallando) return null;

  return (
    <div
      role="status"
      className="sticky top-0 z-40 flex items-center gap-2.5 bg-ink px-4 py-2.5 text-white shadow-raised"
    >
      <WifiOff size={16} className="shrink-0 text-accent-500" />
      <p className="min-w-0 flex-1 text-[12.5px] font-semibold leading-snug">
        Sin conexión.
        <span className="ml-1 font-normal opacity-80">
          Lo que ves puede estar desactualizado.
        </span>
      </p>
      <button
        type="button"
        onClick={() => void reintentar()}
        disabled={reintentando}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-field bg-white/15 px-2.5 py-1.5 text-[12px] font-bold transition hover:bg-white/25 active:scale-95 disabled:opacity-60"
      >
        <RefreshCw size={13} className={reintentando ? 'animate-spin' : undefined} />
        {reintentando ? 'Probando' : 'Reintentar'}
      </button>
    </div>
  );
}
