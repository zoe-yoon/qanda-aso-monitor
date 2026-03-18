import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PageHeader } from "@/components/organisms/PageHeader";
import { KPICard } from "@/components/molecules/KPICard";
import { NotableChangeItem } from "@/components/molecules/NotableChangeItem";
import { ChangeBadge } from "@/components/molecules/ChangeBadge";
import { Badge } from "@/components/atoms/Badge";
import { DataSourceLabel } from "@/components/molecules/DataSourceLabel";
import { getKeywords, getWeeklyReport, getCollectionStatus, categoryRankTrend } from "@/data/mockData";
import { useOS } from "@/contexts/OSContext";

export default function OverviewPage() {
  const navigate = useNavigate();
  const { os } = useOS();

  const keywords = getKeywords(os);
  const weeklyReport = getWeeklyReport(os);
  const collectionStatus = getCollectionStatus(os);

  // KPI calculations
  const totalKeywords = keywords.length;
  const avgRank = Math.round((keywords.reduce((s, k) => s + k.currentRank, 0) / totalKeywords) * 10) / 10;
  const avgRankChange = Math.round((keywords.reduce((s, k) => s + k.change, 0) / totalKeywords) * 10) / 10;
  const totalDownloads = keywords.reduce((s, k) => s + k.downloads, 0);
  const avgCvr = Math.round((keywords.reduce((s, k) => s + k.cvr, 0) / totalKeywords) * 10) / 10;

  // Notable changes (|change| >= 3)
  const notableChanges = keywords
    .filter((k) => Math.abs(k.change) >= 3)
    .sort((a, b) => a.change - b.change);

  // 카테고리 랭킹 차트용 데이터 변환
  const categoryChartData = categoryRankTrend.map((p) => ({
    date: p.date,
    iOS: p.iosIphone,
    Android: p.android,
  }));

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Overview"
        subtitle={
          <div className="flex items-center gap-3">
            <Badge variant="Informative" label={os === "ios" ? "iOS" : "Android"} />
            {collectionStatus.map((s) => (
              <DataSourceLabel
                key={s.source}
                source={s.source}
                lastUpdated={s.lastUpdated}
                status={s.status as "success" | "stale"}
              />
            ))}
          </div>
        }
      />

      <div className="px-6 pb-6 flex flex-col gap-6">
        {/* 데이터 출처 */}
        <div className="bg-background-card rounded-lg shadow-1 p-4">
          <h3 className="text-[13px] font-semibold leading-[18px] text-foreground-secondary mb-2">
            데이터 출처
          </h3>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-[12px] leading-[16px] text-foreground-tertiary">
              <span className="w-2 h-2 rounded-full bg-success-background1" />
              <span className="font-semibold text-foreground-secondary">키워드 랭킹·트래픽·난이도·검색량</span>
              <span>— Sensor Tower ASO 키워드 관리</span>
            </div>
            <div className="flex items-center gap-2 text-[12px] leading-[16px] text-foreground-tertiary">
              <span className="w-2 h-2 rounded-full bg-success-background1" />
              <span className="font-semibold text-foreground-secondary">앱 다운로드·수익·DAU</span>
              <span>— Sensor Tower 앱 개요</span>
            </div>
          </div>
        </div>
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <KPICard label="모니터링 키워드" value={totalKeywords} unit="개" />
          <KPICard label="평균 랭킹" value={avgRank} unit="위" change={avgRankChange} />
          <KPICard
            label="총 다운로드"
            value={totalDownloads.toLocaleString()}
            change={weeklyReport.kpiSummary.totalDownloadsChange}
          />
          <KPICard label="평균 CVR" value={avgCvr} unit="%" change={weeklyReport.kpiSummary.avgCvrChange} />
        </div>

        {/* ASO Score */}
        <div className="bg-background-card rounded-lg shadow-1 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[16px] font-semibold leading-[24px] text-foreground-primary">
              ASO 점수
            </span>
            <span className="text-[24px] font-bold leading-[32px] text-key-foreground2">
              {weeklyReport.asoScore}%
            </span>
          </div>
          <div className="w-full h-3 bg-background-selectable2 rounded-full overflow-hidden">
            <div
              className="h-full bg-key-background1 rounded-full transition-all duration-300"
              style={{
                width: `${(weeklyReport.asoScore / weeklyReport.asoScoreTarget) * 100}%`,
              }}
            />
          </div>
          <span className="text-[11px] font-medium leading-[16px] text-foreground-tertiary mt-1 inline-block">
            목표 {weeklyReport.asoScoreTarget}%
          </span>
        </div>

        {/* Category Ranking Trend: iOS vs Android */}
        <div className="bg-background-card rounded-lg shadow-1 p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[16px] font-bold leading-[24px] text-foreground-primary">
              교육 카테고리 무료 앱 순위
            </h2>
            <span className="text-[12px] font-normal leading-[16px] text-foreground-tertiary">
              출처: Sensor Tower
            </span>
          </div>
          <span className="text-[13px] font-normal leading-[18px] text-foreground-tertiary mb-4 block">
            앱 스토어 교육 카테고리 내 콴다 순위 (낮을수록 좋음)
          </span>
          {categoryChartData.length >= 2 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#999999" }} />
                <YAxis reversed tick={{ fontSize: 11, fill: "#999999" }} domain={[1, "auto"]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="iOS"
                  stroke="#0785f2"
                  strokeWidth={2}
                  dot
                  name="iOS (App Store)"
                />
                <Line
                  type="monotone"
                  dataKey="Android"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot
                  name="Android (Google Play)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[12px] font-semibold leading-[16px] text-foreground-tertiary">iOS (App Store)</span>
                  <span className="text-[28px] font-bold leading-[36px] text-interactive-foreground2">
                    {categoryChartData[0]?.iOS ?? "—"}위
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[12px] font-semibold leading-[16px] text-foreground-tertiary">Android (Google Play)</span>
                  <span className="text-[28px] font-bold leading-[36px] text-success-foreground2">
                    {categoryChartData[0]?.Android ?? "—"}위
                  </span>
                </div>
              </div>
              <span className="text-[13px] font-normal leading-[18px] text-foreground-tertiary">
                데이터가 2일 이상 쌓이면 추이 차트가 표시됩니다 (현재 {categoryChartData.length}일)
              </span>
            </div>
          )}
        </div>

        {/* Notable Changes */}
        <div className="bg-background-card rounded-lg shadow-1">
          <div className="px-4 pt-4 pb-2">
            <h2 className="text-[16px] font-bold leading-[24px] text-foreground-primary">
              주요 변동
            </h2>
            <span className="text-[13px] font-normal leading-[18px] text-foreground-tertiary">
              전일 대비 3위 이상 변동
            </span>
          </div>
          {notableChanges.length === 0 ? (
            <div className="px-4 py-8 text-center text-[14px] font-normal leading-[20px] text-foreground-tertiary">
              오늘은 큰 변동이 없습니다.
            </div>
          ) : (
            <div className="pb-2">
              {notableChanges.map((kw) => (
                <NotableChangeItem
                  key={kw.id}
                  keyword={kw.name}
                  change={kw.change}
                  currentRank={kw.currentRank}
                  onClick={() => navigate(`/keywords/${kw.id}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Weekly Highlights */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-success-background2 rounded-lg p-4">
            <h3 className="text-[14px] font-semibold leading-[20px] text-success-foreground2 mb-3">
              주간 상승 Top 3
            </h3>
            <div className="flex flex-col gap-2">
              {weeklyReport.highlights.topRisers.map((item) => (
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
            <h3 className="text-[14px] font-semibold leading-[20px] text-negative-foreground2 mb-3">
              주간 하락 Top 3
            </h3>
            <div className="flex flex-col gap-2">
              {weeklyReport.highlights.topFallers.map((item) => (
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
    </div>
  );
}
