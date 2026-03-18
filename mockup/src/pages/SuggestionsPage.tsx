import { useState, useMemo } from "react";
import { PageHeader } from "@/components/organisms/PageHeader";
import { DataTable } from "@/components/organisms/DataTable";
import type { ColumnDef } from "@/components/organisms/DataTable";
import { AdoptModal } from "@/components/organisms/AdoptModal";
import { Snackbar } from "@/components/organisms/Snackbar";
import { Badge } from "@/components/atoms/Badge";
import { StandardButton } from "@/components/atoms/StandardButton";
import { SearchInput } from "@/components/molecules/SearchInput";
import { FilterChip } from "@/components/molecules/FilterChip";
import { CriteriaInfoPanel } from "@/components/molecules/CriteriaInfoPanel";
import { getSuggestedKeywords } from "@/data/mockData";
import type { SuggestedKeyword } from "@/data/mockData";
import { useOS } from "@/contexts/OSContext";
import { adoptSuggestion } from "@/api/sheets";

export default function SuggestionsPage() {
  const { os } = useOS();
  const suggestedKeywords = getSuggestedKeywords(os);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [adoptTarget, setAdoptTarget] = useState<SuggestedKeyword | null>(null);
  const [snackbar, setSnackbar] = useState({ visible: false, message: "" });

  const categories = useMemo(() => {
    return [...new Set(suggestedKeywords.map((k) => k.category))];
  }, [suggestedKeywords]);

  const filtered = useMemo(() => {
    let result = suggestedKeywords;
    if (search) {
      result = result.filter((k) => k.name.includes(search));
    }
    if (categoryFilter) {
      result = result.filter((k) => k.category === categoryFilter);
    }
    return result;
  }, [search, categoryFilter, suggestedKeywords]);

  const columns: ColumnDef<SuggestedKeyword>[] = [
    {
      key: "name",
      header: "키워드",
      width: "180px",
      render: (row) => (
        <span className="text-[14px] font-semibold leading-[20px] text-foreground-primary">
          {row.name}
        </span>
      ),
    },
    {
      key: "trafficScore",
      header: "트래픽 점수",
      width: "100px",
      render: (row) => (
        <span className="text-[14px] font-normal leading-[20px] text-foreground-primary">
          {row.trafficScore}
        </span>
      ),
    },
    {
      key: "currentRank",
      header: "콴다 랭킹",
      width: "100px",
      render: (row) => (
        <span className="text-[14px] font-normal leading-[20px] text-foreground-primary">
          {row.currentRank !== null ? `${row.currentRank}위` : "—"}
        </span>
      ),
    },
    {
      key: "category",
      header: "카테고리",
      width: "100px",
      render: (row) => (
        <Badge variant="Neutral" label={row.category} />
      ),
    },
    {
      key: "reason",
      header: "추천 사유",
      width: "200px",
      sortable: false,
      render: (row) => (
        <span className="text-[13px] font-normal leading-[18px] text-foreground-tertiary">
          {row.reason}
        </span>
      ),
    },
    {
      key: "status",
      header: "상태",
      width: "120px",
      sortable: false,
      render: (row) =>
        row.isMonitored ? (
          <Badge variant="Informative" label="모니터링 중" />
        ) : null,
    },
    {
      key: "actions",
      header: "",
      width: "80px",
      sortable: false,
      render: (row) =>
        row.isMonitored ? null : (
          <StandardButton
            variant="Primary"
            size="XS"
            onClick={() => setAdoptTarget(row)}
          >
            채택
          </StandardButton>
        ),
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Suggestions"
        subtitle={
          <div className="flex items-center gap-3">
            <Badge variant="Informative" label={os === "ios" ? "iOS" : "Android"} />
            <Badge variant="Key" label={`${suggestedKeywords.filter((k) => !k.isMonitored).length}개 발견`} />
            <span className="text-[11px] text-foreground-disabled">
              출처: Sensor Tower
            </span>
          </div>
        }
      />

      <div className="px-6 flex flex-col gap-4 flex-1 min-h-0">
        <CriteriaInfoPanel
          title="키워드 제안 기준"
          defaultOpen
          content={
            <div className="flex flex-col gap-2">
              <p><strong>방어 키워드 기준:</strong> 콴다 핵심 브랜드 키워드 (수학, 문제, 풀이 등)</p>
              <p><strong>확장 키워드 기준:</strong> 트래픽 점수 3.0 이상, 콴다 연관 카테고리 (교육/학습, 수학/풀이, 시험/입시)</p>
              <p><strong>자동 제외:</strong> 브랜드 변형 키워드 (콴다/콴디/쾬다 등)</p>
            </div>
          }
        />

        <div className="bg-informative-background2 rounded-lg px-4 py-3 flex items-start gap-3">
          <span className="text-[16px] leading-[20px] mt-0.5">💡</span>
          <div className="flex flex-col gap-1">
            <span className="text-[13px] font-semibold leading-[18px] text-informative-foreground2">
              채택 버튼을 누르면?
            </span>
            <span className="text-[12px] font-normal leading-[18px] text-foreground-secondary">
              키워드 현황(Keywords) 목록에 추가되어 일일 랭킹 추적, Slack 변동 알림, 주간 리포트에 자동 포함됩니다.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            onClear={() => setSearch("")}
            className="w-[280px]"
          />
          {categories.map((cat) => (
            <FilterChip
              key={cat}
              label={cat}
              active={categoryFilter === cat}
              onToggle={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
            />
          ))}
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          emptyMessage="현재 기준에 맞는 새 키워드가 없습니다. 기준을 조정해보세요."
          className="flex-1 min-h-0"
        />
      </div>

      {adoptTarget && (
        <AdoptModal
          keyword={{ name: adoptTarget.name, trafficScore: adoptTarget.trafficScore }}
          onClose={() => setAdoptTarget(null)}
          onAdopt={async (classification) => {
            const clsLabel = classification === "primary" ? "주력(방어)" : "보조(확장)";
            try {
              await adoptSuggestion(adoptTarget.name, classification);
              setSnackbar({
                visible: true,
                message: `'${adoptTarget.name}' 키워드가 ${clsLabel}로 추가되었습니다. (저장됨)`,
              });
            } catch {
              setSnackbar({
                visible: true,
                message: `'${adoptTarget.name}' 키워드 채택 저장에 실패했습니다.`,
              });
            }
            setAdoptTarget(null);
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
