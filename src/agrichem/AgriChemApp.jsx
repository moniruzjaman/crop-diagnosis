import "./index.css";
import { LanguageProvider } from "./context/LanguageContext";
import AgriChemAppInner from "./App";

/**
 * AgriChem Guide & Pest Control Database — embedded as a separate tab
 * inside the উদ্ভিদ গোয়েন্দা (Plant Detective) app.
 * Wraps the standalone AgriChem app in its LanguageProvider (bn/en).
 */
export default function AgriChemApp() {
  return (
    <LanguageProvider>
      <AgriChemAppInner />
    </LanguageProvider>
  );
}
