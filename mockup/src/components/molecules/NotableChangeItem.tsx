import React from "react";
import { ChangeBadge } from "./ChangeBadge";

interface NotableChangeItemProps {
  keyword: string;
  change: number;
  currentRank: number;
  onClick: () => void;
  className?: string;
}

export const NotableChangeItem: React.FC<NotableChangeItemProps> = ({
  keyword,
  change,
  currentRank,
  onClick,
  className = "",
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded hover:bg-overlay-hover transition-colors cursor-pointer ${className}`}
    >
      <span className="text-[14px] font-semibold leading-[20px] text-foreground-primary">
        {keyword}
      </span>
      <div className="flex items-center gap-4">
        <ChangeBadge value={change} />
        <span className="text-[14px] font-normal leading-[20px] text-foreground-secondary min-w-[40px] text-right">
          {currentRank}위
        </span>
      </div>
    </button>
  );
};
