/**
 * Sensor Tower 수동 로그인 + 세션 저장
 *
 * 브라우저 열림 → 직접 로그인 → 센서타워 대시보드 뜨면 Enter 누르기
 */
import { chromium } from 'playwright';
import { config } from './config.js';
import { join } from 'path';
import { writeFileSync, mkdirSync } from 'fs';
import { createInterface } from 'readline';

const AUTH_STATE_FILE = join(config.paths.authState, 'st-session.json');
const SS = config.paths.screenshots;

async function manualLogin() {
  console.log('=== Sensor Tower 수동 로그인 ===\n');

  mkdirSync(SS, { recursive: true });
  mkdirSync(config.paths.authState, { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://app.sensortower.com/users/sign_in', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  console.log('브라우저가 열렸습니다.');
  console.log('');
  console.log('1. Google 로그인 클릭');
  console.log('2. 이메일/비밀번호 입력');
  console.log('3. 2단계 인증 완료');
  console.log('4. 센서타워 대시보드가 뜨면...');
  console.log('');
  console.log('👉 이 터미널에서 Enter를 누르세요!');
  console.log('');

  // Enter 키 대기 (시간 제한 없음)
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  await new Promise((resolve) => {
    rl.question('로그인 완료 후 Enter: ', () => {
      rl.close();
      resolve();
    });
  });

  // 세션 저장
  const state = await context.storageState();
  writeFileSync(AUTH_STATE_FILE, JSON.stringify(state));

  await page.screenshot({ path: join(SS, 'login-success.png'), fullPage: true });

  console.log('\n✅ 세션 저장 완료!');
  console.log(`   ${AUTH_STATE_FILE}`);
  console.log('\n이후 자동 수집 시 이 세션이 재활용됩니다.');

  await browser.close();
}

manualLogin();
