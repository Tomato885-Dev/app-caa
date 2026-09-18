import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Check, Copy, ExternalLink, QrCode as QrIcon, Sun, X } from 'lucide-react';
import type { Benefit, BenefitRedeem } from '@/core/types';
import { QrCode, cn, useToast } from '@/ui';
import { esEnlaceSeguro, pasosDe } from '../canje';

/* ============================================================================
   CÓMO SE CANJEA, INTEGRADO EN LA FICHA
   ----------------------------------------------------------------------------
   Antes esto era una sección aparte, con su título y su recuadro, y ocupaba
   media pantalla para decir una línea. Ahora es la acción de la ficha: una
   sola pieza bajo la portada, con lo justo para usarlo parado en la caja.

     · Código        se lee y se copia de un toque.
     · QR            un botón; el QR sale a pantalla completa, que es como se
                     muestra de verdad. Antes iba incrustado y chico.
     · En línea      el botón a la tienda, y el cupón si lo hay.
     · Indicaciones  los pasos, sin nada más.

   Los pasos extra ("pídelo antes de pagar") se muestran en todas las formas.
   ========================================================================== */

export function ComoCanjear({ benefit, redeem }: { benefit: Benefit; redeem: BenefitRedeem }) {
  const pasos = pasosDe(redeem.steps);
  const enlaceUtil = redeem.method === 'enlace' && redeem.url && esEnlaceSeguro(redeem.url);
  const hayQr = redeem.method === 'qr' && (redeem.qrImage || redeem.qrValue);

  /* Sin nada que mostrar no se dibuja el bloque: un recuadro vacío que dice
     "cómo canjearlo" y no lo explica es peor que no ponerlo. */
  if (!redeem.code && !enlaceUtil && !hayQr && pasos.length === 0) return null;

  return (
    <section className="mb-5 rounded-card border border-line bg-surface p-4 shadow-card">
      {redeem.method === 'codigo' && redeem.code ? (
        <Codigo codigo={redeem.code} etiqueta="Código" ayuda="Dícelo o muéstralo en caja." />
      ) : null}

      {hayQr ? <BotonDelQr benefit={benefit} redeem={redeem} /> : null}

      {enlaceUtil ? (
        <div className="space-y-3">
          <a
            href={redeem.url!.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-field bg-brand-500 px-4 text-[14.5px] font-semibold text-white transition hover:bg-brand-600 active:scale-[0.98]"
          >
            Ir a la tienda
            <ExternalLink size={16} />
          </a>
          {redeem.code ? (
            <Codigo codigo={redeem.code} etiqueta="Cupón" ayuda="Pégalo al pagar." />
          ) : null}
        </div>
      ) : null}

      {pasos.length ? (
        <ol
          className={cn(
            'space-y-2.5',
            redeem.method !== 'indicaciones' && 'mt-4 border-t border-line pt-4',
          )}
        >
          {pasos.map((paso, indice) => (
            <li key={indice} className="flex gap-2.5">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-500/12 text-[11px] font-bold text-brand-600 dark:text-brand-300">
                {indice + 1}
              </span>
              <span className="text-[13.5px] leading-relaxed text-ink-2">{paso}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}

/** El código en una sola línea, con el botón de copiar al lado. */
function Codigo({ codigo, etiqueta, ayuda }: { codigo: string; etiqueta: string; ayuda: string }) {
  const notify = useToast();
  const [copiado, setCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      notify('Código copiado.', 'info');
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      notify('No se pudo copiar. Mantén presionado el código para seleccionarlo.', 'info');
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 rounded-field border border-dashed border-line-strong bg-surface-2 px-3.5 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-ink-3">
            {etiqueta}
          </p>
          <p className="select-all break-all font-mono text-[19px] font-bold leading-tight tracking-wide text-ink">
            {codigo}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void copiar()}
          aria-label="Copiar el código"
          className="flex size-10 shrink-0 items-center justify-center rounded-field bg-brand-500 text-white transition hover:bg-brand-600 active:scale-95"
        >
          {copiado ? <Check size={17} /> : <Copy size={17} />}
        </button>
      </div>
      <p className="mt-2 text-[12.5px] text-ink-3">{ayuda}</p>
    </div>
  );
}

/**
 * El QR no va incrustado: va a pantalla completa, sobre blanco y con el
 * brillo arriba, que es como se deja escanear de verdad.
 */
function BotonDelQr({ benefit, redeem }: { benefit: Benefit; redeem: BenefitRedeem }) {
  const [grande, setGrande] = useState(false);
  const etiqueta = `Código QR de ${benefit.partner}`;

  const dibujo = redeem.qrImage ? (
    <img src={redeem.qrImage} alt={etiqueta} className="block aspect-square w-full object-contain" />
  ) : redeem.qrValue ? (
    <QrCode value={redeem.qrValue} label={etiqueta} />
  ) : null;

  if (!dibujo) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setGrande(true)}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-field bg-brand-500 px-4 text-[14.5px] font-semibold text-white transition hover:bg-brand-600 active:scale-[0.98]"
      >
        <QrIcon size={17} />
        Mostrar el código QR
      </button>
      <p className="mt-2 text-[12.5px] text-ink-3">Se lo muestras en caja para que lo escaneen.</p>

      {grande ? <QrEnGrande onClose={() => setGrande(false)}>{dibujo}</QrEnGrande> : null}
    </div>
  );
}

function QrEnGrande({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  useEffect(() => {
    const alPresionar = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', alPresionar);
    return () => window.removeEventListener('keydown', alPresionar);
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="QR en pantalla completa"
      onClick={onClose}
      className="animate-fade fixed inset-0 z-[80] flex flex-col items-center justify-center bg-white px-6 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute right-4 top-[calc(env(safe-area-inset-top)+12px)] flex size-11 items-center justify-center rounded-full bg-black/5 text-[#101a15]"
      >
        <X size={22} />
      </button>
      <div className="w-full max-w-[380px]">{children}</div>
      <p className="mt-6 flex items-center gap-2 text-[13px] text-[#4b5a52]">
        <Sun size={15} /> Sube el brillo si el lector no lo toma.
      </p>
    </div>,
    document.body,
  );
}
