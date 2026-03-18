import React, { useState } from "react";
import { IconButton } from "@/components/atoms/IconButton";
import { StandardButton } from "@/components/atoms/StandardButton";
import { RadioButton } from "@/components/atoms/RadioButton";
import { Badge } from "@/components/atoms/Badge";
import type { KeywordClassification } from "@/data/mockData";

interface ReclassifyModalProps {
  keyword: { name: string; currentClassification: KeywordClassification };
  onClose: () => void;
  onReclassify: (newClassification: KeywordClassification) => void;
}

const classificationLabel: Record<KeywordClassification, string> = {
  primary: "주력(방어)",
  secondary: "보조(확장)",
  unclassified: "미분류",
};

const classificationBadgeVariant: Record<KeywordClassification, "Key" | "Success" | "Neutral"> = {
  primary: "Key",
  secondary: "Success",
  unclassified: "Neutral",
};

export const ReclassifyModal: React.FC<ReclassifyModalProps> = ({
  keyword,
  onClose,
  onReclassify,
}) => {
  const [selected, setSelected] = useState<KeywordClassification>(keyword.currentClassification);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-overlay-dimmed" onClick={onClose} />
      <div className="relative w-[400px] bg-background-card rounded-lg shadow-2 p-6 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold leading-[28px] text-foreground-primary">
            분류 변경
          </h2>
          <IconButton icon="IconX" aria-label="닫기" variant="ghost" onClick={onClose} />
        </div>

        {/* Current State */}
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-normal leading-[20px] text-foreground-secondary">
            현재:
          </span>
          <Badge
            variant={classificationBadgeVariant[keyword.currentClassification]}
            label={classificationLabel[keyword.currentClassification]}
          />
        </div>

        {/* New Classification */}
        <div className="flex flex-col gap-3">
          {(["primary", "secondary", "unclassified"] as const).map((cls) => (
            <RadioButton
              key={cls}
              name="reclassify"
              value={cls}
              label={classificationLabel[cls]}
              checked={selected === cls}
              onChange={() => setSelected(cls)}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <StandardButton variant="Secondary" onClick={onClose}>
            취소
          </StandardButton>
          <StandardButton
            variant="Primary"
            disabled={selected === keyword.currentClassification}
            onClick={() => onReclassify(selected)}
          >
            변경
          </StandardButton>
        </div>
      </div>
    </div>
  );
};
