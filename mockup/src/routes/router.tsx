import { createBrowserRouter } from "react-router-dom";
import App from "@/App";
import OverviewPage from "@/pages/OverviewPage";
import KeywordsPage from "@/pages/KeywordsPage";
import KeywordDetailPage from "@/pages/KeywordDetailPage";
import SuggestionsPage from "@/pages/SuggestionsPage";

import ReportsPage from "@/pages/ReportsPage";
import SettingsPage from "@/pages/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: "keywords", element: <KeywordsPage /> },
      { path: "keywords/:id", element: <KeywordDetailPage /> },
      { path: "suggestions", element: <SuggestionsPage /> },

      { path: "reports", element: <ReportsPage /> },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
