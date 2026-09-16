import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Check, Copy, ExternalLink, Maximize2, QrCode as QrIcon, Sun, X } from 'lucide-react';
import type { Benefit, BenefitRedeem } from '@/core/types';
import { Card, QrCode, SectionHeader, useToast } from '@/ui';
import { esEnlaceSeguro, pasosDe } from '../canje';

/* ============================================================================
   CÓMO CANJEARLO
   ----------------------------------------------------------------------------
   Es lo que el alumno viene a buscar cuando abre la ficha parado en la caja,
   así que va arriba y cambia según la forma que definió el local:

     · Código        grande, con botón para copiarlo.
     · QR            sobre blanco fijo, y a pantalla completa con un toque.
     · En línea      botón a la tienda, y el cupón si lo hay.
     · Indicaciones  los pasos, numerados.

   Los pasos extra ("pídelo antes de pagar") se muestran en todas las formas.
   ========================================================================== */

export function ComoCanjear({ benefit, redeem }: { benefit: Benefit; redeem: BenefitRedeem }) {
  const pasos = pasosDe(redeem.steps);

  return (
    <section className="mb-6">
      <SectionHeader title="Cómo canjearlo" />
      <Card>
        {redeem.method === 'codigo' && redeem.code ? (
          <CodigoParaCopiar codigo={redeem.code} ayuda="Dícelo o muéstralo en caja." />
        ) : null}

        {redeem.method === 'qr' ? <QrDelConvenio benefit={benefit} redeem={redeem} /> : null}

        {redeem.method === 'enlace' && redeem.url && esEnlaceSeguro(redeem.url) ? (
          <div className="space-y-4">
            <a
              href={redeem.url.trim()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-field bg-brand-500 px-4 text-[14.5px] font-semibold text-white transition hover:bg-brand-600 active:scale-[0.98]"
            >
              Ir a la tienda
              <ExternalLink size={16} />
            </a>
            {redeem.code ? (
              <CodigoParaCopiar codigo={redeem.code} ayuda="Pégalo como cupón al pagar." titulo="Cupón" />
            ) : null}
          </div>
        ) : null}

        {pasos.length ? (
          <ol
            className={
              redeem.method === 'indicaciones' ? 'space-y-3' : 'mt-4 space-y-3 border-t border-line pt-4'
            }
          >
            {pasos.map((paso, indice) => (
              <li key={indice} className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-500 text-[12px] font-bold text-[#101a15]">
                  {indice + 1}
                </span>
                <span className="pt-0.5 text-[14px] leading-relaxed text-ink-2">{paso}</span>
              </li>
            ))}
          </ol>
        ) : null}
      </Card>
    </section>
  );
}

function CodigoParaCopiar({
  codigo,
  ayuda,
  titulo,
}: {
  codigo: string;
  ayuda: string;
  titulo?: string;
}) {
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
    <div className="text-center">
      {titulo ? (
        <p className="mb-1 text-[11.5px] font-bold uppercase tracking-wide text-ink-3">{titulo}</p>
      ) : null}
      <p className="select-all break-all font-mono text-[24px] font-bold tracking-wide text-ink">
        {codigo}
      </p>
      <p className="mt-1.5 text-[12.5px] text-ink-2">{ayuda}</p>
      <button
        type="button"
        onClick={() => void copiar()}
        className="mt-3 inline-flex h-9 items-center gap-2 rounded-field border border-line px-3.5 text-[13px] font-semibold text-ink-2 transition hover:bg-surface-2 active:scale-[0.98]"
      >
        {copiado ? <Check size={15} /> : <Copy size={15} />}
        {copiado ? 'Copiado' : 'Copiar código'}
      </button>
    </div>
  );
}

function QrDelConvenio({ benefit, redeem }: { benefit: Benefit; redeem: BenefitRedeem }) {
  const [grande, setGrande] = useState(false);
  const etiqueta = `Código QR de ${benefit.partner}`;

  const dibujo = redeem.qrImage ? (
    <img src={redeem.qrImage} alt={etiqueta} className="block aspect-square w-full object-contain" />
  ) : redeem.qrValue ? (
    <QrCode value={redeem.qrValue} label={etiqueta} />
  ) : null;

  if (!dibujo) {
    return (
      <p className="flex items-center justify-center gap-2 text-[13px] text-ink-3">
        <QrIcon size={16} /> El QR todavía no está cargado.
      </p>
    );
  }

  return (
    <div className="text-center">
      {/* Blanco fijo también en modo oscuro: los lectores necesitan un QR
          oscuro sobre claro. */}
      <button
        type="button"
        onClick={() => setGrande(true)}
        aria-label="Ver el QR en pantalla completa"
        className="mx-auto block w-full max-w-[240px] rounded-2xl bg-white p-3 shadow-card"
      >
        {dibujo}
      </button>
      <p className="mt-3 text-[12.5px] text-ink-2">Muéstralo en caja para que lo escaneen.</p>
      <button
        type="button"
        onClick={() => setGrande(true)}
        className="mt-3 inline-flex h-9 items-center gap-2 rounded-field border border-line px-3.5 text-[13px] font-semibold text-ink-2 transition hover:bg-surface-2 active:scale-[0.98]"
      >
        <Maximize2 size={15} />
        Ver en grande
      </button>

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
