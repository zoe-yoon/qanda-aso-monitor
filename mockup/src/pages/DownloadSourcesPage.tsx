import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PageHeader } from "@/components/organisms/PageHeader";
import { Badge } from "@/components/atoms/Badge";
import { DataSourceLabel } from "@/components/molecules/DataSourceLabel";
import { useOS } from "@/contexts/OSContext";
import { getCollectionStatus, getDownloadSourceData } from "@/data/mockData";
import {
  fetchDownloadSources,
  type DownloadSourceEntry,
} from "@/api/sheets";

type ViewMode = "absolute" | "percentage";

const SOURCE_KEYS = [
  "organicSearch",
  "organicBrowse",
  "paidSearch",
  "paidDisplay",
  "webReferral",
  "appReferral",
] as const;

const SOURCE_LABELS: Record<string, string> = {
  organicSearch: "Organic Search",
  organicBrowse: "Organic Browse",
  paidSearch: "Paid Search",
  paidDisplay: "Paid Display",
  webReferral: "Web Referral",
  appReferral: "App Referral",
};

const COLORS: Record<string, string> = {
  organicSearch: "#10b981",
  organicBrowse: "#34d399",
  paidSearch: "#f59e0b",
  paidDisplay: "#fbbf24",
  webReferral: "#0785f2",
  appReferral: "#60a5fa",
};

export default function DownloadSourcesPage() {
  const { os } = useOS();
  const collectionStatus = getCollectionStatus(os);

  const [sheetData, setSheetData] = useState<DownloadSourceEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("absolute");

  useEffect(() => {
    setLoading(true);
    fetchDownloadSources(os)
      .then((data) => {
        if (data && data.length > 0) setSheetData(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [os]);

  const mockData = getDownloadSourceData(os);
  const rawData = sheetData && sheetData.length > 0 ? sheetData : mockData;

  const chartData = rawData.map((entry) => {
    const d = new Date(entry.date);
    const total = SOURCE_KEYS.reduce((s, k) => s + (entry[k] || 0), 0);
    const pcts: Record<string, number> = {};
    for (const k of SOURCE_KEYS) {
      pcts[`${k}Pct`] = total > 0 ? Math.round(((entry[k] || 0) / total) * 1000) / 10 : 0;
    }
    return {
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      fullDate: entry.date,
      ...Object.fromEntries(SOURCE_KEYS.map((k) => [k, entry[k] || 0])),
      total,
      ...pcts,
    };
  });

  // 7일 평균
  const recent7 = chartData.slice(-7);
  const avg = (key: string) =>
    recent7.length > 0
      ? Math.round(recent7.reduce((s, d) => s + (Number((d as Record<string, unknown>)[key]) || 0), 0) / recent7.length)
      : 0;
  const avgPct = (key: string) =>
    recent7.length > 0
      ? Math.round(
          (recent7.reduce((s, d) => s + (Number((d as Record<string, unknown>)[`${key}Pct`]) || 0), 0) / recent7.length) * 10
        ) / 10
      : 0;
  const avgTotal = avg("total");

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Sources"
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
              <span className="font-semibold text-foreground-secondary">다운로드 소스 분류</span>
              <span>— Sensor Tower Store Intelligence</span>
            </div>
            <div className="flex items-center gap-2 text-[12px] leading-[16px] text-foreground-tertiary">
              <span className="w-2 h-2 rounded-full bg-interactive-background1" />
              <span className="font-semibold text-foreground-secondary">6가지 유입 채널</span>
              <span>— Organic Search · Organic Browse · Paid Search · Paid Display · Web Referral · App Referral</span>
            </div>
          </div>
        </div>

        {/* KPI 카드 — 2행 3열 + 상단 총합 */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-background-card rounded-lg shadow-1 p-4">
            <div className="text-[12px] font-semibold leading-[16px] text-foreground-tertiary mb-1">
              일평균 다운로드 (7일)
            </div>
            <div className="text-[24px] font-bold leading-[32px] text-foreground-primary">
              {avgTotal.toLocaleString()}
            </div>
          </div>
          {SOURCE_KEYS.slice(0, 3).map((key) => (
            <div key={key} className="bg-background-card rounded-lg shadow-1 p-4">
              <div className="text-[12px] font-semibold leading-[16px] text-foreground-tertiary mb-1">
                {SOURCE_LABELS[key]}
              </div>
              <div className="text-[20px] font-bold leading-[28px]" style={{ color: COLORS[key] }}>
                {avgPct(key)}%
              </div>
              <div className="text-[11px] text-foreground-tertiary">
                일평균 {avg(key).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-4 -mt-2">
          <div />
          {SOURCE_KEYS.slice(3).map((key) => (
            <div key={key} className="bg-background-card rounded-lg shadow-1 p-4">
              <div className="text-[12px] font-semibold leading-[16px] text-foreground-tertiary mb-1">
                {SOURCE_LABELS[key]}
              </div>
              <div className="text-[20px] font-bold leading-[28px]" style={{ color: COLORS[key] }}>
                {avgPct(key)}%
              </div>
              <div className="text-[11px] text-foreground-tertiary">
                일평균 {avg(key).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* 차트 */}
        <div className="bg-background-card rounded-lg shadow-1 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[16px] font-bold leading-[24px] text-foreground-primary">
                일별 유입 경로 추이
              </h2>
              <span className="text-[13px] font-normal leading-[18px] text-foreground-tertiary">
                {os === "ios" ? "App Store" : "Google Play"} 다운로드 소스별 일별 추이
              </span>
            </div>
            <div className="flex gap-1 bg-background-selectable2 rounded-lg p-0.5">
              <button
                className={`px-3 py-1 text-[12px] font-semibold rounded-md transition-colors cursor-pointer ${
                  viewMode === "absolute"
                    ? "bg-background-card shadow-1 text-foreground-primary"
                    : "text-foreground-tertiary hover:text-foreground-secondary"
                }`}
                onClick={() => setViewMode("absolute")}
              >
                다운로드 수
              </button>
              <button
                className={`px-3 py-1 text-[12px] font-semibold rounded-md transition-colors cursor-pointer ${
                  viewMode === "percentage"
                    ? "bg-background-card shadow-1 text-foreground-primary"
                    : "text-foreground-tertiary hover:text-foreground-secondary"
                }`}
                onClick={() => setViewMode("percentage")}
              >
                비율 (%)
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <span className="text-[14px] text-foreground-tertiary">데이터 로딩 중...</span>
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <span className="text-[14px] text-foreground-tertiary">유입 경로 데이터가 아직 없습니다</span>
              <span className="text-[12px] text-foreground-tertiary">데이터 수집이 시작되면 여기에 표시됩니다</span>
            </div>
          ) : viewMode === "absolute" ? (
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#999999" }} />
                <YAxis tick={{ fontSize: 11, fill: "#999999" }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0]?.payload as Record<string, unknown>;
                    return (
                      <div className="bg-white border border-stroke-inactive rounded-lg shadow-2 p-3 min-w-[200px]">
                        <div className="text-[12px] font-semibold text-foreground-primary mb-2">
                          {label} ({data?.fullDate})
                        </div>
                        {SOURCE_KEYS.map((k) => (
                          <div key={k} className="text-[11px] flex justify-between gap-4 mb-0.5">
                            <span style={{ color: COLORS[k] }}>{SOURCE_LABELS[k]}</span>
                            <span className="font-semibold">{(data?.[k] || 0).toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="text-[11px] flex justify-between gap-4 mt-1 pt-1 border-t border-stroke-inactive font-semibold text-foreground-primary">
                          <span>합계</span>
                          <span>{(data?.total || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend
                  formatter={(value) => <span className="text-[11px]">{value}</span>}
                />
                {SOURCE_KEYS.map((key) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stackId="1"
                    stroke={COLORS[key]}
                    fill={COLORS[key]}
                    fillOpacity={0.7}
                    name={SOURCE_LABELS[key]}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#999999" }} />
                <YAxis tick={{ fontSize: 11, fill: "#999999" }} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0]?.payload as Record<string, unknown>;
                    return (
                      <div className="bg-white border border-stroke-inactive rounded-lg shadow-2 p-3 min-w-[200px]">
                        <div className="text-[12px] font-semibold text-foreground-primary mb-2">
                          {label} ({data?.fullDate})
                        </div>
                        {SOURCE_KEYS.map((k) => (
                          <div key={k} className="text-[11px] flex justify-between gap-4 mb-0.5">
                            <span style={{ color: COLORS[k] }}>{SOURCE_LABELS[k]}</span>
                            <span className="font-semibold">{String(data?.[`${k}Pct`] ?? 0)}%</span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <Legend
                  formatter={(value) => <span className="text-[11px]">{value}</span>}
                />
                {SOURCE_KEYS.map((key) => (
                  <Bar
                    key={key}
                    dataKey={`${key}Pct`}
                    stackId="1"
                    fill={COLORS[key]}
                    name={SOURCE_LABELS[key]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 일별 상세 테이블 */}
        <div className="bg-background-card rounded-lg shadow-1 overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <h2 className="text-[16px] font-bold leading-[24px] text-foreground-primary">
              일별 상세 데이터
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-stroke-inactive">
                  <th className="px-3 py-2 text-left font-semibold text-foreground-secondary">날짜</th>
                  <th className="px-3 py-2 text-right font-semibold text-foreground-secondary">합계</th>
                  {SOURCE_KEYS.map((k) => (
                    <th key={k} className="px-3 py-2 text-right font-semibold" style={{ color: COLORS[k] }}>
                      {SOURCE_LABELS[k]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...chartData].reverse().map((row) => {
                  const r = row as Record<string, number | string>;
                  return (
                    <tr key={r.fullDate as string} className="border-b border-stroke-inactive hover:bg-overlay-hover transition-colors">
                      <td className="px-3 py-2 text-foreground-primary font-medium">{r.fullDate}</td>
                      <td className="px-3 py-2 text-right text-foreground-primary font-semibold">
                        {(r.total as number).toLocaleString()}
                      </td>
                      {SOURCE_KEYS.map((k) => (
                        <td key={k} className="px-3 py-2 text-right text-foreground-secondary">
                          {((r[k] as number) || 0).toLocaleString()}
                          <span className="text-foreground-tertiary ml-1">
                            ({r[`${k}Pct`]}%)
                          </span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
