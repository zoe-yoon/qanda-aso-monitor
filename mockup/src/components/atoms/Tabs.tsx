import React from "react";

interface TabItem {
  label: string;
  count?: number;
  value: string;
}

interface TabsProps {
  items: TabItem[];
  activeValue: string;
  onChange: (value: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeValue,
  onChange,
  className = "",
}) => {
  return (
    <div className={`flex border-b border-stroke-inactive ${className}`}>
      {items.map((item) => {
        const isActive = item.value === activeValue;
        return (
          <button
            key={item.value}
            onClick={() => onChange(item.value)}
            className={`relative px-4 py-3 text-[14px] font-semibold leading-[20px] whitespace-nowrap transition-colors duration-200 cursor-pointer
              ${isActive ? "text-key-foreground2" : "text-foreground-tertiary hover:text-foreground-secondary"}`}
          >
            {item.label}
            {item.count !== undefined && (
              <span className={`ml-1 text-[12px] font-normal leading-[16px]
                ${isActive ? "text-key-foreground2" : "text-foreground-disabled"}`}>
                {item.count}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-key-background1 transition-all duration-200" />
            )}
          </button>
        );
      })}
    </div>
  );
};
