import React from "react";

interface DataSourceLabelProps {
  source: string;
  lastUpdated: string | null;
  status: "success" | "error" | "stale" | "manual";
  onRetry?: () => void;
  className?: string;
}

const dotColors: Record<string, string> = {
  success: "bg-success-background1",
  error: "bg-negative-background1",
  stale: "bg-notice-background1",
  manual: "bg-foreground-disabled",
};

const statusTexts: Record<string, (lastUpdated: string | null) => string> = {
  success: (t) => `마지막 업데이트 ${t || ""}`,
  error: () => "수집 실패",
  stale: (t) => `어제 데이터 (${t || "수집 지연"})`,
  manual: () => "수동 입력 (주 1회)",
};

export const DataSourceLabel: React.FC<DataSourceLabelProps> = ({
  lastUpdated,
  status,
  onRetry,
  className = "",
}) => {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`w-2 h-2 rounded-full ${dotColors[status]}`} />
      <span className="text-[12px] font-normal leading-[16px] text-foreground-tertiary">
        {statusTexts[status](lastUpdated)}
      </span>
      {status === "error" && onRetry && (
        <button
          onClick={onRetry}
          className="text-[12px] font-semibold leading-[16px] text-interactive-foreground2 hover:underline cursor-pointer"
        >
          재시도
        </button>
      )}
    </div>
  );
};
