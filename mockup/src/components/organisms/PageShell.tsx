import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useOS } from "@/contexts/OSContext";
import type { OS } from "@/contexts/OSContext";

function OSToggle() {
  const { os, setOS } = useOS();
  const options: { value: OS; label: string }[] = [
    { value: "ios", label: "iOS" },
    { value: "android", label: "Android" },
  ];
  return (
    <div className="flex items-center bg-background-selectable2 rounded-lg p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setOS(opt.value)}
          className={`px-3 py-1 rounded-md text-[13px] font-semibold leading-[18px] cursor-pointer transition-colors
            ${os === opt.value
              ? "bg-background-card text-foreground-primary shadow-sm"
              : "text-foreground-tertiary hover:text-foreground-secondary"
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen-safe flex flex-row bg-background-canvas">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Global OS Toggle Bar */}
        <div className="flex items-center justify-end px-6 py-2 border-b border-stroke-inactive bg-background-canvas">
          <OSToggle />
        </div>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
