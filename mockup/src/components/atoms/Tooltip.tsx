import React, { useState, useRef } from "react";

interface TooltipProps {
  content: React.ReactNode;
  trigger: React.ReactNode;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, trigger, className = "" }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      className={`relative inline-flex ${className}`}
      ref={ref}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {trigger}
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 px-3 py-2 rounded-lg bg-background-selectable1 text-foreground-on-neutral text-[12px] font-normal leading-[16px] shadow-2 whitespace-nowrap pointer-events-none">
          {content}
        </div>
      )}
    </div>
  );
};
