require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://dilekerz.github.io"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
};

const app = express();

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

/*  RAİLWAY MYSQL BAĞLANTISI */
const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: Number(process.env.MYSQLPORT)
});
console.log("HOST:", process.env.MYSQLHOST);
console.log("DB:", process.env.MYSQLDATABASE);
console.log("PORT:", process.env.MYSQLPORT);

db.connect((err) => {
  if (err) {
    console.log("MySQL bağlantı hatası:", err);
    return;
  }

  console.log("MySQL bağlantısı başarılı");
});

app.get("/", (req, res) => {
  res.send("Backend çalışıyor");
});

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

          console.log(err);

          return res.status(500).json({
            message: "Kayıt başarısız"
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
      return res.status(500).json({
        message: "Sunucu hatası"
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

/* SERVER */
// app.listen(3000, () => {
//   console.log("Server çalışıyor: http://localhost:3000");
// });

