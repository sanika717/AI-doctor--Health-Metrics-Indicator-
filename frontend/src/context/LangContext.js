import React, { createContext, useContext, useState } from 'react';
import { translations } from '../i18n/translations';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(
    localStorage.getItem('health_lang') || 'en'
  );

  const changeLang = (l) => {
    setLang(l);
    localStorage.setItem('health_lang', l);
  };

  const t = (key) => {
    const keys = key.split('.');
    let val = translations[lang];
    for (const k of keys) {
      val = val?.[k];
    }
    // fallback to English
    if (!val) {
      let fallback = translations['en'];
      for (const k of keys) fallback = fallback?.[k];
      return fallback || key;
    }
    return val;
  };

  return (
    <LangContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
