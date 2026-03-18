import React from "react";
import { Icon } from "./Icon";

interface StandardButtonProps {
  variant?: "Primary" | "Secondary" | "Outlined" | "Negative";
  size?: "XS" | "S" | "M" | "L";
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const sizeClasses: Record<string, string> = {
  XS: "h-[28px] px-2 text-[12px] font-semibold leading-[16px] gap-1 rounded-sm",
  S: "h-[32px] px-3 text-[13px] font-semibold leading-[18px] gap-1 rounded",
  M: "h-[40px] px-4 text-[14px] font-semibold leading-[20px] gap-2 rounded",
  L: "h-[48px] px-5 text-[16px] font-semibold leading-[24px] gap-2 rounded-lg",
};

const variantClasses: Record<string, string> = {
  Primary:
    "bg-key-background1 text-key-foreground1 hover:opacity-90 active:scale-[0.98]",
  Secondary:
    "bg-background-selectable2 text-foreground-primary hover:bg-overlay-pressed active:scale-[0.98]",
  Outlined:
    "bg-background-card border border-stroke-active text-foreground-primary hover:bg-overlay-hover active:scale-[0.98]",
  Negative:
    "bg-negative-background1 text-negative-foreground1 hover:opacity-90 active:scale-[0.98]",
};

const iconSizes: Record<string, number> = { XS: 14, S: 16, M: 18, L: 20 };

export const StandardButton: React.FC<StandardButtonProps> = ({
  variant = "Primary",
  size = "M",
  icon,
  disabled = false,
  loading = false,
  children,
  onClick,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center whitespace-nowrap transition-all duration-100
        ${sizeClasses[size]} ${variantClasses[variant]}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}`}
    >
      {loading ? (
        <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
      ) : (
        <>
          {icon && <Icon name={icon} size={iconSizes[size]} />}
          {children}
        </>
      )}
    </button>
  );
};
