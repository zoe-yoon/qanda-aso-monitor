import { createContext, useContext, useState, type ReactNode } from "react";

export type OS = "ios" | "android";

interface OSContextValue {
  os: OS;
  setOS: (os: OS) => void;
}

const OSContext = createContext<OSContextValue>({ os: "ios", setOS: () => {} });

export function OSProvider({ children }: { children: ReactNode }) {
  const [os, setOS] = useState<OS>("ios");
  return (
    <OSContext.Provider value={{ os, setOS }}>
      {children}
    </OSContext.Provider>
  );
}

export function useOS() {
  return useContext(OSContext);
}
