import React from "react";
import { KPICard } from "@/components/molecules/KPICard";
import { ChangeBadge } from "@/components/molecules/ChangeBadge";
import { StandardButton } from "@/components/atoms/StandardButton";

interface ReportData {
  period: string;
  generatedAt: string;
  highlights: {
    topRisers: Array<{ keyword: string; change: number }>;
    topFallers: Array<{ keyword: string; change: number }>;
  };
  kpiSummary: {
    avgRank: number;
    avgRankChange: number;
    totalDownloads: number;
    totalDownloadsChange: number;
    avgCvr: number;
    avgCvrChange: number;
  };
  asoScore: number;
  asoScoreTarget: number;
}

interface ReportViewerProps {
  report: ReportData;
  onShareSlack?: () => void;
  onDownloadPDF?: () => void;
  className?: string;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
  report,
  onShareSlack,
  onDownloadPDF,
  className = "",
}) => {
  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* Share bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[20px] font-bold leading-[28px] text-foreground-primary">
            주간 리포트
          </h3>
          <span className="text-[13px] font-normal leading-[18px] text-foreground-tertiary">
            {report.period} | 생성: {report.generatedAt}
          </span>
        </div>
        <div className="flex gap-2">
          {onShareSlack && (
            <StandardButton variant="Outlined" icon="IconShare" onClick={onShareSlack}>
              Slack 공유
            </StandardButton>
          )}
          {onDownloadPDF && (
            <StandardButton variant="Outlined" icon="IconArrowTrayDown" onClick={onDownloadPDF}>
              PDF 다운로드
            </StandardButton>
          )}
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-3 gap-4">
        <KPICard
          label="평균 랭킹"
          value={report.kpiSummary.avgRank}
          unit="위"
          change={report.kpiSummary.avgRankChange}
        />
        <KPICard
          label="총 다운로드"
          value={report.kpiSummary.totalDownloads.toLocaleString()}
          change={report.kpiSummary.totalDownloadsChange}
        />
        <KPICard
          label="평균 CVR"
          value={report.kpiSummary.avgCvr}
          unit="%"
          change={report.kpiSummary.avgCvrChange}
        />
      </div>

      {/* ASO Score */}
      <div className="bg-background-card rounded-lg shadow-1 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[14px] font-semibold leading-[20px] text-foreground-primary">
            ASO 점수
          </span>
          <span className="text-[20px] font-bold leading-[28px] text-key-foreground2">
            {report.asoScore}%
          </span>
        </div>
        <div className="w-full h-3 bg-background-selectable2 rounded-full overflow-hidden">
          <div
            className="h-full bg-key-background1 rounded-full"
            style={{ width: `${(report.asoScore / report.asoScoreTarget) * 100}%` }}
          />
        </div>
        <span className="text-[11px] font-medium leading-[16px] text-foreground-tertiary mt-1">
          목표 {report.asoScoreTarget}%
        </span>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-success-background2 rounded-lg p-4">
          <h4 className="text-[14px] font-semibold leading-[20px] text-success-foreground2 mb-3">
            상승 Top 3
          </h4>
          <div className="flex flex-col gap-2">
            {report.highlights.topRisers.map((item) => (
              <div key={item.keyword} className="flex items-center justify-between">
                <span className="text-[14px] font-normal leading-[20px] text-foreground-primary">
                  {item.keyword}
                </span>
                <ChangeBadge value={item.change} />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-negative-background2 rounded-lg p-4">
          <h4 className="text-[14px] font-semibold leading-[20px] text-negative-foreground2 mb-3">
            하락 Top 3
          </h4>
          <div className="flex flex-col gap-2">
            {report.highlights.topFallers.map((item) => (
              <div key={item.keyword} className="flex items-center justify-between">
                <span className="text-[14px] font-normal leading-[20px] text-foreground-primary">
                  {item.keyword}
                </span>
                <ChangeBadge value={item.change} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
