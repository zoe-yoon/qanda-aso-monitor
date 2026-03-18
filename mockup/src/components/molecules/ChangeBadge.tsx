import React from "react";
import { Icon } from "@/components/atoms/Icon";

interface ChangeBadgeProps {
  value: number | null;
  referenceDate?: string;
  className?: string;
}

export const ChangeBadge: React.FC<ChangeBadgeProps> = ({
  value,
  className = "",
}) => {
  if (value === null || value === undefined) {
    return (
      <span className={`inline-flex items-center gap-1 text-[13px] font-semibold leading-[18px] text-foreground-disabled ${className}`}>
        —
      </span>
    );
  }

  if (value === 0) {
    return (
      <span className={`inline-flex items-center gap-1 text-[13px] font-semibold leading-[18px] text-foreground-tertiary ${className}`}>
        <Icon name="IconArrowRight" size={14} />
        0
      </span>
    );
  }

  if (value > 0) {
    return (
      <span className={`inline-flex items-center gap-1 text-[13px] font-semibold leading-[18px] text-success-foreground2 ${className}`}>
        <Icon name="IconArrowUp" size={14} />
        {value}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 text-[13px] font-semibold leading-[18px] text-negative-foreground2 ${className}`}>
      <Icon name="IconArrowDown" size={14} />
      {Math.abs(value)}
    </span>
  );
};
