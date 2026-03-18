import { useState, useMemo } from "react";
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
import { DataTable } from "@/components/organisms/DataTable";
import type { ColumnDef } from "@/components/organisms/DataTable";
import { ReclassifyModal } from "@/components/organisms/ReclassifyModal";
import { Snackbar } from "@/components/organisms/Snackbar";
import { Tabs } from "@/components/atoms/Tabs";
import { Badge } from "@/components/atoms/Badge";
import { StandardButton } from "@/components/atoms/StandardButton";
import { SearchInput } from "@/components/molecules/SearchInput";
import { ChangeBadge } from "@/components/molecules/ChangeBadge";
import { Sparkline } from "@/components/molecules/Sparkline";
import { CriteriaInfoPanel } from "@/components/molecules/CriteriaInfoPanel";
import { DataSourceLabel } from "@/components/molecules/DataSourceLabel";
import { getKeywords, getCollectionStatus } from "@/data/mockData";
import type { Keyword, KeywordClassification } from "@/data/mockData";
import { useOS } from "@/contexts/OSContext";
import { updateClassification } from "@/api/sheets";

const classificationBadgeMap: Record<KeywordClassification, { variant: "Key" | "Success" | "Neutral"; label: string }> = {
  primary: { variant: "Key", label: "주력(방어)" },
  secondary: { variant: "Success", label: "보조(확장)" },
  unclassified: { variant: "Neutral", label: "미분류" },
};

// Generate mock 30-day trend data for a keyword
function generateMockTrend(_baseRank: number, sparkline: number[]) {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
    const sparkIdx = Math.min(Math.floor((29 - i) / 4), sparkline.length - 1);
    const rank = sparkline[sparkIdx] + Math.floor(Math.random() * 2 - 1);
    data.push({ date: dateStr, rank: Math.max(1, rank) });
  }
  return data;
}

const TREND_COLORS = [
  "#ed5000", "#0785f2", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
  "#14b8a6", "#e11d48", "#a855f7", "#0ea5e9",
];

export default function KeywordsPage() {
  const navigate = useNavigate();
  const { os } = useOS();
  const keywords = getKeywords(os);
  const collectionStatus = getCollectionStatus(os);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "trend">("table");
  const [reclassifyTarget, setReclassifyTarget] = useState<Keyword | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: "" });

  const primaryCount = keywords.filter((k) => k.classification === "primary").length;
  const secondaryCount = keywords.filter((k) => k.classification === "secondary").length;
  const unclassifiedCount = keywords.filter((k) => k.classification === "unclassified").length;

  const tabItems = [
    { label: "전체", count: keywords.length, value: "all" },
    { label: "주력(방어)", count: primaryCount, value: "primary" },
    { label: "보조(확장)", count: secondaryCount, value: "secondary" },
    { label: "미분류", count: unclassifiedCount, value: "unclassified" },
  ];

  const filtered = useMemo(() => {
    let result = keywords;
    if (activeTab !== "all") {
      result = result.filter((k) => k.classification === activeTab);
    }
    if (search) {
      result = result.filter((k) => k.name.includes(search));
    }
    return result;
  }, [activeTab, search, keywords]);

  // Build trend data for the classification trend view
  // Shows primary + secondary trends side by side when "all" tab, or filtered by tab
  const trendSections = useMemo(() => {
    const buildTrend = (classification: KeywordClassification) => {
      const classKeywords = keywords.filter((k) => k.classification === classification);
      const perKeyword = classKeywords.map((kw) => ({
        name: kw.name,
        data: generateMockTrend(kw.currentRank, kw.sparkline),
      }));
      if (perKeyword.length === 0) return { keywords: classKeywords, data: [] };
      const merged = perKeyword[0].data.map((d, i) => {
        const entry: Record<string, any> = { date: d.date };
        perKeyword.forEach((pk) => {
          entry[pk.name] = pk.data[i]?.rank ?? null;
        });
        return entry;
      });
      return { keywords: classKeywords, data: merged };
    };

    if (activeTab === "all") {
      return [
        { label: "주력(방어)", ...buildTrend("primary") },
        { label: "보조(확장)", ...buildTrend("secondary") },
      ];
    }
    if (activeTab === "primary" || activeTab === "secondary") {
      const label = activeTab === "primary" ? "주력(방어)" : "보조(확장)";
      return [{ label, ...buildTrend(activeTab as KeywordClassification) }];
    }
    return [];
  }, [activeTab, keywords]);

  const columns: ColumnDef<Keyword>[] = [
    {
      key: "name",
      header: "키워드",
      width: "160px",
      sticky: true,
      render: (row) => (
        <span className="text-[14px] font-semibold leading-[20px] text-foreground-primary">
          {row.name}
        </span>
      ),
    },
    {
      key: "classification",
      header: "분류",
      width: "100px",
      render: (row) => {
        const map = classificationBadgeMap[row.classification];
        return <Badge variant={map.variant} label={map.label} />;
      },
    },
    {
      key: "currentRank",
      header: "현재 랭킹",
      width: "90px",
      render: (row) => (
        <span className="text-[14px] font-normal leading-[20px] text-foreground-primary">
          {row.currentRank}위
        </span>
      ),
    },
    {
      key: "change",
      header: "전일 대비",
      width: "80px",
      render: (row) => <ChangeBadge value={row.change} />,
    },
    {
      key: "sparkline",
      header: "7일 추이",
      width: "100px",
      sortable: false,
      render: (row) => <Sparkline data={row.sparkline} />,
    },
    {
      key: "trafficScore",
      header: "트래픽",
      width: "80px",
      render: (row) => (
        <span className="text-[14px] font-normal leading-[20px] text-foreground-primary">
          {row.trafficScore}
        </span>
      ),
    },
    {
      key: "downloads",
      header: "다운로드",
      width: "90px",
      render: (row) => (
        <span className="text-[14px] font-normal leading-[20px] text-foreground-primary">
          {row.downloads.toLocaleString()}
        </span>
      ),
    },
    {
      key: "cvr",
      header: "CVR",
      width: "70px",
      render: (row) => (
        <span className="text-[14px] font-normal leading-[20px] text-foreground-primary">
          {row.cvr}%
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "48px",
      sortable: false,
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setReclassifyTarget(row);
          }}
          className="text-foreground-tertiary hover:text-foreground-secondary cursor-pointer p-1"
          aria-label="더보기"
        >
          <span className="text-[16px]">···</span>
        </button>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Keywords"
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
            <span className="text-[11px] text-foreground-disabled">
              출처: Sensor Tower
            </span>
          </div>
        }
        actions={
          <StandardButton variant="Primary" icon="IconPlus" size="S" onClick={() => setShowAddModal(true)}>
            키워드 추가
          </StandardButton>
        }
      />

      <div className="px-6 flex flex-col gap-4 flex-1 min-h-0">
        <Tabs items={tabItems} activeValue={activeTab} onChange={setActiveTab} />

        <div className="flex items-center gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            onClear={() => setSearch("")}
            className="w-[280px]"
          />
          <div className="flex items-center bg-background-selectable2 rounded-lg p-0.5 ml-auto">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1 rounded-md text-[13px] font-semibold leading-[18px] cursor-pointer transition-colors
                ${viewMode === "table"
                  ? "bg-background-card text-foreground-primary shadow-sm"
                  : "text-foreground-tertiary hover:text-foreground-secondary"
                }`}
            >
              테이블
            </button>
            <button
              onClick={() => setViewMode("trend")}
              className={`px-3 py-1 rounded-md text-[13px] font-semibold leading-[18px] cursor-pointer transition-colors
                ${viewMode === "trend"
                  ? "bg-background-card text-foreground-primary shadow-sm"
                  : "text-foreground-tertiary hover:text-foreground-secondary"
                }`}
            >
              트렌드
            </button>
          </div>
        </div>

        <CriteriaInfoPanel
          title="키워드 분류 기준"
          content={
            <div className="flex flex-col gap-2">
              <p><strong>주력(방어):</strong> 수학, 문제, 풀이, 답지, 교육, 공부, 시험 — 핵심 브랜드 키워드</p>
              <p><strong>보조(확장):</strong> 트래픽 3.0+, 콴다 연관 카테고리 — 성장 기회 키워드</p>
            </div>
          }
        />

        {viewMode === "trend" ? (
          <div className="flex flex-col gap-6 flex-1 min-h-0 overflow-auto pb-4">
            {trendSections.map((section) => (
              <div key={section.label} className="bg-background-card rounded-lg shadow-1 p-4">
                <h3 className="text-[14px] font-semibold leading-[20px] text-foreground-primary mb-4">
                  {section.label} 키워드 30일 랭킹 추이
                </h3>
                {section.data.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={section.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#999999" }} />
                      <YAxis reversed tick={{ fontSize: 11, fill: "#999999" }} />
                      <Tooltip />
                      <Legend />
                      {section.keywords.map((kw, i) => (
                        <Line
                          key={kw.id}
                          type="monotone"
                          dataKey={kw.name}
                          stroke={TREND_COLORS[i % TREND_COLORS.length]}
                          strokeWidth={2}
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-[14px] text-foreground-tertiary text-center py-8">
                    해당 분류의 키워드가 없습니다.
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            onRowClick={(row) => navigate(`/keywords/${row.id}`)}
            emptyMessage="조건에 맞는 키워드가 없습니다. 필터를 변경해보세요."
            className="flex-1 min-h-0"
          />
        )}
      </div>

      {reclassifyTarget && (
        <ReclassifyModal
          keyword={{
            name: reclassifyTarget.name,
            currentClassification: reclassifyTarget.classification,
          }}
          onClose={() => setReclassifyTarget(null)}
          onReclassify={async (newClassification) => {
            try {
              await updateClassification(reclassifyTarget.name, newClassification);
              setSnackbar({
                visible: true,
                message: `'${reclassifyTarget.name}' 분류가 변경되었습니다. (저장됨)`,
              });
            } catch {
              setSnackbar({
                visible: true,
                message: `'${reclassifyTarget.name}' 분류 저장에 실패했습니다.`,
              });
            }
            setReclassifyTarget(null);
          }}
        />
      )}

      {showAddModal && (
        <AddKeywordModal
          onClose={() => setShowAddModal(false)}
          onAdd={async (name, classification) => {
            const clsLabel = classification === "primary" ? "주력(방어)" : "보조(확장)";
            try {
              await updateClassification(name, classification);
              setSnackbar({
                visible: true,
                message: `'${name}' 키워드가 ${clsLabel}로 추가되었습니다. (저장됨)`,
              });
            } catch {
              setSnackbar({
                visible: true,
                message: `'${name}' 키워드 추가 저장에 실패했습니다.`,
              });
            }
            setShowAddModal(false);
          }}
        />
      )}

      <Snackbar
        message={snackbar.message}
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ visible: false, message: "" })}
      />
    </div>
  );
}

// Inline add keyword modal
function AddKeywordModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (name: string, classification: "primary" | "secondary") => void;
}) {
  const [name, setName] = useState("");
  const [classification, setClassification] = useState<"primary" | "secondary" | "">("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-overlay-dimmed" onClick={onClose} />
      <div className="relative w-[420px] bg-background-card rounded-lg shadow-2 p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold leading-[28px] text-foreground-primary">
            키워드 추가
          </h2>
          <button onClick={onClose} className="text-foreground-tertiary hover:text-foreground-secondary cursor-pointer p-1">
            <span className="text-[20px]">✕</span>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-semibold leading-[18px] text-foreground-secondary">
            키워드 이름
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="모니터링할 키워드 입력"
            className="h-[40px] px-3 rounded border border-stroke-active bg-background-card text-[14px] font-normal leading-[20px] text-foreground-primary placeholder:text-foreground-disabled focus:outline-none focus:border-interactive-stroke1 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-[13px] font-semibold leading-[18px] text-foreground-secondary">
            분류
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="add-classification"
              checked={classification === "primary"}
              onChange={() => setClassification("primary")}
              className="accent-key-background1"
            />
            <span className="text-[14px] font-normal leading-[20px] text-foreground-primary">주력(방어) 키워드</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="add-classification"
              checked={classification === "secondary"}
              onChange={() => setClassification("secondary")}
              className="accent-key-background1"
            />
            <span className="text-[14px] font-normal leading-[20px] text-foreground-primary">보조(확장) 키워드</span>
          </label>
        </div>

        <div className="bg-background-selectable2 rounded-lg p-3 flex flex-col gap-1">
          <span className="text-[12px] font-normal leading-[18px] text-foreground-tertiary">
            추가된 키워드는 다음 데이터 수집 시점부터 일일 랭킹 추적, Slack 변동 알림, 주간 리포트에 포함됩니다.
          </span>
        </div>

        <div className="flex justify-end gap-2">
          <StandardButton variant="Secondary" onClick={onClose}>
            취소
          </StandardButton>
          <StandardButton
            variant="Primary"
            disabled={!name.trim() || !classification}
            onClick={() => classification && name.trim() && onAdd(name.trim(), classification)}
          >
            추가
          </StandardButton>
        </div>
      </div>
    </div>
  );
}
