type BrandLogoProps = {
  variant?: 'color' | 'white' | 'mark';
  className?: string;
};

const variants = {
  color: { src: '/brand/clinova-logo.png', width: 1247, height: 335 },
  white: { src: '/brand/clinova-logo-white.png', width: 362, height: 105 },
  mark: { src: '/brand/clinova-mark.png', width: 260, height: 264 },
};

/** Owner-supplied artwork; intrinsic dimensions prevent layout shifts. */
export default function BrandLogo({ variant = 'color', className = '' }: BrandLogoProps) {
  return <img {...variants[variant]} alt="Clinova International Academy" className={`block h-auto object-contain ${className}`} decoding="async" />;
}
