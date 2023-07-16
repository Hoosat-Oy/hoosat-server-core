import i18n from "i18next";
import Backend from "i18next-node-fs-backend";
import { initReactI18next } from "react-i18next";

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    backend: {
      // The translation files directory path on the server
      loadPath: "./public/i18n/{{lng}}.json",
    },
    debug: true,
    fallbackLng: "fi",
    saveMissing: true,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
