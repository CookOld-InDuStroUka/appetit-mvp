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
      analytics: "Аналитика",
      allBranches: "Все филиалы",
      branch: "Филиал",
      expenses: "Расходы",
      profit: "Прибыль",
      saveReport: "Сохранить отчёт",
      savedReports: "Сохранённые отчёты",
      combo: "Комбо",
      dishes: "Блюда",
      snacks: "Закуски",
      sauces: "Соусы",
      drinks: "Напитки",
    },
    kz: {
      tagline: "дәмді шаурма",
      search: "Іздеу",
      searchBtn: "Іздеу",
      contacts: "Контактілер",
      orders: "Тапсырыстар",
      login: "Кіру",
      analytics: "Аналитика",
      allBranches: "Барлық филиалдар",
      branch: "Филиал",
      expenses: "Шығындар",
      profit: "Пайда",
      saveReport: "Есепті сақтау",
      savedReports: "Сақталған есептер",
      combo: "Комбо",
      dishes: "Тағамдар",
      snacks: "Тіскебасар",
      sauces: "Тұздықтар",
      drinks: "Сусындар",
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
