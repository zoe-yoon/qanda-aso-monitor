import React from "react";
import { Icon } from "@/components/atoms/Icon";

interface FilterChipProps {
  label: string;
  active?: boolean;
  onToggle: () => void;
  onRemove?: () => void;
  className?: string;
}

export const FilterChip: React.FC<FilterChipProps> = ({
  label,
  active = false,
  onToggle,
  onRemove,
  className = "",
}) => {
  return (
    <button
      onClick={onToggle}
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[13px] font-semibold leading-[18px] transition-colors cursor-pointer
        ${active
          ? "bg-key-background2 text-key-foreground2 border border-key-stroke2"
          : "bg-background-card text-foreground-secondary border border-stroke-active hover:bg-overlay-hover"
        } ${className}`}
    >
      {label}
      {active && onRemove && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:text-foreground-primary"
        >
          <Icon name="IconX" size={12} />
        </span>
      )}
    </button>
  );
};
