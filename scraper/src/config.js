import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

export const config = {
  // Sensor Tower (Google OAuth 로그인)
  st: {
    googleEmail: process.env.ST_GOOGLE_EMAIL || 'zoe.yoon@mathpresso.com',
    googlePassword: process.env.ST_GOOGLE_PASSWORD,
    baseUrl: 'https://app.sensortower.com',
  },

  // Google Sheets
  sheets: {
    spreadsheetId: process.env.GOOGLE_SHEET_ID || '1_yhVkbX28GOHwgvMavPt2ulLGxZoMojdcjVfgJvP2KM',
    serviceAccountKeyPath: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || join(ROOT, 'service-account.json'),
  },

  // 콴다 앱 정보
  qanda: {
    iosAppId: process.env.QANDA_IOS_APP_ID || '1150247800',
    androidPackage: process.env.QANDA_ANDROID_PACKAGE || 'com.mathpresso.qanda',
  },

  // 경쟁사
  competitors: {
    malhaeboca: { name: '말해보카', iosId: '1220155871', androidPackage: 'com.malhaeboca.app' },
    speak:      { name: '스픽',     iosId: '1286609883', androidPackage: 'com.speakeasyapp' },
    duolingo:   { name: '듀오링고', iosId: '570060128',  androidPackage: 'com.duolingo' },
    charlcak:   { name: '찰칵',     iosId: '1609537938', androidPackage: 'com.mathflat' },
  },

  // 키워드
  keywords: [
    { name: '수학', classification: 'primary' },
    { name: '문제 풀이', classification: 'primary' },
    { name: '답지', classification: 'primary' },
    { name: '교육', classification: 'primary' },
    { name: '공부', classification: 'primary' },
    { name: '시험', classification: 'primary' },
    { name: '풀이', classification: 'primary' },
    { name: 'ai 공부', classification: 'secondary' },
    { name: '내신', classification: 'secondary' },
    { name: '모의고사', classification: 'secondary' },
    { name: '영단어', classification: 'secondary' },
    { name: '기출', classification: 'secondary' },
    { name: '공부 타이머', classification: 'secondary' },
    { name: '과학', classification: 'secondary' },
  ],

  // 파일 경로
  paths: {
    root: ROOT,
    authState: join(ROOT, 'auth-state'),
    screenshots: join(ROOT, 'screenshots'),
  },
};
