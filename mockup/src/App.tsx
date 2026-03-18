import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { PageShell } from "@/components/organisms/PageShell";
import { OSProvider } from "@/contexts/OSContext";
import { Agentation } from "agentation";

export default function App() {
  useEffect(() => {
    const SESSION_KEY = "__agentation_project_/Users/yooni_1/.wizard/output/aso-keyword-monitor/design";
    if (!sessionStorage.getItem(SESSION_KEY)) {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("agentation") || k.includes("annotation"))
        .forEach((k) => localStorage.removeItem(k));
      sessionStorage.setItem(SESSION_KEY, "1");
    }
  }, []);

  return (
    <OSProvider>
      <PageShell>
        <Outlet />
        <Agentation endpoint="http://localhost:4747" sessionId="/Users/yooni_1/.wizard/output/aso-keyword-monitor/design" />
      </PageShell>
    </OSProvider>
  );
}
