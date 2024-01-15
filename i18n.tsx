/**
 * The i18n instance for internationalization.
 * @external i18n
 * @see {@link https://www.i18next.com/} for more information about i18next.
 */

/**
 * The backend for i18next, used to load translation files from the server.
 * @external Backend
 * @see {@link https://github.com/i18next/i18next-fs-backend} for more information about i18next-fs-backend.
 */

/**
 * The initReactI18next function to initialize i18next for React applications.
 * @external initReactI18next
 * @see {@link https://react.i18next.com/} for more information about react-i18next.
 */

import i18n from "i18next";
import fs from 'fs';
import Backend from "i18next-fs-backend";
import { initReactI18next } from "react-i18next";

let path = ""
if (fs.existsSync("./build/")) {
  path = "./build/public/i18n/{{lng}}.json";
} else if (fs.existsSync("./build-dev/")) {
  path = "./build-dev/public/i18n/{{lng}}.json";
}

i18n
.use(Backend)
.use(initReactI18next)
.init({
  backend: {
    // The translation files directory path on the server
    loadPath: path,
  },
  debug: true,
  fallbackLng: "fi",
  saveMissing: true,
  interpolation: {
    escapeValue: false,
  },
})
.catch(error => console.error('Error initializing i18next:', error));

export default i18n;
