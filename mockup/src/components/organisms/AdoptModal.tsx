import React, { useState } from "react";
import { IconButton } from "@/components/atoms/IconButton";
import { StandardButton } from "@/components/atoms/StandardButton";
import { RadioButton } from "@/components/atoms/RadioButton";
import { Badge } from "@/components/atoms/Badge";

interface AdoptModalProps {
  keyword: { name: string; trafficScore: number };
  onClose: () => void;
  onAdopt: (classification: "primary" | "secondary") => void;
}

export const AdoptModal: React.FC<AdoptModalProps> = ({
  keyword,
  onClose,
  onAdopt,
}) => {
  const [classification, setClassification] = useState<"primary" | "secondary" | "">("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-overlay-dimmed" onClick={onClose} />
      <div className="relative w-[400px] bg-background-card rounded-lg shadow-2 p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold leading-[28px] text-foreground-primary">
            키워드 추가
          </h2>
          <IconButton icon="IconX" aria-label="닫기" variant="ghost" onClick={onClose} />
        </div>

        {/* Keyword Info */}
        <div className="flex items-center gap-3">
          <span className="text-[16px] font-semibold leading-[24px] text-foreground-primary">
            {keyword.name}
          </span>
          <Badge variant="Informative" label={`트래픽 ${keyword.trafficScore}`} />
        </div>

        {/* What happens on adopt */}
        <div className="bg-background-selectable2 rounded-lg p-3 flex flex-col gap-1">
          <span className="text-[13px] font-semibold leading-[18px] text-foreground-secondary">
            채택하면?
          </span>
          <ul className="text-[12px] font-normal leading-[18px] text-foreground-tertiary list-disc pl-4 flex flex-col gap-0.5">
            <li>키워드 현황(Keywords) 목록에 추가되어 일일 랭킹이 추적됩니다.</li>
            <li>랭킹 변동 시 설정한 Slack 알림 임계값에 따라 알림이 발송됩니다.</li>
            <li>주간 리포트에 해당 키워드 데이터가 포함됩니다.</li>
          </ul>
        </div>

        {/* Classification Select */}
        <div className="flex flex-col gap-3">
          <RadioButton
            name="adopt-classification"
            value="primary"
            label="주력(방어) 키워드로 추가"
            checked={classification === "primary"}
            onChange={() => setClassification("primary")}
          />
          <RadioButton
            name="adopt-classification"
            value="secondary"
            label="보조(확장) 키워드로 추가"
            checked={classification === "secondary"}
            onChange={() => setClassification("secondary")}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <StandardButton variant="Secondary" onClick={onClose}>
            취소
          </StandardButton>
          <StandardButton
            variant="Primary"
            disabled={!classification}
            onClick={() => classification && onAdopt(classification)}
          >
            추가
          </StandardButton>
        </div>
      </div>
    </div>
  );
};
