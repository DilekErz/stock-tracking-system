require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");
const YahooFinance = require("yahoo-finance2").default;
const yahooFinance = new YahooFinance();
const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://dilekerz.github.io",
     "https://dilekerz.github.io/stock-tracking-system"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
};

const app = express();

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

/*  RAİLWAY MYSQL BAĞLANTISI */
const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: Number(process.env.MYSQLPORT),

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
console.log("HOST:", process.env.MYSQLHOST);
console.log("DB:", process.env.MYSQLDATABASE);
console.log("PORT:", process.env.MYSQLPORT);

db.getConnection((err, connection) => {
  if (err) {
    console.log("MySQL bağlantı hatası:", err);
    return;
  }

  console.log("MySQL bağlantısı başarılı");

  connection.release();
});

app.get("/", (req, res) => {
  res.send("Backend çalışıyor");
});
// app.get("/api/test-market", async (req, res) => {
//   const apiKey = process.env.TWELVE_DATA_API_KEY;

//   const url =
//     `https://api.twelvedata.com/time_series?symbol=USD/TRY&interval=1day&outputsize=5&apikey=${apiKey}`;

//   try {
//     const response = await fetch(url);
//     const data = await response.json();

//     res.json(data);
//   } catch (error) {
//     res.status(500).json({
//       message: "Twelve Data API hatası",
//       error: error.message
//     });
//   }
// });
const symbolMap = {
  // Currency Pairs twelve data
  USD_TRY: "USD/TRY",
  EUR_TRY: "EUR/TRY",
  GBP_TRY: "GBP/TRY",
  JPY_TRY: "JPY/TRY",
  HKD_TRY: "HKD/TRY",
  EUR_USD: "EUR/USD",

   // Precious Metals & Commodities twelve data
  Gold: "XAU/USD",
  Silver: "XAG/USD",
  Brent: "XBR/USD",
  // NaturalGas: "null",
  Copper: "HG1",

   // Stock Indexes twelve data
  BIST100: "XU100",
  BIST30: "XU030",
  SP500: "SPX",
  NASDAQ100: "NDX",
  DJI: "DJI",
  DOW: "DJI",
  DAX: "DAX",
  CAC40: "CAC40",
  FTSE100: "FTSE",
  NIKKEI225: "NIKKEI225",
  HSI: "HSI",

  // Government Bonds / Interest Rates twelve data
  TR10YT: "TR10YT",
  US10YT: "US10Y"
};
const yahooSymbolMap = {//api2için veriadları
  BIST100: "XU100.IS",
  BIST30: "XU030.IS",
  SP500: "^GSPC",
  NASDAQ100: "^NDX",
  DJI: "^DJI",
  DOW: "^DJI",
  DAX: "^GDAXI",
  CAC40: "^FCHI",
  FTSE100: "^FTSE",
  NIKKEI225: "^N225",
  HSI: "^HSI",
  US10YT: "^TNX",

  Silver: "SI=F",
  Brent: "BZ=F",
  NaturalGas: "NG=F",
  Copper: "HG=F"
  
};

app.get("/api/test-market", async (req, res) => {

  const selectedSymbol = req.query.symbol || "USD_TRY";

  const apiSymbol = symbolMap[selectedSymbol];

if (!apiSymbol) {
  return res.status(400).json({
    status: "error",
    message: `Symbol map içinde bulunamadı: ${selectedSymbol}`
  });
}
    console.log("Frontend'den gelen symbol:", selectedSymbol);
console.log("Twelve Data'ya giden symbol:", apiSymbol);

  const apiKey =
    process.env.TWELVE_DATA_API_KEY;
console.log("API KEY VAR MI:", !!apiKey);

    const selectedRange = req.query.range || "1M";

const rangeMap = {
  "1D": { interval: "1h", outputsize: 24 },
  "1W": { interval: "1day", outputsize: 21 },
  "1M": { interval: "1day", outputsize: 30 },
  "3M": { interval: "1day", outputsize: 90 },
  "6M": { interval: "1day", outputsize: 180 },
  "1Y": { interval: "1day", outputsize: 365 }
};

const rangeConfig = rangeMap[selectedRange] || rangeMap["1M"];

  const url =
  `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(apiSymbol)}&interval=${rangeConfig.interval}&outputsize=${rangeConfig.outputsize}&apikey=${apiKey}`;

  try {

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);

  } catch (error) {

    res.status(500).json({
      message: "Twelve Data API hatası",
      error: error.message
    });

  }
});

app.get("/api/hkd-try", async (req, res) => {
  const selectedRange = req.query.range || "1M";

  const daysMap = {
    "1D": 2,
    "1W": 45,
    "1M": 30,
    "3M": 90,
    "6M": 180,
    "1Y": 365
  };

  const days = daysMap[selectedRange] || 30;

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const formatDate = (date) => date.toISOString().slice(0, 10);

  const url =
    `https://api.frankfurter.dev/v1/${formatDate(startDate)}..${formatDate(endDate)}?base=HKD&symbols=TRY`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const values = Object.entries(data.rates).map(([date, rate]) => ({
      datetime: date,
      close: rate.TRY,
      volume: 0
    }));

    res.json({
      meta: {
        symbol: "HKD_TRY",
        source: "Frankfurter",
        interval: "1day"
      },
      values
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "HKD/TRY geçmiş verisi alınamadı",
      error: error.message
    });
  }
});

app.get("/api/yahoo-market", async (req, res) => {
  const selectedSymbol = req.query.symbol;
  const selectedRange = req.query.range || "1M";

  const yahooSymbol = yahooSymbolMap[selectedSymbol];

  if (!yahooSymbol) {
    return res.status(400).json({
      status: "error",
      message: `Yahoo symbol bulunamadı: ${selectedSymbol}`
    });
  }

  const rangeMap = {
    "1D": { period1: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), interval: "1h" },
    "1W": { period1: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), interval: "1d" },
    "1M": { period1: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000), interval: "1d" },
    "3M": { period1: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000), interval: "1d" },
    "6M": { period1: new Date(Date.now() - 190 * 24 * 60 * 60 * 1000), interval: "1d" },
    "1Y": { period1: new Date(Date.now() - 370 * 24 * 60 * 60 * 1000), interval: "1d" }
  };

  const config = rangeMap[selectedRange] || rangeMap["1M"];

  try {
    const result = await yahooFinance.chart(yahooSymbol, {
      period1: config.period1,
      interval: config.interval
    });

    const values = result.quotes
      .filter(item => item.close !== null && item.close !== undefined)
      .map(item => ({
        datetime: item.date.toISOString().slice(0, 19).replace("T", " "),
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume ?? 0
      }));

    res.json({
      meta: {
        symbol: yahooSymbol,
        source: "Yahoo Finance",
        interval: config.interval
      },
      values
    });

  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Yahoo Finance veri çekme hatası",
      error: error.message
    });
  }
});
app.get("/api/prediction", async (req, res) => {
  const { symbol } = req.query;

  if (!symbol) {
    return res.status(400).json({ message: "Tahmin için sembol gerekli" });
  }

  try {
    const pythonServiceUrl = `http://localhost:5000/predict?symbol=${symbol}`;
    
    const response = await fetch(pythonServiceUrl);
    const data = await response.json();

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: "Python model servisine ulaşılamadı",
      error: error.message
    });
  }
});
app.get("/test-yahoo", async (req, res) => {
  try {
    const result = await yahooFinance.search("AAPL");
    res.json(result);
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: error.message
    });
  }
}); //TEST İÇİİN EKLENDİ(dilekerz)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});

/* REGISTER */
app.post("/api/register", async (req, res) => {

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "Tüm alanları doldurun"
    });
  }

  try {

    /* Şifreyi şifrele */
    const hashedPassword =
      await bcrypt.hash(password, 10);

    /* SQL */
    const sql =
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

    db.query(
      sql,
      [username, email, hashedPassword],
      (err, result) => {

        if (err) {
  console.log("REGISTER SQL HATASI:", err);

  return res.status(500).json({
    message: "Kayıt başarısız",
    error: err.message
  });
}

        res.json({
          message: "Kayıt başarılı "
        });
      }
    );

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Sunucu hatası"
    });
  }
});

app.post("/api/login", (req, res) => {
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    return res.status(400).json({
      message: "Kullanıcı adı/email ve şifre zorunlu"
    });
  }

  const sql = "SELECT * FROM users WHERE username = ? OR email = ?";

 db.query(sql, [emailOrUsername, emailOrUsername], async (err, results) => {
  if (err) {
    console.log("LOGIN SQL HATASI:", err);

    return res.status(500).json({
      message: "Sunucu hatası",
      error: err.message
    });
  }

    if (results.length === 0) {
      return res.status(401).json({
        message: "Bu kullanıcı kayıtlı değil"
      });
    }

    const user = results[0];

    let passwordCorrect;

try {
  passwordCorrect = await bcrypt.compare(password, user.password);
} catch (error) {
  console.log("Şifre karşılaştırma hatası:", error);
  return res.status(500).json({
    message: "Sunucu hatası"
  });
}

    if (!passwordCorrect) {
      return res.status(401).json({
        message: "Şifre yanlış"
      });
    }

    res.json({
      message: "Giriş başarılı",
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  });
});

/* RESET PASSWORD */
// app.post("/api/reset-password", async (req, res) => {
//   const { email, newPassword } = req.body;

//   if (!email || !newPassword) {
//     return res.status(400).json({
//       message: "Email ve yeni şifre zorunlu"
//     });
//   }

//   try {
//     const checkSql = "SELECT * FROM users WHERE email = ?";

//     db.query(checkSql, [email], async (err, results) => {
//       if (err) {
//         return res.status(500).json({
//           message: "Sunucu hatası"
//         });
//       }

//       if (results.length === 0) {
//         return res.status(404).json({
//           message: "Bu email ile kayıtlı kullanıcı bulunamadı"
//         });
//       }

//       const hashedPassword = await bcrypt.hash(newPassword, 10);

//       const updateSql = "UPDATE users SET password = ? WHERE email = ?";

//       db.query(updateSql, [hashedPassword, email], (updateErr) => {
//         if (updateErr) {
//           return res.status(500).json({
//             message: "Şifre güncellenemedi"
//           });
//         }

//         res.json({
//           message: "Şifre başarıyla güncellendi ✅"
//         });
//       });
//     });
//   } catch (error) {
//     console.log(error);

//     res.status(500).json({
//       message: "Sunucu hatası"
//     });
//   }
// });

app.post("/api/check-email", (req, res) => {
  const { email } = req.body;

  const sql = "SELECT id FROM users WHERE email = ?";

  db.query(sql, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Sunucu hatası" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Bu email ile kayıtlı kullanıcı bulunamadı" });
    }

    res.json({ message: "Email doğrulandı" });
  });
});

app.post("/api/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({
      message: "Email ve yeni şifre zorunlu"
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const updateSql = "UPDATE users SET password = ? WHERE email = ?";

    db.query(updateSql, [hashedPassword, email], (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Şifre güncellenemedi"
        });
      }

      res.json({
        message: "Şifre başarıyla güncellendi "
      });
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Sunucu hatası"
    });
  }
});
//  LLM İÇİN EKLENDİ
app.post("/api/llm/analyze", async (req, res) => {
  try {

    const {
      symbol,
      lowPrice,
      highPrice,
      lastPrice,
      rsi14,
      macd,
      prediction
    } = req.body;

   const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash"
});

    const prompt = `
You are a financial market analysis assistant.

Do not provide investment advice.
Do not tell users to buy or sell.

Asset: ${symbol}

Price Range:
Low Price: ${lowPrice}
High Price: ${highPrice}
Last Price: ${lastPrice}

RSI(14):
${rsi14 ?? "RSI data unavailable"}

MACD:
${macd ? JSON.stringify(macd) : "MACD data unavailable"}

AI Prediction:
${prediction ? JSON.stringify(prediction) : "AI prediction not available"}

Generate:

1. Price Range Analysis
2. RSI Analysis
3. MACD Analysis
4. AI Prediction Analysis
5. Overall Market Outlook

Keep response short.
`;

    // const result =
    //   await model.generateContent(prompt); yerine: 
let result;

for (let i = 0; i < 3; i++) {

  try {

    result = await model.generateContent(prompt);

    break;

  } catch (err) {

    if (err.status === 503) {

      console.log("Gemini yoğun, tekrar deneniyor...");

      await new Promise(resolve =>
        setTimeout(resolve, 3000)
      );

      continue;
    }

    throw err;
  }
}




    const analysis =
      result.response.text();

    res.json({
      analysis
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "LLM analysis failed"
    });

  }
});

process.on("uncaughtException", (err) => {
  console.error("Yakalanmayan hata:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Promise hatası:", err);
});
/* SERVER */
// app.listen(3000, () => {
//   console.log("Server çalışıyor: http://localhost:3000");
// });

