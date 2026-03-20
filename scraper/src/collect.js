/**
 * ASO 데이터 수집 메인 스크립트
 *
 * Sensor Tower 웹 스크래핑 → JSON 파일 저장 + Google Sheets 적재 (Apps Script)
 */
import { collectSensorTowerData } from './sensor-tower.js';
import { writeRankings, writeDownloads, writeCategoryRank, writeSuggestions, writeDownloadSources, writeCollectionLog } from './sheets-writer.js';

const TODAY = new Date().toISOString().slice(0, 10);

async function main() {
  const startTime = Date.now();
  console.log(`\n=== ASO 데이터 수집 시작: ${TODAY} ===\n`);

  const errors = [];

  // ─── 1. Sensor Tower 수집 ───
  let stData = null;
  try {
    console.log('▶ Sensor Tower 수집...');
    stData = await collectSensorTowerData();
    console.log('✓ Sensor Tower 수집 성공\n');
  } catch (e) {
    console.error('✗ Sensor Tower 수집 실패:', e.message);
    errors.push(`ST: ${e.message}`);
  }

  // ─── 2. Google Sheets 적재 ───
  const iosCount = stData ? Object.keys(stData.iosRankings).length : 0;
  const androidCount = stData ? Object.keys(stData.androidRankings).length : 0;

  if (stData) {
    try {
      console.log('▶ Google Sheets 적재...');
      await writeRankings('iOS_Rankings', TODAY, stData.iosRankings);
      await writeRankings('Android_Rankings', TODAY, stData.androidRankings);
      await writeDownloads('iOS_Downloads', TODAY, stData.iosRankings);
      await writeDownloads('Android_Downloads', TODAY, stData.androidRankings);
      if (stData.categoryRankings?.length > 0) {
        await writeCategoryRank(TODAY, stData.categoryRankings);
      }
      await writeSuggestions(TODAY, stData.iosRankings, stData.androidRankings);
      if (stData.downloadSources) {
        await writeDownloadSources(TODAY, stData.downloadSources);
      }
      console.log('✓ Google Sheets 적재 성공\n');
    } catch (e) {
      console.error('✗ Google Sheets 적재 실패:', e.message);
      errors.push(`Sheets: ${e.message}`);
    }
  }

  // ─── 결과 출력 ───
  const durationSec = Math.round((Date.now() - startTime) / 1000);
  const status = errors.length === 0 ? '성공' : '실패';

  console.log('═══════════════════════════════════════');
  console.log(`상태: ${status}`);
  console.log(`소요: ${durationSec}초`);

  if (stData) {
    console.log(`iOS 키워드: ${iosCount}개`);
    console.log(`Android 키워드: ${androidCount}개`);
    console.log(`개요: ${JSON.stringify(stData.overview)}`);

    const previewKeywords = ['수학', '문제 풀이', '답지', '교육', '공부'];
    console.log('\n--- iOS 주요 키워드 순위 ---');
    for (const kw of previewKeywords) {
      const data = stData.iosRankings[kw];
      if (data) {
        console.log(`  ${kw}: 순위 ${data.rank ?? '-'} (변화: ${data.change ?? 0}, 트래픽: ${data.trafficScore ?? '-'})`);
      }
    }
    console.log('\n--- Android 주요 키워드 순위 ---');
    for (const kw of previewKeywords) {
      const data = stData.androidRankings[kw];
      if (data) {
        console.log(`  ${kw}: 순위 ${data.rank ?? '-'} (변화: ${data.change ?? 0}, 트래픽: ${data.trafficScore ?? '-'})`);
      }
    }
  }

  // Sheets 수집 로그 기록
  try {
    await writeCollectionLog(status, durationSec, iosCount, androidCount, errors.join(', '));
  } catch (e) {
    console.error('✗ CollectionLog 기록 실패:', e.message);
  }

  if (errors.length > 0) {
    console.log(`\n에러: ${errors.join(', ')}`);
  }
  console.log('═══════════════════════════════════════\n');
}

main().catch((e) => {
  console.error('치명적 오류:', e);
  process.exit(1);
});
