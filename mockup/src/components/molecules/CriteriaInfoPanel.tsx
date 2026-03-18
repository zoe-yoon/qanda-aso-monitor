import React, { useState } from "react";
import { Icon } from "@/components/atoms/Icon";

interface CriteriaInfoPanelProps {
  title: string;
  content: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const CriteriaInfoPanel: React.FC<CriteriaInfoPanelProps> = ({
  title,
  content,
  defaultOpen = false,
  className = "",
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`bg-informative-background2 border border-informative-stroke2 rounded-lg overflow-hidden ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Icon name="IconInformationCircle" size={18} color="#7e53e3" />
          <span className="text-[14px] font-semibold leading-[20px] text-informative-foreground2">
            {title}
          </span>
        </div>
        <Icon
          name={open ? "IconChevronUp" : "IconChevronDown"}
          size={18}
          color="#7e53e3"
        />
      </button>
      {open && (
        <div className="px-4 pb-3 text-[13px] font-normal leading-[18px] text-foreground-secondary">
          {content}
        </div>
      )}
    </div>
  );
};
