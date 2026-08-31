import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from './cn';

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
        'rounded-card border border-line bg-surface shadow-card overflow-hidden',
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
        'block rounded-card border border-line bg-surface shadow-card overflow-hidden',
        'transition hover:border-line-strong hover:shadow-raised active:scale-[0.995]',
        !flush && 'p-4',
        className,
      )}
    >
      {children}
    </Link>
  );
}
