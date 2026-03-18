import React from "react";
import { Icon } from "./Icon";

interface IconButtonProps {
  icon: string;
  size?: "S" | "M" | "L";
  variant?: "default" | "ghost";
  "aria-label": string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const sizeMap: Record<string, { box: string; icon: number }> = {
  S: { box: "w-[24px] h-[24px]", icon: 16 },
  M: { box: "w-[32px] h-[32px]", icon: 20 },
  L: { box: "w-[40px] h-[40px]", icon: 24 },
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = "M",
  variant = "default",
  "aria-label": ariaLabel,
  onClick,
  disabled = false,
  className = "",
}) => {
  const { box, icon: iconSize } = sizeMap[size];
  const variantClass =
    variant === "ghost"
      ? "hover:bg-overlay-hover"
      : "bg-background-selectable2 hover:bg-overlay-pressed";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center rounded transition-all duration-100
        ${box} ${variantClass}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        text-foreground-secondary ${className}`}
    >
      <Icon name={icon} size={iconSize} />
    </button>
  );
};
