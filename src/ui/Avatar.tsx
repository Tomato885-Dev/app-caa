import { getImage } from '@/content/images';
import { cn } from './cn';

const sizes = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-10 w-10 text-[13px]',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-2xl',
} as const;

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/** Color estable derivado del nombre: cada persona conserva el suyo. */
const palettes = [
  'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
  'bg-info-100 text-info-700 dark:bg-surface-3 dark:text-ink-2',
  'bg-success-100 text-success-700 dark:bg-success-950 dark:text-success-300',
  'bg-warning-100 text-warning-700 dark:bg-warning-950 dark:text-warning-300',
  'bg-accent-100 text-accent-700 dark:bg-accent-950 dark:text-accent-300',
];

function paletteFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return palettes[hash % palettes.length];
}

/**
 * Avatar del estudiante. La fotografía es opcional (§6.8): sin foto se
 * muestran las iniciales, nunca un marcador intrusivo.
 */
export function Avatar({
  name,
  avatarKey,
  size = 'md',
  className,
}: {
  name: string;
  avatarKey?: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const asset = getImage(avatarKey);

  if (asset?.src) {
    return (
      <img
        src={asset.src}
        alt={name}
        className={cn('shrink-0 rounded-full object-cover', sizes[size], className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-bold',
        sizes[size],
        paletteFor(name),
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
