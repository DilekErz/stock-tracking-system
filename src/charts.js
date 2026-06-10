let latestRequestId = 0;
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://stock-tracking-system-3myv.onrender.com";

async function getLLMAnalysis(data) {
  const llmElement = document.getElementById("llmAnalysis");

  if (llmElement) {
    llmElement.textContent = "AI analysis is loading...";
  }

  try {
    const response = await fetch(`${API_URL}/api/llm/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "LLM request failed");
    }

    if (llmElement) {
      llmElement.textContent = result.analysis;
    }

  } catch (error) {
    console.error("LLM analysis error:", error);

    if (llmElement) {
      llmElement.textContent =
        "AI analysis is temporarily unavailable. Market data and technical indicators are still displayed.";
    }
  }
}

import Papa from 'papaparse';
import ApexCharts from 'apexcharts';

let priceChart = null;
let rsiChart = null;
let macdChart = null;
const marketDataCache = new Map();// apı key e tekrar aynı veri için istek atmasın(dilekerz)
const pendingRequests = new Map();

export async function renderPriceChart(selectedAsset = "USD_TRY", selectedRange = "1M") {
 const requestId = ++latestRequestId;
 console.log("renderPriceChart çalıştı");
  console.log("Seçilen asset:", selectedAsset);
  console.log("Seçilen range:", selectedRange);

    const chartElement = document.querySelector("#main-price-chart");
    if (!chartElement) return;
    console.log("chart elementi:", chartElement);

    // 1. CSV Dosyasını Oku
    //Dosya bulunuyor mu,CSV boş mu,gerçekten veri geliyor mu

// const response = await fetch(`${API_URL}/api/test-market?symbol=${selectedAsset}&range=${selectedRange}`);
// const data = await response.json();
const cacheKey = `${selectedAsset}-${selectedRange}`;

const yahooAssets = [
  "BIST100",
  "BIST30",
  "SP500",
  "NASDAQ100",
  "DJI",
  "DOW",
  "DAX",
  "CAC40",
  "FTSE100",
  "NIKKEI225",
  "HSI",
  "US10YT",
  "TR10YT",
  "Silver",
  "Brent",
"NaturalGas",
"Copper"

];

let endpoint;

if (selectedAsset === "HKD_TRY") {
  endpoint = "/api/hkd-try";
} else if (yahooAssets.includes(selectedAsset)) {
  endpoint = "/api/yahoo-market";
} else {
  endpoint = "/api/test-market";
}
  let data;

if (marketDataCache.has(cacheKey)) {
  console.log("Cache kullanıldı:", cacheKey);
  data = marketDataCache.get(cacheKey);
} else if (pendingRequests.has(cacheKey)) {
  console.log("Devam eden istek bekleniyor:", cacheKey);
  data = await pendingRequests.get(cacheKey);
} else {
  console.log("Kullanılan endpoint:", endpoint);
  console.log("API isteği atıldı:", cacheKey);

 const requestPromise = fetch(
  `${API_URL}${endpoint}?symbol=${selectedAsset}&range=${selectedRange}`
)
    .then(response => response.json())
    .finally(() => {
      pendingRequests.delete(cacheKey);
    });

  pendingRequests.set(cacheKey, requestPromise);

  data = await requestPromise;

  if (data.status !== "error" && data.values) {
    marketDataCache.set(cacheKey, data);
  }
}

if (requestId !== latestRequestId) return;

console.log("Seçilen asset:", selectedAsset);
console.log("API verisi:", data);
console.log("API symbol:", data.meta?.symbol);

if (data.status === "error" || !data.values) {
   if (requestId !== latestRequestId) return;

  console.error("API hata verdi:", data);

  const priceElement = document.querySelector(".price");
    const changeElement = document.querySelector(".change");

  // if (priceElement) priceElement.innerText = "N/A";
  //  if (changeElement) changeElement.textContent = "N/A";

  return;
}

const assetData = data.values;

    //BUNU SONRA TEKRARDAN YORUM SATIRINıDAN KALDIRACAM:

    // const response = await fetch(`${import.meta.env.BASE_URL}Global.csv`);
    // console.log("fetch response:", response);
    // const csvText = await response.text();
    // console.log("csv text ilk 300 karakter:", csvText.slice(0, 300));


    // const { data } = Papa.parse(csvText, {
    //     header: true,
    //     dynamicTyping: true,
    //     skipEmptyLines: true
    // });
// console.log("parse edilmiş ilk 5 satır:", data.slice(0, 5));
// console.log("ilk satır kolonları:", Object.keys(data[0] || {}));
// console.log(
//   "Tüm Metric değerleri:",
//   [...new Set(data.map(row => String(row.Metric).trim()))]
// );


    // 2. Veriyi Filtrele (Sadece BIST100 grafiği çizelim)
    // Not: Global.csv'de hangi varlığı görmek istiyorsan 'BIST100' yerine onu yazabilirsin.
    // const assetData = data.filter(row => row.Metric === selectedAsset);

//     const assetData = data.filter(row =>
//   String(row.Metric).trim().toUpperCase() ===
//   String(selectedAsset).trim().toUpperCase()
// );
console.log(`${selectedAsset} filtre sonucu:`, assetData);
console.log(`${selectedAsset} satır sayısı:`, assetData.length);
//console.log("Metric örnekleri:", data.map(row => row.Metric).slice(0, 20));


    // 3. Veriyi ApexCharts'ın istediği Mum Grafiği formatına sok
    // Format: { x: Tarih, y: [Açılış, Yüksek, Düşük, Kapanış] }
//     const chartSeries = assetData.map(row => {
//         const open = Number(row.Open);
//         const high = Number(row.High);
//         const low = Number(row.Low);
//          const change = Number(row.Change) || 0 ;
//         const close = open + (open * (change / 100)); // Kapanışı Change yüzdesinden hesaplıyoruz

// console.log("tek satır kontrol:", {
//         date: row.Date,
//         open,
//         high,
//         low,
//         change: row.Change,
//         close,
//         time: new Date(row.Date).getTime()
//     });

//         return {
//             x: new Date(row.Date).getTime(),
//             y: [Number(open.toFixed(2)),
//       Number(high.toFixed(2)),
//       Number(low.toFixed(2)),
//       Number(close.toFixed(2))]
//         };
//     }).sort((a, b) => a.x - b.x); // Tarihe göre sırala

const chartSeries = assetData
  // .map(row => {
  //   const dateValue = row.date ?? row.Date;
  //   const openValue = row.open ?? row.Open;

  //   return {
  //     x: new Date(dateValue).getTime(),
  //     y: Number(openValue)
  //   };
.map(row => {
    return {
      x: new Date(row.datetime).getTime(),
      y: Number(row.close)
    };

  })
  .filter(point => !isNaN(point.y) && !isNaN(point.x))
  .sort((a, b) => a.x - b.x);

 console.log("chartSeries:", chartSeries);
    console.log("chartSeries uzunluğu:", chartSeries.length);

  //   const visibleSeries =
  // selectedRange === "1W"
  //   ? chartSeries.slice(-7)
  //   : chartSeries;
  const visibleCountMap = {
  "1D": 24,
  "1W": 7,
  "1M": 30,
  "3M": 90,
  "6M": 180,
  "1Y": 365
};

const visibleSeries =
  selectedRange in visibleCountMap
    ? chartSeries.slice(-visibleCountMap[selectedRange])
    : chartSeries;

    if (requestId !== latestRequestId) return;

    if (!chartSeries.length) {
  console.error("Grafik verisi boş");

  // const priceElement = document.querySelector(".price");
  // const changeElement = document.querySelector(".change");

  // if (priceElement) priceElement.innerText = "N/A";
  // if (changeElement) changeElement.textContent = "N/A";

  return;
}

    // 4. Grafik Ayarları (Senin tasarımına uyumlu koyu tema)
    const options = {
        series: [{
          name: selectedAsset,
            data: visibleSeries
        }],
        chart: {
            type: 'line',
            height: '100%',
            background: 'transparent',
            toolbar: { show: false },
            parentHeightOffset: 0
        },
        stroke: {
    curve: "straight",
    width: 4
  },

  markers: {
    size: 3
  },
        theme: { mode: 'dark' },

        xaxis: {
    type: "datetime",

    labels: {
      offsetY: 0,
      show: true,
      datetimeUTC: false,
      style: {
        colors: "#8e8da4"
      },
      formatter: function (value, timestamp) {
        const date = new Date(timestamp);

        if (selectedRange === "1D") {
          return date.toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit"
          });
        }

        return date.toLocaleDateString("tr-TR", {
          day: "2-digit",
          month: "short"
        });
      }
    }
  },
        yaxis: {
            tooltip: { enabled: true },
            labels: { style: { colors: '#8e8da4' } },
             min: function (min) {
      return min - Math.abs(min * 0.001);
    },
    max: function (max) {
      return max + Math.abs(max * 0.001);
    }
  
        },
        tooltip: {
    x: {
      formatter: function (value) {
        const date = new Date(value);

        if (selectedRange === "1D") {
          return date.toLocaleString("tr-TR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
          });
        }

        return date.toLocaleDateString("tr-TR", {
          day: "2-digit",
          month: "short",
          year: "numeric"
        });
      }
    }
  },
  
        // plotOptions: {
        //     candlestick: {
        //         colors: {
        //             upward: '#26a69a',   // Yeşil mum
        //             downward: '#ef5350'  // Kırmızı mum
        //         }
        //     }
        // },
        grid: { borderColor: '#333' ,
           padding: {
      left: 20,
      right: 25,
      top: 20,
      bottom: 40
    }
        }
    };

    // 5. Grafiği Çiz
    // const chart = new ApexCharts(chartElement, options);
    // chart.render();
   if (requestId !== latestRequestId) return;
    if (priceChart) {
  priceChart.destroy();
}

priceChart = new ApexCharts(chartElement, options);
await priceChart.render();
await renderRSIChart(chartSeries, selectedRange);
await renderMACDChart(chartSeries);
updateInfoBoxes(assetData, visibleSeries);


    // 6. Üstteki Statik Fiyatı Güncelle
    //const lastPrice = chartSeries[chartSeries.length - 1].y[3];
    //document.querySelector(".price").innerText = lastPrice.toLocaleString();


// const lastCandle = chartSeries[chartSeries.length - 1];
//rsı için chartSeries yerine visibleSeries kullanıldı(dilekerz)
const lastCandle = visibleSeries[visibleSeries.length - 1];
// const lastPrice = lastCandle ? lastCandle.y[3] : null;
const lastPrice = lastCandle ? lastCandle.y : null;

    const priceElement = document.querySelector(".price");
    console.log("price elementi:", priceElement);

    if (priceElement && lastPrice !== null) {
  priceElement.innerText = Number(lastPrice).toLocaleString();
}
const firstCandle = visibleSeries[0];
const firstPrice = firstCandle ? firstCandle.y : null;

//LLM İÇİN EKLENDİ
const rsiData = calculateRSI(chartSeries, 14);
const latestRsi =
  rsiData.length > 0
    ? rsiData[rsiData.length - 1].y
    : null;

const macdData =
  calculateMACD(chartSeries);

const latestMacd =
  macdData.macdLine.length > 0
    ? macdData.macdLine[
        macdData.macdLine.length - 1
      ].y
    : null;

await getLLMAnalysis({
  symbol: selectedAsset,
  lowPrice: Math.min(
    ...visibleSeries.map(x => x.y)
  ),
  highPrice: Math.max(
    ...visibleSeries.map(x => x.y)
  ),
  lastPrice,
  rsi14: latestRsi,
  macd: latestMacd,
  prediction: null
});

const changeElement = document.querySelector(".change");

if (
  changeElement &&
  firstPrice !== null &&
  lastPrice !== null &&
  firstPrice !== 0
) {
  const changePercent =
    ((lastPrice - firstPrice) / firstPrice) * 100;

  const sign = changePercent >= 0 ? "+" : "";
  const arrow = changePercent >= 0 ? "▲" : "▼";

  changeElement.textContent =
    `${sign}${changePercent.toFixed(2)}% ${arrow}`;

  changeElement.classList.remove("positive", "negative");
  changeElement.classList.add(
    changePercent >= 0 ? "positive" : "negative"
  );
}
}
function calculateRSI(data, period = 14) {
  const result = [];

  for (let i = period; i < data.length; i++) {
    let gains = 0;
    let losses = 0;

    for (let j = i - period + 1; j <= i; j++) {
      const change = data[j].y - data[j - 1].y;

      if (change >= 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);

    result.push({
      x: data[i].x,
      y: Number(rsi.toFixed(2))
    });
  }

  return result;
}

function calculateEMA(values, period) {
  const multiplier = 2 / (period + 1);
  const ema = [];

  values.forEach((item, index) => {
    if (index === 0) {
      ema.push({ x: item.x, y: item.y });
    } else {
      const prevEma = ema[index - 1].y;
      const newEma = (item.y - prevEma) * multiplier + prevEma;

      ema.push({
        x: item.x,
        y: Number(newEma.toFixed(4))
      });
    }
  });

  return ema;
}

function calculateMACD(data) {
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);

  const macdLine = data.map((item, index) => ({
    x: item.x,
    y: Number((ema12[index].y - ema26[index].y).toFixed(4))
  }));

  const signalLine = calculateEMA(macdLine, 9);

  const histogram = macdLine.map((item, index) => ({
    x: item.x,
    y: Number((item.y - signalLine[index].y).toFixed(4))
  }));
  //hesaplıyor mu öğrenmek için ekledim (dilekerz)
// console.log("MACD:", macdLine);
// console.log("Signal:", signalLine);
// console.log("Histogram:", histogram);
  return {
    macdLine,
    signalLine,
    histogram
  };
}
async function renderRSIChart(chartSeries, selectedRange) {
  const rsiElement = document.querySelector("#rsi-chart");
  if (!rsiElement) return;

  const rsiData = calculateRSI(chartSeries, 14);

  const visibleRsiData =
    selectedRange === "1W"
      ? rsiData.slice(-7)
      : rsiData;

       console.log("RSI Length:", rsiData.length);
  console.log("Visible RSI Length:", visibleRsiData.length);
  console.log("Range:", selectedRange); //kontrol verileri(rsı(1w)=rsı(1m) aynı mı geliyor(dilekerz))

  if (rsiChart) {
    rsiChart.destroy();
  }

  const options = {
    series: [
      {
        name: "RSI",
        data: visibleRsiData
      }
    ],
    chart: {
      type: "area",
      height: "100%",
      background: "transparent",
      toolbar: { show: false },
      parentHeightOffset: 0
    },
     dataLabels: {
    enabled: false
  },
    stroke: {
      curve: "smooth",
      width: 3
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.6,
        opacityTo: 0.05
      }
    },
    theme: { mode: "dark" },
    xaxis: {
      type: "datetime",
      labels: {
        style: { colors: "#8e8da4" }
      }
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 4,
      labels: {
        style: { colors: "#8e8da4" }
      }
    },
    grid: {
      borderColor: "#1e2b45",
      padding: {
        left: 20,
        right: 25,
        top: 10,
        bottom: 20
      }
    },
    annotations: {
      yaxis: [
        {
          y: 70,
          borderColor: "#666"
        },
        {
          y: 30,
          borderColor: "#666"
        }
      ]
    }
  };

  rsiChart = new ApexCharts(rsiElement, options);
  await rsiChart.render();
}
async function renderMACDChart(chartSeries) {
  const macdElement = document.querySelector("#macd-chart");
  if (!macdElement) return;

  const macdData = calculateMACD(chartSeries);

  if (macdChart) {
    macdChart.destroy();
  }

  const options = {
    series: [
      {
        name: "Histogram",
       type: "bar",
        data: macdData.histogram.map(point => ({
         x: point.x,
        y: point.y,
         fillColor: point.y >= 0 ? "#22c55e" : "#ef4444"
  }))
      },
      {
        name: "MACD",
        type: "line",
        data: macdData.macdLine
      },
      {
        name: "Signal",
        type: "line",
        data: macdData.signalLine
      }
    ],
    chart: {
      height: "100%",
      type: "line",
      background: "transparent",
      toolbar: { show: false },
      parentHeightOffset: 0
    },
    stroke: {
      width: [0, 3, 3],
      curve: "smooth"
    },
    plotOptions: {
  bar: {
    columnWidth: "45%",
    distributed: false
  }
},
    theme: { mode: "dark" },
    xaxis: {
      type: "datetime",
      labels: {
        style: { colors: "#8e8da4" }
      }
    },
    yaxis: {
      labels: {
        style: { colors: "#8e8da4" }
      }
    },
    grid: {
      borderColor: "#1e2b45",
      padding: {
        left: 20,
        right: 25,
        top: 10,
        bottom: 20
      }
    },
    legend: {
      show: false
    }
  };

  macdChart = new ApexCharts(macdElement, options);
  await macdChart.render();
}
function updateInfoBoxes(assetData, visibleSeries) {
  const volumeBox = document.querySelector("#volumeBox");
  const highLowBox = document.querySelector("#highLowBox");
  const priceRangeBox = document.querySelector("#priceRangeBox");
  const volatilityBox = document.querySelector("#volatilityBox");

  if (!visibleSeries.length) return;

  const prices = visibleSeries.map(point => point.y);

  const high = Math.max(...prices);
  const low = Math.min(...prices);
  const range = high - low;

  const avgPrice =
    prices.reduce((sum, price) => sum + price, 0) / prices.length;

  const volatility =
    avgPrice !== 0 ? (range / avgPrice) * 100 : 0;

  const totalVolume = assetData.reduce((sum, row) => {
    const volume = Number(row.volume);
    return sum + (isNaN(volume) ? 0 : volume);
  }, 0);

  // if (volumeBox) {
  //   volumeBox.textContent =
  //     totalVolume > 0
  //       ? `Volume ${totalVolume.toLocaleString()}`
  //       : "Volume N/A";
  // }

  // if (highLowBox) {
  //   highLowBox.textContent =
  //     `High / Low ${high.toFixed(3)} / ${low.toFixed(3)}`;
  // }

  // if (priceRangeBox) {
  //   priceRangeBox.textContent =
  //     `Range ${range.toFixed(3)}`;
  // }

  // if (volatilityBox) {
  //   volatilityBox.textContent =
  //     `Volatility ${volatility.toFixed(2)}%`;
  // }

  const lang = localStorage.getItem("language") || "tr";

const labels = {
  tr: {
    volume: "Hacim",
    volumeNA: "Hacim N/A",
    highLow: "En Yüksek / En Düşük",
    range: "Fiyat Aralığı",
    volatility: "Volatilite"
  },
  en: {
    volume: "Volume",
    volumeNA: "Volume N/A",
    highLow: "High / Low",
    range: "Range",
    volatility: "Volatility"
  }
};

const t = labels[lang];

if (volumeBox) {
  volumeBox.textContent =
    totalVolume > 0
      ? `${t.volume} ${totalVolume.toLocaleString()}`
      : t.volumeNA;
}

if (highLowBox) {
  highLowBox.textContent =
    `${t.highLow} ${high.toFixed(3)} / ${low.toFixed(3)}`;
}

if (priceRangeBox) {
  priceRangeBox.textContent =
    `${t.range} ${range.toFixed(3)}`;
}

if (volatilityBox) {
  volatilityBox.textContent =
    `${t.volatility} ${volatility.toFixed(2)}%`;
}
}
// Sayfa yüklendiğinde çalıştır
//renderPriceChart();
