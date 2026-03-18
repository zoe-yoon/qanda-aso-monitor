import React from "react";
import { Icon } from "@/components/atoms/Icon";

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "키워드 검색",
  value,
  onChange,
  onClear,
  className = "",
}) => {
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <span className="absolute left-3 text-foreground-tertiary">
        <Icon name="IconSearch" size={18} />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-[40px] w-full pl-10 pr-9 rounded border border-stroke-active bg-background-card text-[14px] font-normal leading-[20px] text-foreground-primary placeholder:text-foreground-tertiary focus:outline-none focus:border-interactive-stroke1 transition-colors"
      />
      {value && onClear && (
        <button
          onClick={onClear}
          className="absolute right-3 text-foreground-tertiary hover:text-foreground-secondary cursor-pointer"
        >
          <Icon name="IconX" size={16} />
        </button>
      )}
    </div>
  );
};
