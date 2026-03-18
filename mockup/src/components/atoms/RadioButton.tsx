import React from "react";

interface RadioButtonProps {
  value: string;
  label: string;
  checked: boolean;
  name: string;
  onChange: (value: string) => void;
  className?: string;
}

export const RadioButton: React.FC<RadioButtonProps> = ({
  value,
  label,
  checked,
  name,
  onChange,
  className = "",
}) => {
  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer text-[14px] font-normal leading-[20px] text-foreground-primary ${className}`}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="w-[18px] h-[18px] accent-key-background1 cursor-pointer"
      />
      {label}
    </label>
  );
};
