import React, { createContext, useContext, useState } from "react";

type Lang = "ru" | "kz";

type LangContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const translations: Record<Lang, Record<string, string>> = {
  ru: {
    tagline: "вкусная шаурма",
    search: "Поиск",
    searchBtn: "Искать",
    contacts: "Контакты",
    orders: "Заказы",
    login: "Войти",
  },
  kz: {
    tagline: "дәмді шаурма",
    search: "Іздеу",
    searchBtn: "Іздеу",
    contacts: "Контактілер",
    orders: "Тапсырыстар",
    login: "Кіру",
  },
};

const LangContext = createContext<LangContextType>({
  lang: "ru",
  setLang: () => {},
  t: (key) => translations.ru[key] ?? key,
});

export const LangProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Lang>("ru");
  const t = (key: string) => translations[lang][key] ?? key;
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
