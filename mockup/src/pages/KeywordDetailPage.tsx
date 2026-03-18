import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/organisms/PageHeader";
import { TrendChart } from "@/components/organisms/TrendChart";
import { KPICard } from "@/components/molecules/KPICard";
import { Badge } from "@/components/atoms/Badge";
import { DataSourceLabel } from "@/components/molecules/DataSourceLabel";
import { getKeywords, getCollectionStatus } from "@/data/mockData";
import { useOS } from "@/contexts/OSContext";

// Generate 30-day mock data for a keyword
function generateTrendData(_baseRank: number, sparkline: number[]) {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
    const sparkIdx = Math.min(Math.floor((29 - i) / 4), sparkline.length - 1);
    const rank = sparkline[sparkIdx] + Math.floor(Math.random() * 3 - 1);
    const downloads = Math.max(50, Math.floor(150 + Math.random() * 200 - i * 2));
    const cvr = Math.max(0.5, Math.round((2 + Math.random() * 3) * 10) / 10);
    data.push({ date: dateStr, rank: Math.max(1, rank), downloads, cvr });
  }
  return data;
}

export default function KeywordDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { os } = useOS();
  const keywords = getKeywords(os);
  const collectionStatus = getCollectionStatus(os);
  const keyword = keywords.find((k) => k.id === id);
  const sensorTower = collectionStatus.find((s) => s.source === "sensor-tower");

  const trendData = useMemo(() => {
    if (!keyword) return [];
    return generateTrendData(keyword.currentRank, keyword.sparkline);
  }, [keyword]);

  if (!keyword) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <span className="text-[16px] font-semibold leading-[24px] text-foreground-secondary">
          키워드를 찾을 수 없습니다.
        </span>
        <button
          onClick={() => navigate("/keywords")}
          className="text-[14px] font-semibold leading-[20px] text-interactive-foreground2 hover:underline cursor-pointer"
        >
          키워드 목록으로 돌아가기
        </button>
      </div>
    );
  }

  const classificationMap = {
    primary: { variant: "Key" as const, label: "주력(방어)" },
    secondary: { variant: "Success" as const, label: "보조(확장)" },
    unclassified: { variant: "Neutral" as const, label: "미분류" },
  };
  const cls = classificationMap[keyword.classification];

  // 7-day & 30-day averages
  const last7 = trendData.slice(-7);
  const avg7 = Math.round(last7.reduce((s, d) => s + d.rank, 0) / last7.length * 10) / 10;
  const avg30 = Math.round(trendData.reduce((s, d) => s + d.rank, 0) / trendData.length * 10) / 10;

  return (
    <div className="flex flex-col">
      <PageHeader
        title={keyword.name}
        breadcrumbs={[
          { label: "Keywords", href: "/keywords" },
          { label: keyword.name },
        ]}
        subtitle={
          <div className="flex items-center gap-2">
            <Badge variant="Informative" label={os === "ios" ? "iOS" : "Android"} />
            <Badge variant={cls.variant} label={cls.label} />
            <span className="text-[13px] font-normal leading-[18px] text-foreground-tertiary">
              트래픽 {keyword.trafficScore}
            </span>
            <span className="text-[11px] text-foreground-disabled ml-2">
              출처: Sensor Tower
            </span>
          </div>
        }
      />

      <div className="px-6 pb-6 flex flex-col gap-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          <KPICard label="현재 랭킹" value={keyword.currentRank} unit="위" change={keyword.change} />
          <KPICard label="전일 대비" value={keyword.change >= 0 ? `+${keyword.change}` : `${keyword.change}`} unit="위" />
          <KPICard label="7일 평균" value={avg7} unit="위" />
          <KPICard label="30일 평균" value={avg30} unit="위" />
        </div>

        {/* Ranking Trend */}
        <div>
          <h2 className="text-[16px] font-bold leading-[24px] text-foreground-primary mb-3">
            랭킹 추이
          </h2>
          <TrendChart data={trendData} type="line" />
        </div>

        {/* Downloads Chart */}
        <div>
          <h2 className="text-[16px] font-bold leading-[24px] text-foreground-primary mb-3">
            다운로드 추이
          </h2>
          <TrendChart data={trendData} type="bar" />
        </div>

        {/* Daily History Table */}
        <div>
          <h2 className="text-[16px] font-bold leading-[24px] text-foreground-primary mb-3">
            일자별 데이터
          </h2>
          <div className="border border-border-secondary rounded-lg overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full text-[13px] leading-[18px]">
                <thead className="sticky top-0 bg-background-secondary z-10">
                  <tr className="border-b border-border-secondary">
                    <th className="text-left font-semibold text-foreground-secondary px-4 py-2.5">날짜</th>
                    <th className="text-right font-semibold text-foreground-secondary px-4 py-2.5">순위</th>
                    <th className="text-right font-semibold text-foreground-secondary px-4 py-2.5">변화</th>
                    <th className="text-right font-semibold text-foreground-secondary px-4 py-2.5">다운로드</th>
                  </tr>
                </thead>
                <tbody>
                  {[...trendData].reverse().map((d, i) => {
                    const changeVal = i < trendData.length - 1
                      ? [...trendData].reverse()[i + 1].rank - d.rank
                      : 0;
                    return (
                      <tr key={d.date} className="border-b border-border-secondary last:border-0 hover:bg-background-secondary/50">
                        <td className="px-4 py-2 text-foreground-primary">{d.date}</td>
                        <td className="px-4 py-2 text-right font-medium text-foreground-primary">{d.rank}위</td>
                        <td className={`px-4 py-2 text-right font-medium ${
                          changeVal > 0 ? "text-status-success" : changeVal < 0 ? "text-status-error" : "text-foreground-tertiary"
                        }`}>
                          {changeVal > 0 ? `+${changeVal}` : changeVal === 0 ? "-" : changeVal}
                        </td>
                        <td className="px-4 py-2 text-right text-foreground-secondary">{d.downloads.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Data Source Footer */}
        {sensorTower && (
          <DataSourceLabel
            source="sensor-tower"
            lastUpdated={sensorTower.lastUpdated}
            status={sensorTower.status as "success"}
          />
        )}
      </div>
    </div>
  );
}
