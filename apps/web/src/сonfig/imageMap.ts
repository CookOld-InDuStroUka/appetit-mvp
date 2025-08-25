// src/config/imageMap.ts
// Меняй пути справа на свои имена файлов в /public/dishes.
// Пример: 'combo-dlya-odnogo': '/dishes/my-photo-1.jpg',
export const dishImageMap: Record<string, string> = {
  // КОМБО
  "combo-dlya-odnogo": "/dishes/combo-dlya-odnogo.jpg",
  "combo-dlya-dvoih": "/dishes/combo-dlya-dvoih.jpg",
  "combo-dlya-kompanii": "/dishes/combo-dlya-kompanii.jpg",

  // ШАУРМА
  "firmennaya-srednyaya-shaurma": "/dishes/firmennaya-srednyaya-shaurma.jpg",
  "firmennaya-bolshaya-shaurma": "/dishes/firmennaya-bolshaya-shaurma.jpg",
  "klassicheskaya-srednyaya-shaurma": "/dishes/klassicheskaya-srednyaya-shaurma.jpg",
  "klassicheskaya-bolshaya-shaurma": "/dishes/klassicheskaya-bolshaya-shaurma.jpg",

  // ПРОЧЕЕ
  "doner-s-kuricej": "/dishes/doner-s-kuricej.jpg",
  "hot-dog": "/dishes/hot-dog.jpg",

  // --- добавляй свои id ниже по образцу ---
  // "my-dish-id": "/dishes/my-dish-file.jpg",
};
