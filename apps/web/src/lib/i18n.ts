import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import es from "@/messages/es.json";

export const DEFAULT_LOCALE = "es";

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: { [DEFAULT_LOCALE]: { translation: es } },
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    initAsync: false,
    interpolation: { escapeValue: false },
  });
}

export { i18n };
