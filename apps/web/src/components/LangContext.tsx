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
      deliveryAddresses: "Адреса и зоны доставки",
      reviews: "Отзывы",
      promotions: "Акции",
      deliveryPayment: "Доставка и оплата",
      bonusProgram: "Бонусная программа",
      vacancies: "Вакансии",
      reportBug: "Сообщить об ошибке",
      promoAppLine: "Акции, скидки, кэшбэк − в нашем приложении!",
      appStore: "App Store",
      googlePlay: "Google Play",
      company: "ИП Таубекова Б.К.",
      privacyPolicy: "Политика конфиденциальности",
      publicOffer: "Публичная оферта",
      admin: "Админ",
      promoPlaceholder: "Промокод",
      apply: "Применить",
      promoInfo: "Промокоды могут действовать не во всех филиалах.",
      useBonus: "Списать бонусы",
      total: "Итого",
      discount: "Скидка",
      bonusUsed: "Списано бонусов",
      bonusEarn: "Начислим бонусов",
      toPay: "К оплате",
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
      deliveryAddresses: "Жеткізу мекенжайлары мен аймақтары",
      reviews: "Пікірлер",
      promotions: "Науқандар",
      deliveryPayment: "Жеткізу және төлем",
      bonusProgram: "Бонус бағдарламасы",
      vacancies: "Вакансиялар",
      reportBug: "Қате туралы хабарлау",
      promoAppLine: "Акциялар, жеңілдіктер, кэшбэк — біздің қосымшада!",
      appStore: "App Store",
      googlePlay: "Google Play",
      company: "ЖК Таубекова Б.К.",
      privacyPolicy: "Құпиялық саясаты",
      publicOffer: "Жария оферта",
      admin: "Әкімші",
      promoPlaceholder: "Промокод",
      apply: "Қолдану",
      promoInfo: "Промокодтар барлық филиалдарға жарамайды.",
      useBonus: "Бонусты пайдалану",
      total: "Барлығы",
      discount: "Жеңілдік",
      bonusUsed: "Жиналған бонус",
      bonusEarn: "Жиналатын бонус",
      toPay: "Төлеу",
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
