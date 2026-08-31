import { useMemo } from 'react';
import qrcode from 'qrcode-generator';
import { cn } from './cn';

/* ============================================================================
   CÓDIGO QR
   ----------------------------------------------------------------------------
   Se dibuja como SVG: se ve nítido a cualquier tamaño y no depende de la
   resolución de la pantalla, que es justo lo que necesita un lector.

   Los colores son FIJOS —oscuro sobre blanco— y no siguen el tema de la app.
   Un QR claro sobre fondo oscuro no lo lee la mayoría de los escáneres, así
   que el modo oscuro no debe invertirlo.
   ========================================================================== */

/** Zona de silencio obligatoria alrededor del código, en módulos. */
const QUIET_ZONE = 4;

interface QrCodeResult {
  /** Trazado de los módulos oscuros, en coordenadas de módulo. */
  path: string;
  /** Ancho del código en módulos, sin la zona de silencio. */
  count: number;
}

function buildQr(value: string): QrCodeResult | null {
  try {
    // Tipo 0 = el menor tamaño que quepa. Nivel M = 15 % de recuperación,
    // el equilibrio habitual entre densidad y tolerancia a roces.
    const qr = qrcode(0, 'M');
    qr.addData(value);
    qr.make();

    const count = qr.getModuleCount();
    let path = '';
    for (let row = 0; row < count; row += 1) {
      for (let col = 0; col < count; col += 1) {
        if (qr.isDark(row, col)) path += `M${col} ${row}h1v1h-1z`;
      }
    }
    return { path, count };
  } catch {
    // Contenido demasiado largo para un QR: se avisa en vez de romper la vista.
    return null;
  }
}

export function QrCode({
  value,
  className,
  /** Descripción para lectores de pantalla. */
  label = 'Código QR',
}: {
  value: string;
  className?: string;
  label?: string;
}) {
  const qr = useMemo(() => buildQr(value), [value]);

  if (!qr) {
    return (
      <div
        className={cn(
          'flex aspect-square w-full items-center justify-center rounded-2xl border-2 border-dashed border-line-strong bg-surface-2 p-6 text-center',
          className,
        )}
      >
        <p className="text-[13px] font-medium text-ink-2">
          El contenido del código es demasiado largo para generar un QR. Usa un enlace más corto.
        </p>
      </div>
    );
  }

  const span = qr.count + QUIET_ZONE * 2;

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`${-QUIET_ZONE} ${-QUIET_ZONE} ${span} ${span}`}
      shapeRendering="crispEdges"
      className={cn('block aspect-square w-full rounded-2xl bg-white', className)}
    >
      {/* La zona de silencio también debe ser blanca, no transparente. */}
      <rect x={-QUIET_ZONE} y={-QUIET_ZONE} width={span} height={span} fill="#ffffff" />
      <path d={qr.path} fill="#101a15" />
    </svg>
  );
}
