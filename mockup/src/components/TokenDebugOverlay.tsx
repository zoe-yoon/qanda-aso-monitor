import { useEffect, useState, useRef } from "react";

const TOKEN_PATTERNS: Record<
  string,
  { regex: RegExp; label: string; color: string }[]
> = {
  color: [
    { regex: /\bbg-(\S+)/, label: "배경", color: "#3b82f6" },
    { regex: /\bborder-(\S+)/, label: "테두리", color: "#f59e0b" },
  ],
  typography: [
    { regex: /\bQDS3_(\S+)/, label: "타이포", color: "#06b6d4" },
    { regex: /\bfont-(sans|serif|mono)/, label: "서체", color: "#06b6d4" },
    {
      regex:
        /\bfont-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)/,
      label: "굵기",
      color: "#06b6d4",
    },
    { regex: /\bleading-(\S+)/, label: "행간", color: "#06b6d4" },
  ],
  spacing: [
    { regex: /\bp([xytrbl]?)-(\S+)/, label: "패딩", color: "#10b981" },
    { regex: /\bm([xytrbl]?)-(\S+)/, label: "마진", color: "#10b981" },
    { regex: /\bgap-(\S+)/, label: "갭", color: "#10b981" },
  ],
  shape: [
    { regex: /\brounded-(\S+)/, label: "라운드", color: "#f472b6" },
    { regex: /\brounded\b/, label: "라운드", color: "#f472b6" },
  ],
};

const TYPO_PROPS = new Set([
  "font-size",
  "line-height",
  "font-weight",
  "letter-spacing",
]);
const COLOR_PROPS = new Set(["color"]);

const textClassCache = new Map<
  string,
  { typography: boolean; color: boolean }
>();
function inspectTextClass(cls: string): {
  typography: boolean;
  color: boolean;
} {
  if (textClassCache.has(cls)) return textClassCache.get(cls)!;

  const result = { typography: false, color: false };
  const selector = `.${CSS.escape(cls)}`;

  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (!(rule instanceof CSSStyleRule)) continue;
        if (!rule.selectorText.includes(selector)) continue;
        const s = rule.style;
        for (let i = 0; i < s.length; i++) {
          const prop = s.item(i);
          if (TYPO_PROPS.has(prop)) result.typography = true;
          if (COLOR_PROPS.has(prop) || prop.startsWith("--tw-text"))
            result.color = true;
        }
      }
    } catch {
      /* cross-origin sheets */
    }
  }

  textClassCache.set(cls, result);
  return result;
}

function getTokenBadges(
  el: Element,
): { label: string; value: string; color: string }[] {
  const classes = el.className;
  if (typeof classes !== "string") return [];

  const badges: { label: string; value: string; color: string }[] = [];

  for (const group of Object.values(TOKEN_PATTERNS)) {
    for (const { regex, label, color } of group) {
      const globalRegex = new RegExp(regex.source, "g");
      let match;
      while ((match = globalRegex.exec(classes)) !== null) {
        badges.push({ label, value: match[0], color });
      }
    }
  }

  const textRegex = /\btext-(\S+)/g;
  let tm;
  while ((tm = textRegex.exec(classes)) !== null) {
    const { typography, color } = inspectTextClass(tm[0]);
    if (typography)
      badges.push({ label: "크기", value: tm[0], color: "#06b6d4" });
    if (color) badges.push({ label: "글자색", value: tm[0], color: "#8b5cf6" });
    if (!typography && !color)
      badges.push({ label: "text", value: tm[0], color: "#94a3b8" });
  }

  const style = el.getAttribute("style");
  if (style) {
    const hardcoded: string[] = [];
    if (/#[0-9a-fA-F]{3,8}/.test(style)) hardcoded.push("hex color");
    if (/\d+px/.test(style)) hardcoded.push("px value");
    if (/rgb/.test(style)) hardcoded.push("rgb color");
    if (hardcoded.length > 0) {
      badges.push({
        label: "HARDCODED",
        value: hardcoded.join(", "),
        color: "#ef4444",
      });
    }
  }

  return badges;
}

export function TokenDebugOverlay() {
  const [active, setActive] = useState(false);
  const [hover, setHover] = useState<{
    rect: DOMRect;
    tokens: { label: string; value: string; color: string }[];
  } | null>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyD") {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        setActive((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!active) {
      setHover(null);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (!el || el.closest("[data-token-debug]")) {
        setHover(null);
        return;
      }

      let current: Element | null = el;
      while (current) {
        if (current.closest("[data-token-debug]")) break;
        const tokens = getTokenBadges(current);
        if (tokens.length > 0) {
          setHover({ rect: current.getBoundingClientRect(), tokens });
          return;
        }
        current = current.parentElement;
      }
      setHover(null);
    };

    document.addEventListener("mousemove", handleMouseMove, true);
    return () =>
      document.removeEventListener("mousemove", handleMouseMove, true);
  }, [active]);

  if (!active) {
    return (
      <div
        data-token-debug
        style={{
          position: "fixed",
          bottom: 12,
          left: 12,
          background: "#1e293b",
          color: "#94a3b8",
          padding: "4px 10px",
          borderRadius: 6,
          fontSize: 12,
          zIndex: 99998,
          pointerEvents: "none",
          fontFamily: "monospace",
        }}
      >
        Press D to inspect tokens
      </div>
    );
  }

  return (
    <div
      data-token-debug
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99998,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "fixed",
          bottom: 12,
          left: 12,
          background: "#3b82f6",
          color: "#fff",
          padding: "4px 10px",
          borderRadius: 6,
          fontSize: 12,
          fontFamily: "monospace",
        }}
      >
        TOKEN DEBUG ON (D to hide)
      </div>

      {hover && (
        <>
          <div
            ref={highlightRef}
            style={{
              position: "fixed",
              left: hover.rect.left - 2,
              top: hover.rect.top - 2,
              width: hover.rect.width + 4,
              height: hover.rect.height + 4,
              border: "2px solid #3b82f6",
              borderRadius: 4,
              background: "rgba(59, 130, 246, 0.05)",
            }}
          />
          <div
            style={{
              position: "fixed",
              left: Math.max(
                4,
                Math.min(
                  hover.rect.left,
                  window.innerWidth - Math.max(hover.rect.width, 200) - 4,
                ),
              ),
              ...(hover.rect.top > 28
                ? { top: hover.rect.top - 4, transform: "translateY(-100%)" }
                : { top: hover.rect.bottom + 4 }),
              display: "flex",
              gap: 3,
              flexWrap: "wrap",
              maxWidth: Math.max(hover.rect.width, 200),
            }}
          >
            {hover.tokens.map((t, j) => (
              <span
                key={j}
                style={{
                  background: t.color,
                  color: "#fff",
                  fontSize: 10,
                  padding: "2px 6px",
                  borderRadius: 3,
                  whiteSpace: "nowrap",
                  fontFamily: "monospace",
                  lineHeight: "16px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                }}
              >
                <span style={{ opacity: 0.7 }}>{t.label}</span> {t.value}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
