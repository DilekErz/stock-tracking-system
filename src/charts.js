let latestRequestId = 0;
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://stock-tracking-system-3myv.onrender.com";
import Papa from 'papaparse';
import ApexCharts from 'apexcharts';

let priceChart = null;

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

const response = await fetch(`${API_URL}/api/test-market?symbol=${selectedAsset}&range=${selectedRange}`);
const data = await response.json();
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
            data: chartSeries
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


    // 6. Üstteki Statik Fiyatı Güncelle
    //const lastPrice = chartSeries[chartSeries.length - 1].y[3];
    //document.querySelector(".price").innerText = lastPrice.toLocaleString();


const lastCandle = chartSeries[chartSeries.length - 1];
// const lastPrice = lastCandle ? lastCandle.y[3] : null;
const lastPrice = lastCandle ? lastCandle.y : null;

    const priceElement = document.querySelector(".price");
    console.log("price elementi:", priceElement);

    if (priceElement && lastPrice !== null) {
  priceElement.innerText = Number(lastPrice).toLocaleString();
}
const firstCandle = chartSeries[0];
const firstPrice = firstCandle ? firstCandle.y : null;

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

// Sayfa yüklendiğinde çalıştır
//renderPriceChart();
