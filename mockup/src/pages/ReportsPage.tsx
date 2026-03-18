import { useState, useMemo } from "react";
import { PageHeader } from "@/components/organisms/PageHeader";
import { ReportViewer } from "@/components/organisms/ReportViewer";
import { Snackbar } from "@/components/organisms/Snackbar";
import { Badge } from "@/components/atoms/Badge";
import { getWeeklyReport } from "@/data/mockData";
import { useOS } from "@/contexts/OSContext";

export default function ReportsPage() {
  const { os } = useOS();
  const weeklyReport = getWeeklyReport(os);

  const reports = useMemo(() => [
    { ...weeklyReport, id: "r1", title: "주간 리포트 #10" },
    {
      id: "r2",
      title: "주간 리포트 #9",
      period: "2026-02-24 ~ 2026-03-02",
      generatedAt: "2026-03-03 07:00",
      highlights: {
        topRisers: [
          { keyword: "공부", change: 3 },
          { keyword: "시험", change: 2 },
          { keyword: "기출", change: 1 },
        ],
        topFallers: [
          { keyword: "수학", change: -2 },
          { keyword: "영단어", change: -1 },
          { keyword: "교육", change: -1 },
        ],
      },
      kpiSummary: {
        avgRank: os === "ios" ? 14.8 : 20.3,
        avgRankChange: os === "ios" ? 0.2 : 0.5,
        totalDownloads: os === "ios" ? 7200 : 14800,
        totalDownloadsChange: os === "ios" ? -1.5 : -2.1,
        avgCvr: os === "ios" ? 2.4 : 1.6,
        avgCvrChange: os === "ios" ? -0.1 : -0.3,
      },
      asoScore: os === "ios" ? 79 : 70,
      asoScoreTarget: os === "ios" ? 85 : 80,
    },
  ], [weeklyReport, os]);

  const [selectedId, setSelectedId] = useState("r1");
  const [snackbar, setSnackbar] = useState({ visible: false, message: "" });

  const selectedReport = reports.find((r) => r.id === selectedId) || reports[0];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Reports"
        subtitle={
          <div className="flex items-center gap-3">
            <Badge variant="Informative" label={os === "ios" ? "iOS" : "Android"} />
            <span className="text-[11px] text-foreground-disabled">
              출처: Sensor Tower
            </span>
          </div>
        }
      />

      <div className="px-6 pb-6 flex gap-4 flex-1 min-h-0">
        {/* Report List */}
        <div className="w-[240px] min-w-[240px] flex flex-col gap-1">
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedId(report.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors cursor-pointer
                ${report.id === selectedId
                  ? "bg-key-background2 border border-key-stroke2"
                  : "bg-background-card hover:bg-overlay-hover border border-stroke-inactive"
                }`}
            >
              <span className={`text-[14px] font-semibold leading-[20px] block
                ${report.id === selectedId ? "text-key-foreground2" : "text-foreground-primary"}`}>
                {report.title}
              </span>
              <span className="text-[12px] font-normal leading-[16px] text-foreground-tertiary">
                {report.period}
              </span>
            </button>
          ))}
        </div>

        {/* Report Detail */}
        <div className="flex-1 overflow-auto">
          <ReportViewer
            report={selectedReport}
            onShareSlack={() =>
              setSnackbar({ visible: true, message: "Slack으로 공유되었습니다." })
            }
            onDownloadPDF={() =>
              setSnackbar({ visible: true, message: "PDF 다운로드가 시작됩니다." })
            }
          />
        </div>
      </div>

      <Snackbar
        message={snackbar.message}
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ visible: false, message: "" })}
      />
    </div>
  );
}
