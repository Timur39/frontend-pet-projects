document.addEventListener("DOMContentLoaded", () => {
  // Переключение темы
  const toggleBtn = document.querySelector("#theme-toggle");
  toggleBtn?.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
  });

  const amountInput = document.querySelector("#amount-input");
  const fromCurrency = document.querySelector("#from-currency");
  const toCurrency = document.querySelector("#to-currency");
  const resultOutput = document.querySelector("#result-output");
  const rateText = document.querySelector("#rate");

  // Обновить результат при вводе
  const updateConverter = async () => {
    const rate = await convertCurrency(fromCurrency.value, toCurrency.value);
    const amount = parseFloat(amountInput.value) || 0;
    resultOutput.value = (rate * amount).toFixed(2);
    rateText.textContent = `1 ${fromCurrency.value} = ${rate.toFixed(4)} ${
      toCurrency.value
    }`;
  };
  amountInput.addEventListener("input", updateConverter);
  fromCurrency.addEventListener("change", updateConverter);
  toCurrency.addEventListener("change", updateConverter);

  // Автообновление курсов
  const currencyPairs = [
    { from: "USD", to: "EUR" },
    { from: "USD", to: "RUB" },
    { from: "EUR", to: "GBP" },
    { from: "USD", to: "JPY" },
  ];

  setInterval(async () => {
    for (const pair of currencyPairs) {
      const rate = await convertCurrency(pair.from, pair.to);
      const element = document.querySelector(`#${pair.from}-${pair.to}`);
      if (element) {
        element.textContent = rate.toFixed(4);
      }
    }
  }, 5000);

  // Перевернуть валюты
  const reverseBtn = document.querySelector("#reverse-btn");

  reverseBtn?.addEventListener("click", () => {
    const temp = fromCurrency.value;
    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;

    updateConverter(); // обновить после смены
  });
});

async function convertCurrency(fromCurrency = "USD", toCurrency = "RUB") {
  const cacheKey = `rate_${fromCurrency}_${toCurrency}`;
  const now = Date.now();

  // Проверка localStorage
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const { rate, timestamp } = JSON.parse(cached);
    if (now - timestamp < 10 * 60 * 1000) {
      return rate;
    }
  }

  const url = `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const rate = data.rates[toCurrency];

    // Сохраняем в localStorage
    localStorage.setItem(cacheKey, JSON.stringify({ rate, timestamp: now }));

    return rate;
  } catch (error) {
    console.error(`Ошибка при загрузке данных: ${error.message}`);
  }
}
