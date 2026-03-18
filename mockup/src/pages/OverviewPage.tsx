import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
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
import { fetchMemos, saveMemo, type MemoEntry } from "@/api/sheets";

export default function OverviewPage() {
  const navigate = useNavigate();
  const { os } = useOS();

  // 메모 상태
  const [memos, setMemos] = useState<MemoEntry[]>([]);
  const [memoModal, setMemoModal] = useState<{ open: boolean; date: string; text: string }>({
    open: false, date: "", text: "",
  });
  const [memoSaving, setMemoSaving] = useState(false);

  useEffect(() => {
    fetchMemos()
      .then(setMemos)
      .catch(() => {});
  }, []);

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
    fullDate: p.fullDate,
    iOS: p.iosIphone,
    Android: p.android,
  }));

  // 차트 날짜(M/D) ↔ 풀 날짜(YYYY-MM-DD) 매핑
  const dateToFull: Record<string, string> = Object.fromEntries(categoryChartData.map((d) => [d.date, d.fullDate]));
  const fullToDate: Record<string, string> = Object.fromEntries(categoryChartData.map((d) => [d.fullDate, d.date]));

  // memoMap
  const memoMapByFull = Object.fromEntries(memos.map((m) => [m.date, m.memo]));
  const memoMap = Object.fromEntries(
    memos.filter((m) => fullToDate[m.date]).map((m) => [fullToDate[m.date], m.memo])
  );

  const handleChartClick = useCallback((data: { activeLabel?: string }) => {
    if (!data?.activeLabel) return;
    const chartDate = data.activeLabel;
    const full = dateToFull[chartDate] || chartDate;
    setMemoModal({ open: true, date: full, text: memoMapByFull[full] || "" });
  }, [memoMapByFull, dateToFull]);

  const handleSaveMemo = useCallback(async () => {
    setMemoSaving(true);
    try {
      await saveMemo(memoModal.date, memoModal.text);
      setMemos((prev) => {
        const filtered = prev.filter((m) => m.date !== memoModal.date);
        if (memoModal.text.trim()) {
          filtered.push({ date: memoModal.date, memo: memoModal.text });
        }
        return filtered;
      });
      setMemoModal({ open: false, date: "", text: "" });
    } finally {
      setMemoSaving(false);
    }
  }, [memoModal]);

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
              교육 카테고리 앱 순위
            </h2>
            <span className="text-[12px] font-normal leading-[16px] text-foreground-tertiary">
              출처: Sensor Tower · 차트 클릭으로 메모 추가
            </span>
          </div>
          <span className="text-[13px] font-normal leading-[18px] text-foreground-tertiary mb-4 block">
            앱 스토어 교육 카테고리 내 콴다 순위 (낮을수록 좋음)
          </span>
          {categoryChartData.length >= 2 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={categoryChartData} onClick={handleChartClick}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#999999" }} />
                <YAxis reversed tick={{ fontSize: 11, fill: "#999999" }} domain={[1, "auto"]} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const memo = memoMap[label as string];
                    return (
                      <div className="bg-white border border-stroke-inactive rounded-lg shadow-2 p-3 max-w-[240px]">
                        <div className="text-[12px] font-semibold text-foreground-primary mb-1">{label}</div>
                        {payload.map((p) => (
                          <div key={p.name} className="text-[11px] flex justify-between gap-3">
                            <span style={{ color: p.color }}>{p.name}</span>
                            <span className="font-semibold">{p.value}위</span>
                          </div>
                        ))}
                        {memo && (
                          <div className="mt-2 pt-2 border-t border-stroke-inactive">
                            <div className="text-[11px] font-semibold text-key-foreground2 mb-0.5">ASO 메모</div>
                            <div className="text-[11px] text-foreground-secondary whitespace-pre-wrap">{memo}</div>
                          </div>
                        )}
                      </div>
                    );
                  }}
                />
                <Legend />
                {memos
                  .filter((m) => fullToDate[m.date])
                  .map((m) => (
                  <ReferenceLine
                    key={m.date}
                    x={fullToDate[m.date]}
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="4 2"
                    label={{
                      value: "📝",
                      position: "top",
                      fontSize: 12,
                    }}
                  />
                ))}
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

          {/* 메모 목록 */}
          {memos.length > 0 && (
            <div className="mt-4 border-t border-stroke-inactive pt-3">
              <div className="text-[12px] font-semibold text-foreground-secondary mb-2">ASO 조정 기록</div>
              <div className="flex flex-col gap-1.5">
                {memos
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((m) => (
                    <button
                      key={m.date}
                      onClick={() => setMemoModal({ open: true, date: m.date, text: m.memo })}
                      className="flex items-start gap-2 text-left hover:bg-overlay-hover rounded px-2 py-1 -mx-2 cursor-pointer transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] mt-1.5 shrink-0" />
                      <span className="text-[12px] font-semibold text-foreground-primary shrink-0">{m.date}</span>
                      <span className="text-[12px] text-foreground-tertiary truncate">{m.memo}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* 메모 모달 */}
        {memoModal.open && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setMemoModal({ open: false, date: "", text: "" })}>
            <div className="bg-background-card rounded-xl shadow-3 p-5 w-[400px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-[16px] font-bold text-foreground-primary mb-1">
                ASO 메모
              </h3>
              <p className="text-[13px] text-foreground-tertiary mb-4">{memoModal.date}</p>
              <textarea
                className="w-full h-24 px-3 py-2 border border-stroke-inactive rounded-lg text-[13px] text-foreground-primary bg-background-selectable2 resize-none focus:outline-none focus:ring-2 focus:ring-key-stroke2"
                placeholder="이 날짜에 적용한 ASO 변경 사항을 기록하세요..."
                value={memoModal.text}
                onChange={(e) => setMemoModal((prev) => ({ ...prev, text: e.target.value }))}
              />
              <div className="flex justify-end gap-2 mt-3">
                {memoMapByFull[memoModal.date] && (
                  <button
                    className="px-3 py-1.5 text-[13px] text-negative-foreground2 hover:bg-negative-background2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    disabled={memoSaving}
                    onClick={async () => {
                      setMemoSaving(true);
                      try {
                        await saveMemo(memoModal.date, "");
                        setMemos((prev) => prev.filter((m) => m.date !== memoModal.date));
                        setMemoModal({ open: false, date: "", text: "" });
                      } finally {
                        setMemoSaving(false);
                      }
                    }}
                  >
                    삭제
                  </button>
                )}
                <div className="flex-1" />
                <button
                  className="px-3 py-1.5 text-[13px] text-foreground-tertiary hover:bg-overlay-hover rounded-lg transition-colors cursor-pointer"
                  onClick={() => setMemoModal({ open: false, date: "", text: "" })}
                >
                  취소
                </button>
                <button
                  className="px-4 py-1.5 text-[13px] font-semibold text-white bg-key-background1 hover:bg-key-background2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  disabled={memoSaving}
                  onClick={handleSaveMemo}
                >
                  {memoSaving ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>
          </div>
        )}

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
