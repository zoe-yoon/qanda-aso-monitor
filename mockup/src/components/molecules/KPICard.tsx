import React from "react";
import { ChangeBadge } from "./ChangeBadge";

interface KPICardProps {
  label: string;
  value: string | number;
  change?: number | null;
  unit?: string;
  target?: number;
  tooltip?: string;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  change,
  unit,
  target,
  className = "",
}) => {
  const progress = target ? (Number(value) / target) * 100 : null;

  return (
    <div className={`bg-background-card rounded-lg p-4 shadow-1 flex flex-col gap-2 min-w-[180px] ${className}`}>
      <span className="text-[13px] font-normal leading-[18px] text-foreground-secondary">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className="text-[24px] font-bold leading-[32px] text-foreground-primary">
          {value}
        </span>
        {unit && (
          <span className="text-[14px] font-normal leading-[20px] text-foreground-tertiary">
            {unit}
          </span>
        )}
      </div>
      {change !== undefined && change !== null && (
        <ChangeBadge value={change} />
      )}
      {progress !== null && target && (
        <div className="flex flex-col gap-1">
          <div className="w-full h-2 bg-background-selectable2 rounded-full overflow-hidden">
            <div
              className="h-full bg-key-background1 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <span className="text-[11px] font-medium leading-[16px] text-foreground-tertiary">
            목표 {target}{unit}
          </span>
        </div>
      )}
    </div>
  );
};
