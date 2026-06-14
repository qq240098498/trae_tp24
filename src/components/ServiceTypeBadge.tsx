import { Wrench, Tv, Key, Droplets, Wind, MoreHorizontal } from 'lucide-react';
import type { ServiceType } from '@/types';
import { SERVICE_TYPE_CONFIG } from '@/utils/constants';

const iconMap = {
  Wrench,
  Tv,
  Key,
  Droplets,
  Wind,
  MoreHorizontal,
};

interface ServiceTypeBadgeProps {
  type: ServiceType;
  showIcon?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export const ServiceTypeBadge = ({
  type,
  showIcon = true,
  showLabel = true,
  size = 'md',
}: ServiceTypeBadgeProps) => {
  const config = SERVICE_TYPE_CONFIG[type];
  const IconComponent = iconMap[config.icon as keyof typeof iconMap];
  const iconSize = size === 'sm' ? 14 : 16;
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1 ${padding} rounded-full font-medium ${textSize}`}
      style={{
        backgroundColor: `${config.color}15`,
        color: config.color,
      }}
    >
      {showIcon && IconComponent && <IconComponent size={iconSize} />}
      {showLabel && config.label}
    </span>
  );
};
