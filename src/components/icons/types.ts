export interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

export interface BTCIconProps {
  className?: string;
  size?: number;
}

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;

export const iconSizes: Record<Exclude<IconSize, number>, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
};