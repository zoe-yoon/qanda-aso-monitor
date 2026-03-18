import React from "react";

interface BadgeProps {
  variant?: "Key" | "Success" | "Neutral" | "Informative" | "Notice";
  label: string;
  className?: string;
}

const variantClasses: Record<string, string> = {
  Key: "bg-key-background2 text-key-foreground2 border border-key-stroke2",
  Success: "bg-success-background2 text-success-foreground2 border border-success-stroke2",
  Neutral: "bg-background-selectable2 text-foreground-secondary border border-stroke-inactive",
  Informative: "bg-informative-background2 text-informative-foreground2 border border-informative-stroke2",
  Notice: "bg-notice-background2 text-notice-foreground2 border border-notice-stroke2",
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "Neutral",
  label,
  className = "",
}) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-[2px] rounded-sm text-[12px] font-semibold leading-[16px] whitespace-nowrap
        ${variantClasses[variant]} ${className}`}
    >
      {label}
    </span>
  );
};
