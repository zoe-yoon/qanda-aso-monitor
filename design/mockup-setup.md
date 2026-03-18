# Mockup Setup: ASO Keyword Monitor

> **Created**: 2026-03-10
> **Phase**: 6 - Setup

---

## Project Structure

```
mockup/
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.ts          (QDS3 tokens from foundation.md)
├── postcss.config.js
├── vite.config.ts
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css                (Pretendard font import + Tailwind)
    ├── components/
    │   ├── atoms/
    │   │   ├── Icon.tsx         (4088 lines, 303 QDS3 SVG icons)
    │   │   └── index.ts
    │   ├── molecules/
    │   │   └── index.ts
    │   └── organisms/
    │       ├── PageShell.tsx
    │       └── index.ts
    ├── pages/
    │   ├── OverviewPage.tsx     (S-001)
    │   ├── KeywordsPage.tsx     (S-002)
    │   ├── KeywordDetailPage.tsx (S-003)
    │   ├── SuggestionsPage.tsx  (S-004)
    │   ├── CompetitorsPage.tsx  (S-005)
    │   ├── ReportsPage.tsx      (S-006)
    │   └── SettingsPage.tsx     (S-007)
    ├── routes/
    │   └── router.tsx
    ├── data/
    │   └── mockData.ts          (14 keywords, 10 suggestions, weekly report)
    ├── layouts/
    └── styles/
        └── tokens.ts            (typography + competitor colors)
```

## Tech Stack

- React 18.3 + TypeScript 5.6
- Vite 6.0
- Tailwind CSS 3.4 (QDS3 semantic tokens mapped)
- React Router 6.28
- Recharts 2.13 (for TrendChart, Sparkline)
- QDS3 Icon stub (303 SVG icons, no external icon library)

## Routes

| Path | Page | Screen |
|---|---|---|
| / | OverviewPage | S-001 |
| /keywords | KeywordsPage | S-002 |
| /keywords/:id | KeywordDetailPage | S-003 |
| /suggestions | SuggestionsPage | S-004 |
| /competitors | CompetitorsPage | S-005 |
| /reports | ReportsPage | S-006 |
| /settings | SettingsPage | S-007 |

## Mock Data

- 14 keywords (7 primary/방어, 7 secondary/확장)
- 10 suggested keywords
- Weekly report with highlights
- Data collection status (sensor-tower, ASC, manual)
