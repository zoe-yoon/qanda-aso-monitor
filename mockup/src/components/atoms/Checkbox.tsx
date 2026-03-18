import React from "react";

interface CheckboxProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  label,
  onChange,
  className = "",
}) => {
  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer text-[14px] font-normal leading-[20px] text-foreground-primary ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-[18px] h-[18px] accent-key-background1 rounded-sm cursor-pointer"
      />
      {label}
    </label>
  );
};
