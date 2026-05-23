
import Papa from 'papaparse';
import ApexCharts from 'apexcharts';

let priceChart = null;

export async function renderPriceChart(selectedAsset = "BIST100") {

 console.log("renderPriceChart çalıştı");

    const chartElement = document.querySelector("#main-price-chart");
    if (!chartElement) return;
    console.log("chart elementi:", chartElement);

    // 1. CSV Dosyasını Oku
    //Dosya bulunuyor mu,CSV boş mu,gerçekten veri geliyor mu
    const response = await fetch(`${import.meta.env.BASE_URL}Global.csv`);
    console.log("fetch response:", response);
    const csvText = await response.text();
    console.log("csv text ilk 300 karakter:", csvText.slice(0, 300));


    
    
    const { data } = Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
    });
console.log("parse edilmiş ilk 5 satır:", data.slice(0, 5));
console.log("ilk satır kolonları:", Object.keys(data[0] || {}));


    // 2. Veriyi Filtrele (Sadece BIST100 grafiği çizelim)
    // Not: Global.csv'de hangi varlığı görmek istiyorsan 'BIST100' yerine onu yazabilirsin.
    const assetData = data.filter(row => row.Metric === selectedAsset);
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
  .map(row => {
    return {
      x: new Date(row.Date).getTime(),
      y: Number(row.Open)
    };
  })
  .filter(point => !isNaN(point.y) && !isNaN(point.x))
  .sort((a, b) => a.x - b.x);

 console.log("chartSeries:", chartSeries);
    console.log("chartSeries uzunluğu:", chartSeries.length);

    // 4. Grafik Ayarları (Senin tasarımına uyumlu koyu tema)
    const options = {
        series: [{
            data: chartSeries
        }],
        chart: {
            type: 'line',
            height: '100%',
            background: 'transparent',
            toolbar: { show: false }
        },
        theme: { mode: 'dark' },
        xaxis: {
            type: 'datetime',
            labels: { style: { colors: '#8e8da4' } }
        },
        yaxis: {
            tooltip: { enabled: true },
            labels: { style: { colors: '#8e8da4' } }
        },
        // plotOptions: {
        //     candlestick: {
        //         colors: {
        //             upward: '#26a69a',   // Yeşil mum
        //             downward: '#ef5350'  // Kırmızı mum
        //         }
        //     }
        // },
        grid: { borderColor: '#333' }
    };

    // 5. Grafiği Çiz
    // const chart = new ApexCharts(chartElement, options);
    // chart.render();
    if (priceChart) {
  priceChart.destroy();
}

priceChart = new ApexCharts(chartElement, options);
priceChart.render();

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
}

// Sayfa yüklendiğinde çalıştır
//renderPriceChart();
