/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
  // @TODO: Расчет выручки от операции
  const discount = 1 - purchase.discount / 100;
  return purchase.sale_price * purchase.quantity * discount;
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
  // @TODO: Расчет бонуса от позиции в рейтинге

  if (seller.profit<0) {return 0}
  else if (index==0) {
    return seller.profit*0.15;
} else if (index==1||index==2) {
    return seller.profit*0.1;
} else if (index==total-1) {
    return 0;
} else { // Для всех остальных
    return seller.profit*0.05;
} 
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
  // @TODO: Проверка входных данных
  if (
    !data ||
    !Array.isArray(data.sellers) ||
    !Array.isArray(data.products) ||
    !Array.isArray(data.purchase_records)||
    data.sellers.length === 0||
    data.products.length === 0||
    data.purchase_records.length === 0
  ) {
    throw new Error("Некорректные входные данные");
  }
  // @TODO: Проверка наличия опций
  if (typeof options !== "object" || options === null) {
    throw new Error("Опции должны быть объектами");
  }
  const { calculateRevenue, calculateBonus } = options;
  if (typeof calculateRevenue !== "function") {
    throw new Error("calculateRevenue должна быть функцией");
  }
  if (typeof calculateBonus !== "function") {
    throw new Error("calculateBonus должна быть функцией");
  }

  // @TODO: Подготовка промежуточных данных для сбора статистики
  const sellerStats = data.sellers.map((seller) => ({
    id: seller.id,
    name: `${seller.first_name} ${seller.last_name}`,
    revenue: 0,
    profit: 0,
    sales_count: 0,
    products_sold: {},
  }));
  console.log("Продавцы - ", sellerStats);

  // @TODO: Индексация продавцов и товаров для быстрого доступа
  const sellerIndex = Object.fromEntries(
    sellerStats.map((seller) => [seller.id, seller])
  );
  console.log("Индекс продавцов - ", sellerIndex);
  const productIndex = Object.fromEntries(
    data.products.map((product) => [product.sku, product])
  );
  console.log("Индекс товаров - ", productIndex);

  // @TODO: Расчет выручки и прибыли для каждого продавца
  data.purchase_records.forEach((record) => {
    // Чек
    const seller = sellerIndex[record.seller_id]; // Продавец
    // Увеличить количество продаж
    seller.sales_count++;
    seller.revenue+=record.total_amount;
    // Увеличить общую сумму всех продаж
    console.log(seller);
    console.log(record);
    // Расчёт прибыли для каждого товара
    record.items.forEach((item) => {
      const product = productIndex[item.sku]; // Товар
      // Посчитать себестоимость (cost) товара как product.purchase_price, умноженную на количество товаров из чека
      const cost = product.purchase_price * item.quantity;
      //    console.log(product);
      //     console.log(item);
      //       console.log(cost);
      // Посчитать выручку (revenue) с учётом скидки через функцию calculateRevenue
      const revenue = calculateRevenue(item);
        console.log(revenue);
      // Посчитать прибыль: выручка минус себестоимость
      const profit = revenue - cost;
      //     console.log(profit);
      // Увеличить общую накопленную прибыль (profit) у продавца
      seller.profit+=profit;
      console.log(seller);
      // Учёт количества проданных товаров
      if (!seller.products_sold[item.sku]) {
        seller.products_sold[item.sku] = 0;
      }
      seller.products_sold[item.sku]++;
      // По артикулу товара увеличить его проданное количество у продавца
    });
  });

  // @TODO: Сортировка продавцов по прибыли

  sellerStats.sort((a, b) => b.profit - a.profit);

  console.log(sellerStats);

  // @TODO: Назначение премий на основе ранжирования
sellerStats.forEach((seller, index) => {
         seller.bonus = calculateBonusByProfit(index,sellerStats.length,seller);// Считаем бонус
         console.log(sellerStats);
        // seller.top_products = // Формируем топ-10 товаров
        seller.top_products = Object.entries(seller.products_sold || {})
        .map(([sku, quantity]) => ({"sku": sku,"quantity": quantity}))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);
});
  console.log(sellerStats);

  // @TODO: Подготовка итоговой коллекции с нужными полями
return sellerStats.map(seller => ({
    seller_id: seller.id,                    
    name: seller.name,                         
    revenue: +seller.revenue.toFixed(2),     
    profit: +seller.profit.toFixed(2),       
    sales_count: seller.sales_count,         
    top_products: seller.top_products,       
    bonus: +seller.bonus.toFixed(2)          
}));
}
