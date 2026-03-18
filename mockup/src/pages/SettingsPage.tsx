import { useState } from "react";
import { PageHeader } from "@/components/organisms/PageHeader";
import { Snackbar } from "@/components/organisms/Snackbar";
import { StandardButton } from "@/components/atoms/StandardButton";
import { RadioButton } from "@/components/atoms/RadioButton";
import { Divider } from "@/components/atoms/Divider";
import { Badge } from "@/components/atoms/Badge";
import { DataSourceLabel } from "@/components/molecules/DataSourceLabel";
import { getCollectionStatus } from "@/data/mockData";
import { useOS } from "@/contexts/OSContext";

export default function SettingsPage() {
  const { os } = useOS();
  const collectionStatus = getCollectionStatus(os);
  const [webhookUrl, setWebhookUrl] = useState("https://hooks.slack.com/services/T00/B00/xxx");
  const [threshold, setThreshold] = useState(3);
  const [alertTarget, setAlertTarget] = useState("all");
  const [snackbar, setSnackbar] = useState({ visible: false, message: "" });

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Settings" />

      <div className="px-6 pb-6 flex flex-col gap-6 max-w-[720px]">
        {/* Slack Alert Settings */}
        <div className="bg-background-card rounded-lg shadow-1 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-bold leading-[24px] text-foreground-primary">
              Slack 알림 설정
            </h2>
            <Badge variant="Success" label="연결됨" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold leading-[18px] text-foreground-secondary">
              Webhook URL
            </label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="h-[40px] px-3 rounded border border-stroke-active bg-background-card text-[14px] font-normal leading-[20px] text-foreground-primary focus:outline-none focus:border-interactive-stroke1 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold leading-[18px] text-foreground-secondary">
              알림 임계값
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={10}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="flex-1 accent-key-background1"
              />
              <span className="text-[14px] font-semibold leading-[20px] text-foreground-primary min-w-[40px]">
                ±{threshold}위
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold leading-[18px] text-foreground-secondary">
              알림 대상
            </label>
            <div className="flex gap-4">
              <RadioButton
                name="alert-target"
                value="all"
                label="전체 키워드"
                checked={alertTarget === "all"}
                onChange={setAlertTarget}
              />
              <RadioButton
                name="alert-target"
                value="primary"
                label="주력 키워드만"
                checked={alertTarget === "primary"}
                onChange={setAlertTarget}
              />
              <RadioButton
                name="alert-target"
                value="secondary"
                label="보조 키워드만"
                checked={alertTarget === "secondary"}
                onChange={setAlertTarget}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <StandardButton
              variant="Outlined"
              size="S"
              onClick={() => setSnackbar({ visible: true, message: "테스트 알림이 발송되었습니다." })}
            >
              테스트 발송
            </StandardButton>
            <StandardButton
              variant="Primary"
              size="S"
              onClick={() => setSnackbar({ visible: true, message: "설정이 저장되었습니다." })}
            >
              저장
            </StandardButton>
          </div>
        </div>

        <Divider />

        {/* Data Collection Status */}
        <div className="bg-background-card rounded-lg shadow-1 p-5 flex flex-col gap-4">
          <h2 className="text-[16px] font-bold leading-[24px] text-foreground-primary">
            데이터 수집 상태
          </h2>
          <div className="flex flex-col gap-3">
            {collectionStatus.map((cs) => {
              return (
                <div key={cs.source} className="flex items-center justify-between py-2 border-b border-stroke-inactive last:border-b-0">
                  <span className="text-[14px] font-semibold leading-[20px] text-foreground-primary">
                    {cs.label}
                  </span>
                  <DataSourceLabel
                    source={cs.source}
                    lastUpdated={cs.lastUpdated}
                    status={cs.status as any}
                  />
                </div>
              );
            })}
          </div>
          <div className="bg-background-selectable2 rounded-lg p-3 flex flex-col gap-1.5">
            <span className="text-[12px] font-semibold leading-[16px] text-foreground-secondary">
              데이터 출처 상세
            </span>
            <span className="text-[11px] leading-[16px] text-foreground-tertiary">
              <strong>Sensor Tower</strong> — 키워드 랭킹, 트래픽 점수, 난이도, 기회 점수, 검색량, 점유율, 다운로드 (iOS App Store + Google Play KR)
            </span>
          </div>
        </div>

        <Divider />

        {/* Classification Criteria */}
        <div className="bg-background-card rounded-lg shadow-1 p-5 flex flex-col gap-4">
          <h2 className="text-[16px] font-bold leading-[24px] text-foreground-primary">
            키워드 분류 기준
          </h2>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold leading-[18px] text-foreground-secondary">
              주력(방어) 키워드
            </label>
            <textarea
              defaultValue="수학, 문제, 풀이, 답지, 교육, 공부, 시험"
              rows={2}
              className="px-3 py-2 rounded border border-stroke-active bg-background-card text-[14px] font-normal leading-[20px] text-foreground-primary focus:outline-none focus:border-interactive-stroke1 transition-colors resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-semibold leading-[18px] text-foreground-secondary">
              보조(확장) 키워드 기준
            </label>
            <textarea
              defaultValue="트래픽 점수 3.0 이상, 콴다 연관 카테고리 (ai, 학습, 시험, 앱)"
              rows={2}
              className="px-3 py-2 rounded border border-stroke-active bg-background-card text-[14px] font-normal leading-[20px] text-foreground-primary focus:outline-none focus:border-interactive-stroke1 transition-colors resize-none"
            />
          </div>

          <StandardButton
            variant="Primary"
            size="S"
            onClick={() => setSnackbar({ visible: true, message: "분류 기준이 저장되었습니다." })}
          >
            저장
          </StandardButton>
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
