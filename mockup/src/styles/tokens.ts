// Design tokens from foundation.md — QDS3 based

export const colors = {
  key: {
    background1: "#ed5000",
    background2: "#fef1eb",
    foreground1: "#fef1eb",
    foreground2: "#ed5000",
  },
  interactive: {
    background1: "#0785f2",
    foreground2: "#0785f2",
  },
  negative: {
    background1: "#fb2d36",
    background2: "#ffeeef",
    foreground2: "#fb2d36",
  },
  success: {
    background1: "#0d9974",
    background2: "#ecf7f4",
    foreground2: "#0d9974",
  },
  notice: {
    background1: "#ffcc00",
    background2: "#fffbeb",
  },
} as const;

export const typography = {
  largeTitle: "text-[28px] font-bold leading-[36px]",
  title1: "text-[24px] font-bold leading-[32px]",
  title2: "text-[20px] font-bold leading-[28px]",
  headline: "text-[16px] font-semibold leading-[24px]",
  headlineStrong: "text-[16px] font-bold leading-[24px]",
  body: "text-[16px] font-normal leading-[24px]",
  bodyStrong: "text-[16px] font-semibold leading-[24px]",
  subheadline: "text-[14px] font-normal leading-[20px]",
  subheadlineStrong: "text-[14px] font-semibold leading-[20px]",
  footnote: "text-[13px] font-normal leading-[18px]",
  footnoteStrong: "text-[13px] font-semibold leading-[18px]",
  caption1: "text-[12px] font-normal leading-[16px]",
  caption1Strong: "text-[12px] font-semibold leading-[16px]",
  caption2: "text-[11px] font-medium leading-[16px]",
  caption2Strong: "text-[11px] font-semibold leading-[16px]",
} as const;

