type TileProps = {
  className?: string;
  alt?: string;
};

export function BrandTile({ className = 'w-8 h-8 rounded-xl', alt = 'Full Range Lab' }: TileProps) {
  return (
    <img
      src="/brand/logo-tile.png"
      alt={alt}
      className={`${className} object-cover shrink-0`}
      draggable={false}
    />
  );
}

export function BrandMark({ className = 'h-8 w-auto', alt = 'Full Range Lab' }: TileProps) {
  return (
    <img
      src="/brand/logo-mark.png"
      alt={alt}
      className={`${className} object-contain shrink-0`}
      draggable={false}
    />
  );
}

export function BrandWordmark({ className = 'h-6 w-auto', alt = 'Full Range Lab' }: TileProps) {
  return (
    <img
      src="/brand/logo-wordmark.png"
      alt={alt}
      className={`${className} object-contain shrink-0`}
      draggable={false}
    />
  );
}

type LockupProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /** Tints the wordmark white for dark hero backgrounds */
  invertWordmark?: boolean;
};

const lockupSizes = {
  sm: { mark: 'h-10', wordmark: 'h-4' },
  md: { mark: 'h-14', wordmark: 'h-5' },
  lg: { mark: 'h-20', wordmark: 'h-7' },
} as const;

export function BrandLockup({ size = 'md', className = '', invertWordmark = false }: LockupProps) {
  const s = lockupSizes[size];
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <img
        src="/brand/logo-mark.png"
        alt=""
        className={`${s.mark} w-auto object-contain shrink-0`}
        draggable={false}
      />
      <img
        src="/brand/logo-wordmark.png"
        alt="Full Range Lab"
        className={`${s.wordmark} w-auto object-contain shrink-0 ${invertWordmark ? 'invert' : ''}`}
        draggable={false}
      />
    </div>
  );
}
