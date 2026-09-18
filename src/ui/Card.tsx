import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from './cn';

/* ============================================================================
   TARJETA
   ----------------------------------------------------------------------------
   La pieza que sostiene casi toda la app. De día se despega del lienzo verde
   con su sombra; de noche una sombra no se ve, y por eso lleva `tarjeta`: un
   brillo muy tenue arriba y un borde claro que le devuelven el relieve. Sin
   eso, en modo oscuro todo terminaba siendo el mismo negro plano.
   ========================================================================== */

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Sin relleno interno: útil cuando la tarjeta empieza con una imagen. */
  flush?: boolean;
}

export function Card({ children, className, flush }: CardProps) {
  return (
    <div
      className={cn(
        'tarjeta rounded-card border border-line bg-surface shadow-card overflow-hidden',
        !flush && 'p-4',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Tarjeta que actúa como enlace, con realce al pasar el cursor o tocar. */
export function CardLink({ to, children, className, flush }: CardProps & { to: string }) {
  return (
    <Link
      to={to}
      className={cn(
        'tarjeta block rounded-card border border-line bg-surface shadow-card overflow-hidden',
        'transition duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-raised active:translate-y-0 active:scale-[0.98]',
        !flush && 'p-4',
        className,
      )}
    >
      {children}
    </Link>
  );
}
