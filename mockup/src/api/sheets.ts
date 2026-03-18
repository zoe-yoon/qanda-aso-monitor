/**
 * Google Sheets Apps Script API 클라이언트
 */

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbxm6ezzpJLMSMm5cLSbwawpbtJBZ53xS32bibL3xZ5jZ0Wnt0d-EveSbBzPGKXzCaZn/exec";

export interface SheetConfig {
  classifications: Record<string, string>; // keyword → "primary" | "secondary" | "unclassified"
}

/** 시트에서 키워드 분류 설정 읽기 */
export async function fetchConfig(): Promise<SheetConfig> {
  const res = await fetch(`${GAS_URL}?action=config`);
  return res.json();
}

/** POST → GAS는 302 redirect 하므로 no-cors mode 사용 */
async function postToGAS(payload: Record<string, unknown>): Promise<void> {
  await fetch(GAS_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(payload),
  });
}

/** 키워드 분류 변경 */
export async function updateClassification(
  keyword: string,
  classification: string
): Promise<void> {
  await postToGAS({ type: "update-classification", keyword, classification });
}

/** 제안 키워드 채택 (분류 지정하여 모니터링 등록) */
export async function adoptSuggestion(
  keyword: string,
  classification: string
): Promise<void> {
  await postToGAS({ type: "adopt-suggestion", keyword, classification });
}

/** 메모 저장 (날짜별 ASO 조정 사항) */
export async function saveMemo(
  date: string,
  memo: string
): Promise<void> {
  await postToGAS({ type: "save-memo", date, memo });
}

/** 메모 목록 조회 */
export interface MemoEntry {
  date: string;
  memo: string;
}
export async function fetchMemos(): Promise<MemoEntry[]> {
  const res = await fetch(`${GAS_URL}?action=memos`);
  return res.json();
}
