
 import "./css/styles.css";
 import { renderPriceChart } from './charts.js';
//  const API_URL = "https://stock-tracking-system-production.up.railway.app"; RAİLWAY ÇALIŞMAZSA ALTTAKİ LOCALHOST ÇALIŞTIR
const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://stock-tracking-system-3myv.onrender.com";

async function loadPartial(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`${path} yüklenemedi.`);
  }

  return await response.text();
}


async function initApp() {
  const app = document.getElementById("app");

  try {
    const loginHtml = await loadPartial("./partials/login.html");
    const homepageHtml = await loadPartial("./partials/homepage.html");
    
    const registerHtml = await loadPartial("./partials/create-account.html");
const profileHtml = await loadPartial("./partials/profile.html");
const forgotHtml = await loadPartial("./partials/forgot-password.html");

    console.log("sidebar string var mı:", homepageHtml.includes('id="sidebar"'));
console.log("closeMenu string var mı:", homepageHtml.includes('id="closeMenu"'));
console.log("overlay string var mı:", homepageHtml.includes('id="overlay"'));
// console.log("homepageHtml:", homepageHtml);
    app.innerHTML = `
      <section id="loginPage">
        ${loginHtml}
      </section>


       <section id="registerPageWrapper" style="display: none;">
    ${registerHtml}
  </section>

<section id="forgotPageWrapper" style="display: none;">
  ${forgotHtml}
</section>

      <section id="homepagePage" style="display: none;">
        ${homepageHtml}
      </section>


       <section id="profilePage" style="display: none;">
    ${profileHtml}
  </section>
      
    `;

    setupLogin();
    setupRegisterNavigation();
    setupForgotPasswordNavigation();
    setupForgotPasswordSubmit();
    setupSidebarDelegation();
    setupThemeToggle();
    setupProfileNavigation();
    setupProfilePreferenceDropdowns();
    saveProfilePreferences();
    setupPasswordToggle();
    updateThemeStatus();
    updateHomepageLogo();
    loadSavedProfileImage();
    loadUserProfile();
    // addAssetCurrencyMenus();
    setupSidebarSelections();
    setupAiCardsToggle();
    applyPreferencesToHomepage();
    setupLanguageSwitcher();
    setupPredictionModelChange();

    setTimeout(() => {
  const currentLanguage = localStorage.getItem("language") || "tr";
  applyLanguage(currentLanguage);
}, 500);

  } catch (error) {
    console.error("Yükleme hatası:", error);
    app.innerHTML = `<p style="color:white;">İçerik yüklenemedi.</p>`;
  }
}
const translations = {
  tr: {
    priceTimeSeries: "Fiyat Zaman Serisi",
    aiPrediction: "Yapay Zeka Tahmini",
    realValue: "Güncel Değer:",
    difference: "Yükseliş Olasılığı:",
    volume: "Hacim",
    highLow: "En Yüksek / En Düşük",
    priceRange: "Fiyat Aralığı",
    volatility: "Volatilite",
    menu: "MENÜ",
    modelInputWindow: "Model Girdi Penceresi",
  marketCategories: "Piyasa Kategorileri",
  graphSettings: "Grafik Ayarları",
  chartRange: "Grafik Aralığı",
  indicators: "Göstergeler",
  predictionModel: "Tahmin Modeli",
   originalMarketCurrency: "Orijinal Piyasa Para Birimi",
  portfolioCurrencyView: "Portföy Para Birimi Görünümü",
  displayMode: "Görüntüleme Modu:",
  movingAverage: "Hareketli Ortalama",
  predictionTarget: "Tahmin Hedefi:",
  nextDay: "Sonraki Gün",
  accuracy: "Doğruluk:",
  inputWindow: "Girdi Penceresi:",
  predictShowChart: "TAHMİN ET VE GRAFİĞİ GÖSTER",
  modelHybrid: "LSTM + XGBoost (Hibrit)",
  modelLstm: "Sadece LSTM (Yön Tahmini)",
  predictedValue: "Tahmini Değer (Yarın):",
  priceBand: "Olası Aralık:",
  modelReliability: "Model Güvenilirlik Skoru:",
   fiveDayWindow: "5 Günlük Pencere (Optimize)",
  fiveDayWindowDesc:
    "ⓘ Model sonraki hareketi tahmin etmek için son 5 işlem gününü kullanır.",
     stockIndexes: "Hisse Senedi Endeksleri (BIST ve Küresel)",
 commodities: "Kıymetli Metaller ve Emtialar",
 currencyPairs: "Döviz Çiftleri",
 governmentBonds: "Devlet Tahvilleri / Faiz Oranları",
 gold:"🟡 Altın (Ons)",
silver:"⚪ Gümüş",
brent:"🛢️ Brent Petrol",
naturalGas:"🔋 Doğal Gaz",
copper:"🪵 Bakır",
chartRangeInfo:
"ⓘ Grafikte gösterilecek geçmiş fiyat verisi miktarını seçin.",
movingAverage:"Hareketli Ortalama",
predictionTarget:"Tahmin Hedefi",
nextDay:"Sonraki İşlem Günü",
accuracy:"Doğruluk:",
inputWindow:"Girdi Penceresi:",
slidingWindow:"5 Günlük Kayan Pencere",
predictionDetails:"Tahmin Detayları",
aboutModel:"Model Hakkında",
disclaimer:"Yasal Uyarı",
footerDisclaimer:
"Bu uygulama yalnızca bilgilendirme amaçlı yapay zeka tahminleri sunar. Yatırım tavsiyesi değildir.",
analysisLoading:"Yapay zeka analizi yükleniyor...",
 modelIndicators: "Göstergeler:",
myProfile: "Profilim",
profileDescription: "Hisse takip hesabınızı ve tercihlerinizi yönetin.",
aiPredictUser: "AI Predict Kullanıcısı",
editPhoto: "Fotoğrafı Düzenle",
changeUsername: "Kullanıcı Adını Değiştir",
changePassword: "Şifreyi Değiştir",
username: "Kullanıcı Adı",
email: "E-posta",
preferredAsset: "Tercih Edilen Varlık",
predictionWindow: "Tahmin Penceresi",
watchlist: "İzleme Listesi",
theme: "Tema",
backToDashboard: "← Panele Dön",
goldText: "Altın",
brentText: "Brent Petrol",
fiveAssets: "5 Varlık",
fiveDays: "5 Gün",
darkMode: "Karanlık Mod",
lightMode: "Aydınlık Mod",

preferredAssetInfo:
"Tercih ettiğiniz varlık, uygulamayı açtığınızda varsayılan olarak görüntülenecek ilk piyasa enstrümanı olacaktır.",

editPhotoTitle: "Fotoğrafı Düzenle",
changePhoto: "Fotoğrafı Değiştir",
savePhoto: "Fotoğrafı Kaydet",

changeUsernameTitle: "Kullanıcı Adını Değiştir",
usernameInfo:
"Kullanıcı adınızı değiştirmek için mevcut şifrenizi giriniz.",
newUsername: "Yeni kullanıcı adı",
currentPassword: "Mevcut şifre",
saveUsername: "Kullanıcı Adını Kaydet",

changePasswordTitle: "Şifreyi Değiştir",
newPassword: "Yeni şifre",
confirmNewPassword: "Yeni şifreyi onayla",
updatePassword: "Şifreyi Güncelle",

  },
  en: {
    priceTimeSeries: "Price Time Series",
    aiPrediction: "AI Prediction",
    realValue: "Current Value:",
    difference: "Probability of Increase:",
    volume: "Volume",
    highLow: "High / Low",
    priceRange: "Price Range",
    volatility: "Volatility",
    menu: "MENU",
      modelInputWindow: "Model Input Window",
  marketCategories: "Market Categories",
  graphSettings: "Graph Settings",
  chartRange: "Chart Range",
  indicators: "Indicators",
  predictionModel: "Prediction Model",
  modelHybrid: "LSTM + XGBoost (Hybrid)",
  modelLstm: "LSTM Only (Direction)",
  predictedValue: "Predicted Value (Tomorrow):",
  priceBand: "Likely Range:",
  modelReliability: "Model Reliability Score:",
   fiveDayWindow: "5-Day Window (Optimized)",
  fiveDayWindowDesc:
    "ⓘ Model uses the last 5 market days to predict the next movement.",
     stockIndexes: "Stock Indexes (BIST & Global)",
 commodities: "Precious Metals & Commodities",
 currencyPairs: "Currency Pairs",
 governmentBonds: "Government Bonds / Interest Rates",
  gold:"🟡 Gold (Ounce)",
silver:"⚪ Silver",
brent:"🛢️ Brent Oil",
naturalGas:"🔋 Natural Gas",
copper:"🪵 Copper",
chartRangeInfo:
"ⓘ Select how much historical price data is displayed on the chart.",
movingAverage:"Moving Average",
predictionTarget:"Prediction Target:",
nextDay:"Next Day",
accuracy:"Accuracy:",
inputWindow:"Input Window:",
slidingWindow:"5-Day Sliding",
predictionDetails:"Predictions Details",
aboutModel:"About Model",
disclaimer:"Disclaimer",
footerDisclaimer:
"This application provides AI-based predictions for informational purposes only. It is not investment advice.",
analysisLoading:"AI analysis is loading...",
  modelIndicators: "Indicators:",
  predictShowChart: " PREDICT AND SHOW CHART",
  myProfile: "My Profile",
profileDescription: "Manage your stock tracking account and preferences.",
aiPredictUser: "AI Predict User",
editPhoto: "Edit Photo",
changeUsername: "Change Username",
changePassword: "Change Password",
username: "Username",
email: "Email",
preferredAsset: "Preferred Asset",
predictionWindow: "Prediction Window",
watchlist: "Watchlist",
theme: "Theme",
backToDashboard: "← Back to Dashboard",
lightMode: "Light Mode",
darkMode: "Dark Mode",
goldText: "Gold",
brentText: "Brent",
fiveAssets: "5 Assets",
fiveDays: "5 Days",
darkMode: "Dark Mode",
lightMode: "Light Mode",

preferredAssetInfo:
"Your selected asset will be displayed as the default market instrument whenever you open the application.",

editPhotoTitle: "Edit Photo",
changePhoto: "Change Photo",
savePhoto: "Save Photo",

changeUsernameTitle: "Change Username",
usernameInfo:
"To change your username, please enter your current password.",
newUsername: "New username",
currentPassword: "Current password",
saveUsername: "Save Username",

changePasswordTitle: "Change Password",
newPassword: "New password",
confirmNewPassword: "Confirm new password",
updatePassword: "Update Password",

  }
};

function setupLanguageSwitcher() {
  const trBtn = document.getElementById("trBtn");
  const enBtn = document.getElementById("enBtn");

  if (!trBtn || !enBtn) return;

  let selectedLanguage =
    localStorage.getItem("language") || "tr";

  function setLanguage(lang) {
    localStorage.setItem("language", lang);

    trBtn.classList.toggle("active", lang === "tr");
    enBtn.classList.toggle("active", lang === "en");

    console.log("Dil:", lang);

    applyLanguage(lang);
    updateThemeStatus();
    applyPreferencesToHomepage();

    const selectedAsset =
  localStorage.getItem("selectedAsset") || "Gold";

const selectedRange =
  document.querySelector(".chart-range-grid button.active")?.dataset.range || "1M";

renderPriceChart(selectedAsset, selectedRange).then(() => {
  fetchAIPrediction(selectedAsset);
});
  }

  trBtn.addEventListener("click", () => setLanguage("tr"));
  enBtn.addEventListener("click", () => setLanguage("en"));

  setLanguage(selectedLanguage);
}
function applyLanguage(lang) {
  const t = translations[lang];

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    if (el.id === "llmAnalysis") return;
  const key = el.dataset.i18n;

  if (t[key]) {
    el.textContent = t[key];
  }
});

  const chartTitle = document.querySelector(".big-chart .chart-title");
  if (chartTitle) chartTitle.textContent = t.priceTimeSeries;

  const predictionTitle = document.querySelector(".prediction-card h3");
  if (predictionTitle) predictionTitle.innerHTML = `<span>AI</span> ${lang === "tr" ? "TAHMİN" : "PREDICTION"}`;

  const modelSelect = document.getElementById("modelSelect");
  if (modelSelect) {
    modelSelect.options[0].textContent = t.modelHybrid;
    modelSelect.options[1].textContent = t.modelLstm;
  }

  const details = document.querySelectorAll(".prediction-details div");
  if (details[0]) details[0].childNodes[0].textContent = t.realValue + " ";
  if (details[1]) details[1].childNodes[0].textContent = t.difference + " ";

  const valueBoxDetails = document.querySelectorAll(".prediction-value-box div");
  if (valueBoxDetails[0]) valueBoxDetails[0].childNodes[0].textContent = t.predictedValue + " ";
  if (valueBoxDetails[1]) valueBoxDetails[1].childNodes[0].textContent = t.priceBand + " ";
  if (valueBoxDetails[2]) valueBoxDetails[2].childNodes[0].textContent = t.modelReliability + " ";

  const volumeBox = document.getElementById("volumeBox");
  

  const highLowBox = document.getElementById("highLowBox");
  

  const priceRangeBox = document.getElementById("priceRangeBox");
  

  const volatilityBox = document.getElementById("volatilityBox");
  

  const menuTitle = document.querySelector(".sidebar-header h2");
  if (menuTitle) menuTitle.textContent = t.menu;

  replaceLabelKeepValue(volumeBox, ["Volume", "Hacim"], t.volume);

replaceLabelKeepValue(
  highLowBox,
  ["High / Low", "En Yüksek / En Düşük"],
  t.highLow
);

replaceLabelKeepValue(
  priceRangeBox,
  ["Range", "Price Range", "Fiyat Aralığı"],
  t.priceRange
);

replaceLabelKeepValue(
  volatilityBox,
  ["Volatility", "Volatilite"],
  t.volatility
);
const preferredAsset =
  localStorage.getItem("selectedAsset") || "Gold";

const profilePreferredAsset =
  document.getElementById("profilePreferredAsset");

if (profilePreferredAsset) {
  profilePreferredAsset.textContent =
    preferredAsset === "Gold"
      ? t.goldText
      : preferredAsset === "Brent"
        ? t.brentText
        : preferredAsset.replace("_", "/");
}

const tooltipTexts = {
  tr: {
    volumeTitle: "Hacim",
    volumeText: "Seçilen varlık ve grafik aralığı için toplam işlem hacmini gösterir.",

    highLowTitle: "En Yüksek / En Düşük",
    highLowText: "Seçilen grafik aralığındaki en yüksek ve en düşük fiyatı gösterir.",

    rangeTitle: "Fiyat Aralığı",
    rangeText: "En yüksek ve en düşük değerler arasındaki fiyat aralığını gösterir.",

    volatilityTitle: "Volatilite",
    volatilityText: "Seçilen varlığın fiyatındaki dalgalanma oranını gösterir. Daha yüksek volatilite daha yüksek risk anlamına gelir."
  },
  en: {
    volumeTitle: "Volume",
    volumeText: "Shows the total trading volume for the selected asset and chart range.",

    highLowTitle: "High / Low",
    highLowText: "Shows the highest and lowest price within the selected chart range.",

    rangeTitle: "Price Range",
    rangeText: "Displays the current price range between the highest and lowest values.",

    volatilityTitle: "Volatility",
    volatilityText: "Shows how much the selected asset price fluctuates. Higher volatility means higher risk."
  }
};

const tooltips = tooltipTexts[lang];

const infoBoxes = document.querySelectorAll(".info-box");

if (infoBoxes[0]) {
  infoBoxes[0].dataset.tooltipTitle = tooltips.volumeTitle;
  infoBoxes[0].dataset.tooltip = tooltips.volumeText;
}

if (infoBoxes[1]) {
  infoBoxes[1].dataset.tooltipTitle = tooltips.highLowTitle;
  infoBoxes[1].dataset.tooltip = tooltips.highLowText;
}

if (infoBoxes[2]) {
  infoBoxes[2].dataset.tooltipTitle = tooltips.rangeTitle;
  infoBoxes[2].dataset.tooltip = tooltips.rangeText;
}

if (infoBoxes[3]) {
  infoBoxes[3].dataset.tooltipTitle = tooltips.volatilityTitle;
  infoBoxes[3].dataset.tooltip = tooltips.volatilityText;
}
}
function replaceLabelKeepValue(element, oldLabels, newLabel) {
  if (!element) return;

  let text = element.textContent.trim();

  oldLabels.forEach(label => {
    if (text.startsWith(label)) {
      text = text.replace(label, "").trim();
    }
  });

  element.textContent = `${newLabel} ${text}`.trim();
}

function updateHomepageLogo() {
  const homepageLogo = document.getElementById("homepage-logo"); //  BURAYA AL

  if (!homepageLogo) return;

  const isLight = document.body.classList.contains("light-mode");


  homepageLogo.src = isLight
  ? `${import.meta.env.BASE_URL}assets/logos/logo-light.png`
  : `${import.meta.env.BASE_URL}assets/logos/logo-dark.png`;

  // homepageLogo.src = isLight
  //   ? "./assets/logos/logo-light.png"
  //   : "./assets/logos/logo-dark.png";
}

function updateThemeStatus() {
  const themeStatus = document.getElementById("themeStatus");
  if (!themeStatus) return;

  const lang = localStorage.getItem("language") || "tr";

  themeStatus.textContent =
    document.body.classList.contains("light-mode")
       ? translations[lang].lightMode
      : translations[lang].darkMode;
}

function setupProfileNavigation() {
  document.addEventListener("click", function (event) {
    const openProfile = event.target.closest("#openProfile");
    const backToHomepage = event.target.closest("#backToHomepage");

    const homepagePage = document.getElementById("homepagePage");
    const profilePage = document.getElementById("profilePage");

    if (openProfile) {
      homepagePage.style.display = "none";
      profilePage.style.display = "block";
    }

    if (backToHomepage) {
      profilePage.style.display = "none";
      homepagePage.style.display = "block";

       applyPreferencesToHomepage();
    }
  });
}

function setupProfilePreferenceDropdowns() {
  document.addEventListener("click", function (event) {
    const dropdownBtn = event.target.closest(".profile-dropdown-btn");

    if (dropdownBtn) {
      const targetId = dropdownBtn.dataset.target;
      const menu = document.getElementById(targetId);

      document.querySelectorAll(".profile-dropdown-menu").forEach(item => {
        if (item !== menu) item.classList.remove("active");
      });

      menu.classList.toggle("active");
    }

    const menuButton = event.target.closest(".profile-dropdown-menu button");

    if (menuButton) {
      const menu = menuButton.closest(".profile-dropdown-menu");
      const value = menuButton.textContent.trim();

//       if (menu.id === "assetMenu") {
//   document.getElementById("profilePreferredAsset").textContent = value;
// }
      if (menu.id === "assetMenu") {
  const assetValue = menuButton.dataset.asset || value.replace("/", "_");

  localStorage.setItem("selectedAsset", assetValue);

  const lang = localStorage.getItem("language") || "tr";

  const assetText =
    assetValue === "Gold"
      ? translations[lang].goldText
      : assetValue === "Brent"
        ? translations[lang].brentText
        : assetValue.replace("_", "/");

  document.getElementById("profilePreferredAsset").textContent = assetText;
}

      if (menu.id === "currencyMenu") {
        document.getElementById("profilePortfolioCurrency").textContent = value;
      }

      if (menu.id === "predictionMenu") {
        document.getElementById("profilePredictionWindow").textContent = value;
        document.getElementById("profileDefaultPrediction").textContent = value;
      }

      if (menu.id === "displayMenu") {
        document.getElementById("profileDisplayMode").textContent = value;
      }

      menu.classList.remove("active");
    }
  });
}

function saveProfilePreferences() {
  const preferenceMap = {
    assetMenu: "selectedAsset",
    currencyMenu: "portfolioCurrency",
    predictionMenu: "predictionWindow",
    displayMenu: "displayMode",
  };

  document.querySelectorAll(".profile-dropdown-menu button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const menu = btn.parentElement;
      const key = preferenceMap[menu.id];
      const value = btn.textContent.trim();

      localStorage.setItem(key, value);

      const strong = menu.previousElementSibling.querySelector("strong");
      if (strong) strong.textContent = value;

      if (key === "predictionWindow") {
        const defaultPrediction = document.getElementById("profileDefaultPrediction");
        if (defaultPrediction) defaultPrediction.textContent = value;
      }

      menu.classList.remove("active");
    });
  });
}

function applyPreferencesToHomepage() {
  const selectedAsset = localStorage.getItem("selectedAsset") || "Gold";
  const portfolioCurrency = localStorage.getItem("portfolioCurrency") || "USD";
  const predictionWindow = localStorage.getItem("predictionWindow") || "5 Days";
  const displayMode = localStorage.getItem("displayMode") || "Original Market";

  const assetName = document.querySelector(".asset-name");
  const currency = document.querySelector(".currency");
  const predictionTitle = document.querySelector(".prediction-price");
  const chartTitle = document.querySelector(".big-chart .chart-title");
  const confidence = document.querySelector(".confidence");

  if (assetName) assetName.textContent = selectedAsset;
  if (currency) {
  // const viewValue = displayMode === "Local Value" ? "local" : "original";

  // currency.textContent =
  //   selectedAsset.includes("_")
  //     ? getOriginalCurrency(selectedAsset)
  //     : viewValue === "local"
  //       ? portfolioCurrency
  //       : getOriginalCurrency(selectedAsset);
  currency.textContent = getOriginalCurrency(selectedAsset);
}

//   if (predictionTitle) {
//   const lang = localStorage.getItem("language") || "tr";

//   predictionTitle.textContent =
//     lang === "tr"
//       ? "5 Günlük Pencere (Optimize) Tahmini"
//       : "5-Day Window (Optimized) Prediction";
// }

 if (chartTitle) {
  const lang = localStorage.getItem("language") || "tr";

  chartTitle.textContent =
    lang === "tr"
      ? `${selectedAsset} Fiyat Grafiği`
      : `${selectedAsset} Price Chart`;
}

  if (confidence) {
    confidence.textContent = `Selected view: ${displayMode}`;
  }

  const assetRadio = document.querySelector(`input[name="selectedAsset"][value="${selectedAsset}"]`);
  if (assetRadio) assetRadio.checked = true;

  const currencyRadio = document.querySelector(`input[name="portfolioCurrency"][value="${portfolioCurrency}"]`);
  if (currencyRadio) currencyRadio.checked = true;

  const viewValue = displayMode === "Local Value" ? "local" : "original";
  const viewRadio = document.querySelector(`input[name="currencyView"][value="${viewValue}"]`);
  if (viewRadio) viewRadio.checked = true;
}

function setupRegisterNavigation() {
  document.addEventListener("click", function (event) {
    const createAccountBtn = event.target.closest("#createAccountBtn");
    const backToLogin = event.target.closest("#backToLogin");

    const loginPage = document.getElementById("loginPage");
    const registerPageWrapper = document.getElementById("registerPageWrapper");

    if (createAccountBtn) {
      loginPage.style.display = "none";
      registerPageWrapper.style.display = "block";
    }

    if (backToLogin) {
      registerPageWrapper.style.display = "none";
      loginPage.style.display = "block";
    }
  });


  

document.addEventListener("submit", async function (event) {

  const registerForm =
    event.target.closest(".register-form");

  if (!registerForm) return;

  event.preventDefault();

  const username =
    registerForm.querySelector('input[name="username"]').value.trim();

  const email =
    registerForm.querySelector('input[name="email"]').value.trim();

  const password =
    registerForm.querySelector('input[name="password"]').value.trim();

  try {

    const response = await fetch(
      `${API_URL}/api/register`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          username,
          email,
          password
        })
      }
    );

    const data = await response.json();

    alert(data.message);

    if (response.ok) {

      document.getElementById("registerPageWrapper").style.display = "none";

      document.getElementById("loginPage").style.display = "block";
    }

  } catch (error) {

    console.log(error);

    alert("Register hatası");
  }
});
}
 
// düzeltme

let selectedProfileImage = null;

document.addEventListener("change", function (event) {
  if (event.target.id === "profileImageInput") {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
      selectedProfileImage = e.target.result;

      document.getElementById("modalAvatar").innerHTML = `
        <img src="${selectedProfileImage}" alt="Profile Photo">
      `;
    };

    reader.readAsDataURL(file);
  }
});

document.addEventListener("click", function (event) {
  if (event.target.id === "savePhotoBtn") {
    if (!selectedProfileImage) {
      alert("Lütfen önce bir fotoğraf seç.");
      return;
    }

    document.getElementById("profileAvatar").innerHTML = `
      <img src="${selectedProfileImage}" alt="Profile Photo">
    `;

    localStorage.setItem("profileImage", selectedProfileImage);

    document.getElementById("photoModal").classList.remove("active");
  }
});

document.addEventListener("click", function (event) {
 
if (event.target.id === "openPhotoModal") {

  const savedImage = localStorage.getItem("profileImage");

  if (savedImage) {
    document.getElementById("modalAvatar").innerHTML = `
      <img src="${savedImage}" alt="Profile Photo">
    `;
  }

  document.getElementById("photoModal").classList.add("active");
}
  if (event.target.id === "openUsernameModal") {
    document.getElementById("usernameModal").classList.add("active");
  }

  if (event.target.id === "openPasswordModal") {
    document.getElementById("passwordModal").classList.add("active");
  }

  if (event.target.classList.contains("modal-close-btn")) {
    const modalId = event.target.dataset.close;
    document.getElementById(modalId).classList.remove("active");
  }
});

// function addAssetCurrencyMenus() {
//   const allowedSections = [
//     "Stock Indexes (BIST & Global)",
//     "Precious Metals & Commodities"
//   ];

//   document.querySelectorAll(".market-accordion").forEach(accordion => {
//     const summary = accordion.querySelector("summary");
//     const titleSpan = summary?.querySelector("span:first-child");

//     const categoryTitle = titleSpan?.textContent.trim();

//     if (!allowedSections.includes(categoryTitle)) return;

//     if (summary.querySelector(".category-currency-menu-btn")) return;

//     const menuBtn = document.createElement("button");
//     menuBtn.type = "button";
//     menuBtn.className = "category-currency-menu-btn";
//     menuBtn.textContent = "⋮";

//     const menu = document.createElement("div");
//     menu.className = "category-currency-menu";
//     menu.innerHTML = `
//       <p>View all as</p>
//       <button type="button" data-currency="TRY">TRY ₺</button>
//       <button type="button" data-currency="USD">USD $</button>
//       <button type="button" data-currency="EUR">EUR €</button>
//     `;

//     summary.appendChild(menuBtn);
//     summary.appendChild(menu);
//   });
// }


function setupSidebarSelections() {
  document.addEventListener("click", function (event) {

  // const categoryCurrencyBtn = event.target.closest(".category-currency-menu-btn");

// if (categoryCurrencyBtn) {
//   event.preventDefault();
//   event.stopPropagation();

//   const menu = categoryCurrencyBtn.nextElementSibling;

//   document.querySelectorAll(".category-currency-menu").forEach(item => {
//     if (item !== menu) item.classList.remove("active");
//   });

//   menu.classList.toggle("active");
//   return;
// }

// // const categoryCurrencyOption = event.target.closest(".category-currency-menu button");

// if (categoryCurrencyOption) {
//   event.preventDefault();
//   event.stopPropagation();

//   const selectedCurrency = categoryCurrencyOption.dataset.currency;
//   const accordion = categoryCurrencyOption.closest(".market-accordion");
//   const categoryTitle =
//     accordion.querySelector("summary span:first-child")?.textContent.trim();

//   if (categoryTitle.includes("Stock Indexes")) {
//     localStorage.setItem("stockIndexesViewCurrency", selectedCurrency);
//   }

//   if (categoryTitle.includes("Precious Metals")) {
//     localStorage.setItem("commoditiesViewCurrency", selectedCurrency);
//   }

//   const selectedAsset =
//     document.querySelector('input[name="selectedAsset"]:checked')?.value;

//   if (selectedAsset) {
//     const selectedAccordion =
//       document.querySelector('input[name="selectedAsset"]:checked')
//         ?.closest(".market-accordion");

//     const selectedCategory =
//       selectedAccordion?.querySelector("summary span:first-child")
//         ?.textContent.trim();

//     if (
//       selectedCategory === categoryTitle
//     ) {
//       const currencyText = document.querySelector(".currency");
//       if (currencyText) currencyText.textContent = selectedCurrency;
//     }
//   }

//   categoryCurrencyOption.closest(".category-currency-menu").classList.remove("active");

//   console.log(`${categoryTitle} artık ${selectedCurrency} olarak gösterilecek`);

//   return;
//}
    // const currency = event.target.closest(".currency-option");
    // if (currency) {
    //   document.querySelectorAll(".currency-option").forEach(item => {
    //     item.classList.remove("active");
    //   });

    //   currency.classList.add("active");
    //   currency.querySelector("input").checked = true;
    //   updateDashboardFromSidebar();
    // }

    const market = event.target.closest(".market-item");
    if (market) {
      document.querySelectorAll(".market-item").forEach(item => {
        item.classList.remove("active");
        item.querySelectorAll("strong").forEach(badge => badge.remove());
      });

      market.classList.add("active");
      market.querySelector("input").checked = true;

      const selectedBadge = document.createElement("strong");
      const lang = localStorage.getItem("language") || "tr";
selectedBadge.textContent = lang === "tr" ? "Seçildi" : "Selected";
      market.appendChild(selectedBadge);
      updateDashboardFromSidebar();
    }

    const mode = event.target.closest(".view-mode");
    if (mode) {
      document.querySelectorAll(".view-mode").forEach(item => {
        item.classList.remove("active");
      });

      mode.classList.add("active");
      mode.querySelector("input").checked = true;
      updateDashboardFromSidebar();
    }

    const predictionBtn = event.target.closest(".prediction-window-grid button");
    if (predictionBtn) {
      document.querySelectorAll(".prediction-window-grid button").forEach(btn => {
        btn.classList.remove("active");
      });

      predictionBtn.classList.add("active");
      updateDashboardFromSidebar();
    }

    const chartRangeBtn = event.target.closest(".chart-range-grid button");
    if (chartRangeBtn) {
      document.querySelectorAll(".chart-range-grid button").forEach(btn => {
        btn.classList.remove("active");
      });

      chartRangeBtn.classList.add("active");
      updateDashboardFromSidebar();
    }

    const infoLink = event.target.closest(".sidebar-links a");
    if (infoLink) {
      event.preventDefault();

      const infoBox = document.getElementById("sidebarInfoBox");
      const infoTitle = document.getElementById("infoTitle");
      const infoText = document.getElementById("infoText");

      if (!infoBox || !infoTitle || !infoText) return;

      const linkText = infoLink.textContent.trim();

      infoBox.classList.add("active");

      const lang = localStorage.getItem("language") || "tr";

if (
  linkText.includes("Predictions Details") ||
  linkText.includes("Tahmin Detayları")
) {
  infoTitle.textContent =
    lang === "tr" ? "Tahmin Detayları" : "Prediction Details";

  infoText.textContent =
    lang === "tr"
      ? "Tahmin sonucu seçilen varlık, teknik göstergeler, grafik verileri ve tahmin penceresi kullanılarak oluşturulur."
      : "The prediction result is generated using the selected asset, technical indicators, chart data and prediction window.";
}

if (
  linkText.includes("About Model") ||
  linkText.includes("Model Hakkında")
) {
  infoTitle.textContent =
    lang === "tr" ? "Model Hakkında" : "About Model";

  infoText.textContent =
    lang === "tr"
      ? "Bu sistem hibrit LSTM + XGBoost modeli kullanır. LSTM zamana bağlı fiyat hareketlerini analiz eder, XGBoost ise teknik göstergelerle karar sürecini destekler."
      : "This system uses a hybrid LSTM + XGBoost model. LSTM analyzes time-based price movements, while XGBoost supports decision-making with technical indicators.";
}

if (
  linkText.includes("Disclaimer") ||
  linkText.includes("Yasal Uyarı")
) {
  infoTitle.textContent =
    lang === "tr" ? "Yasal Uyarı" : "Disclaimer";

  infoText.textContent =
    lang === "tr"
      ? "Bu uygulama yalnızca bilgilendirme amaçlı yapay zeka destekli finansal tahminler sunar. Yatırım tavsiyesi değildir."
      : "This application provides AI-based financial predictions for informational purposes only. It is not investment advice.";
}
    }

    const closeInfoBox = event.target.closest("#closeInfoBox");
    if (closeInfoBox) {
      document.getElementById("sidebarInfoBox").classList.remove("active");
    }
  });

  
}

function setupAiCardsToggle() {
  const switchInput = document.getElementById("toggleAiCardsSwitch");

  const topSection = document.querySelector(".top-section");
  const cardTwo = document.querySelector(".card-two");
  const aiCard = document.querySelector(".prediction-card");
  const llmCard = document.querySelector(".prediction-card-two");

  if (!switchInput || !topSection || !cardTwo || !aiCard || !llmCard) return;

  function setAiCardsVisible(isVisible) {
    switchInput.checked = isVisible;

    topSection.classList.toggle("ai-hidden", !isVisible);
    cardTwo.classList.toggle("ai-hidden", !isVisible);
    aiCard.classList.toggle("ai-hidden", !isVisible);
    llmCard.classList.toggle("ai-hidden", !isVisible);

    localStorage.setItem("aiCardsVisible", isVisible ? "true" : "false");

    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 150);
  }

  const saved = localStorage.getItem("aiCardsVisible");
  setAiCardsVisible(saved !== "false");

  switchInput.addEventListener("change", () => {
    setAiCardsVisible(switchInput.checked);
  });
}

// let typeWriterTimer = null;

// function typeWriterEffect(element, text, speed = 18) {
//   if (!element) return;

//   if (typeWriterTimer) {
//     clearInterval(typeWriterTimer);
//   }

//   element.textContent = "";
//   const cursor = document.createElement("span");
//   cursor.className = "cursor";
//   cursor.textContent = "|";
//   element.appendChild(cursor);

//   let index = 0;

//   typeWriterTimer = setInterval(() => {
//     cursor.remove();

//     element.append(
//       document.createTextNode(text.charAt(index))
//     );

//     element.appendChild(cursor);

//     element.scrollTop = element.scrollHeight;

//     index++;

//     if (index >= text.length) {
//       clearInterval(typeWriterTimer);
//       typeWriterTimer = null;
//     }
//   }, speed);
// }

function updateDashboardFromSidebar() {
  const selectedAsset =
    document.querySelector('input[name="selectedAsset"]:checked')?.value || "BIST100";

  const selectedCurrency =
    document.querySelector('input[name="portfolioCurrency"]:checked')?.value || "USD";

  const selectedView =
    document.querySelector('input[name="currencyView"]:checked')?.value || "original";

  const selectedPrediction =
    document.querySelector(".prediction-window-grid button.active")?.innerText || "5 Days";

  const selectedRange =
    document.querySelector(".chart-range-grid button.active")?.innerText || "1M";

  const assetName = document.querySelector(".asset-name");
  const currencyText = document.querySelector(".currency");
  const priceText = document.querySelector(".price");
  const changeText = document.querySelector(".change");
  const chartTitle = document.querySelector(".big-chart .chart-title");
  const predictionPrice = document.querySelector(".prediction-price");
  const confidence = document.querySelector(".confidence");

  // if (assetName) assetName.textContent = selectedAsset;
  if (assetName) {
  assetName.textContent = selectedAsset;
}


  if (priceText) {
    priceText.textContent = "Loading...";
  }

  const isCurrencyPair = selectedAsset.includes("_");

if (currencyText) {
  // currencyText.textContent =
  //   isCurrencyPair
  //     ? getOriginalCurrency(selectedAsset)
  //     : selectedView === "local"
  //       ? selectedCurrency
  //       : getOriginalCurrency(selectedAsset);
  currencyText.textContent = getOriginalCurrency(selectedAsset);
}
 
//   if (predictionPrice) {
//     // predictionPrice.textContent =
//     //   `${selectedPrediction.replace("(Recommended)", "").trim()} Prediction`;
// const lang = localStorage.getItem("language") || "tr";

// predictionPrice.textContent =
//   lang === "tr"
//     ? "5 Günlük Pencere (Optimize) Tahmini"
//     : "5-Day Window (Optimized) Prediction";

//   }
  if (changeText) {
  changeText.textContent = "N/A";
  changeText.classList.remove("positive", "negative");
}

  if (confidence) {
   confidence.textContent =
  selectedView === "local"
    ? `Viewing in portfolio currency: ${selectedCurrency}`
    : `Viewing in original market currency: ${getOriginalCurrency(selectedAsset)}`;
  }

fetchAIPrediction(selectedAsset).then(() => {
     renderPriceChart(selectedAsset, selectedRange).then(() => {
  const currentLanguage = localStorage.getItem("language") || "tr";
  applyLanguage(currentLanguage);

 });

});

  localStorage.setItem("selectedAsset", selectedAsset);
localStorage.setItem("portfolioCurrency", selectedCurrency);

localStorage.setItem(
  "displayMode",
  selectedView === "local"
    ? "Local Value"
    : "Original Market"
);

localStorage.setItem(
  "predictionWindow",
  selectedPrediction
);
applyPreferencesToHomepage();

const currentLanguage = localStorage.getItem("language") || "tr";
applyLanguage(currentLanguage);
}

function getOriginalCurrency(asset) {
  const currencyMap = {
    BIST100: "TRY",
    BIST30: "TRY",
    TR10YT: "TRY",

    SP500: "USD",
    NASDAQ100: "USD",
    DJI: "USD",
    DOW: "USD",
    Gold: "USD",
    Silver: "USD",
    Brent: "USD",
    NaturalGas: "USD",
    Copper: "USD",
    US10YT: "USD",

    DAX: "EUR",
    CAC40: "EUR",

    FTSE100: "GBP",
    NIKKEI225: "JPY",
    HSI: "HKD",

    USD_TRY: "TRY",
    EUR_TRY: "TRY",
    GBP_TRY: "TRY",
    JPY_TRY: "TRY",
    HKD_TRY: "TRY",
    EUR_USD: "USD"
  };

   if (asset.includes("_")) {
    return asset.split("_")[1];
  }

  return currencyMap[asset] || "USD";
}


function loadSavedProfileImage() {
  const savedImage = localStorage.getItem("profileImage");

  if (savedImage) {
    document.getElementById("profileAvatar").innerHTML = `
      <img src="${savedImage}" alt="Profile Photo">
    `;

    document.getElementById("modalAvatar").innerHTML = `
      <img src="${savedImage}" alt="Profile Photo">
    `;
  }
}
function loadUserProfile() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser) return;

  document.getElementById("profileFullName").textContent =
    currentUser.username || "User Name";

  document.getElementById("profileUsername").textContent =
    currentUser.username || "-";

  document.getElementById("profileEmail").textContent =
    currentUser.email || "-";
}


function setupPasswordToggle() {
  document.addEventListener("click", function (event) {
    const toggleBtn = event.target.closest("#togglePassword");

    if (!toggleBtn) return;

    const passwordInput = document.getElementById("loginPassword");

    if (!passwordInput) return;

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      toggleBtn.innerHTML = `<svg class="icon icon-eye-slash"><use href="./assets/icons/symbol-defs3.svg#icon-eye"></use></svg>`;

    } else {
      passwordInput.type = "password";
      toggleBtn.innerHTML = `<svg class="icon icon-eye"><use href="./assets/icons/symbol-defs2.svg#icon-eye-slash"></use></svg>`;
    }
  });
}

function setupForgotPasswordNavigation() {
  document.addEventListener("click", function (event) {
    const forgotPasswordBtn = event.target.closest("#forgotPasswordBtn");
    const backToLoginFromForgot = event.target.closest("#backToLoginFromForgot");

    const loginPage = document.getElementById("loginPage");
    const forgotPageWrapper = document.getElementById("forgotPageWrapper");

    if (forgotPasswordBtn) {
      loginPage.style.display = "none";
      forgotPageWrapper.style.display = "block";
    }

    if (backToLoginFromForgot) {
      forgotPageWrapper.style.display = "none";
      loginPage.style.display = "block";
    }
  });
}

function setupPredictionModelChange() {
  document.addEventListener("change", function (event) {
    if (event.target.id !== "modelSelect") return;

    const selectedAsset =
      document.querySelector('input[name="selectedAsset"]:checked')?.value ||
      localStorage.getItem("selectedAsset") ||
      "Gold";

    fetchAIPrediction(selectedAsset);
  });
}

function setupLogin() {

  const loginForm = document.querySelector(".loginform");

  if (!loginForm) {
    console.error("loginForm bulunamadı");
    return;
  }

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    console.log("Login form çalıştı");

    const loginPage = document.getElementById("loginPage");
    const homepagePage = document.getElementById("homepagePage");

    const emailOrUsername = loginForm.querySelector('input[name="name"]')?.value.trim();
    const password = loginForm.querySelector('input[name="password"]')?.value.trim();

    if (!emailOrUsername || !password) {
      alert("Lütfen tüm alanları doldurun");
      return;
    }

    try {
      console.log("Fetch isteği atılıyor...");

      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          emailOrUsername,
          password
        })
      });

      console.log("Response geldi:", response);

      const data = await response.json();
      console.log("Backend cevabı:", data);

      if (!response.ok) {
        alert(data.message);   
        return;
      }

      alert(data.message);

      /* kullanıcıyı kaydet */
localStorage.setItem("currentUser", JSON.stringify(data.user));

/* profile bilgilerini yükle */
loadUserProfile();

      loginPage.style.display = "none";
      homepagePage.style.display = "block";

      applyPreferencesToHomepage();

// const selectedAsset =
// localStorage.getItem("selectedAsset")
// ||
// "BIST100";
const selectedAsset =
  localStorage.getItem("selectedAsset") || "Gold";


fetchAIPrediction(selectedAsset).then(() => {
Promise.resolve(renderPriceChart(selectedAsset, "1M")).then(() => {
  const currentLanguage = localStorage.getItem("language") || "tr";
  applyLanguage(currentLanguage);

     });
});

applyPreferencesToHomepage();

    } catch (error) {
      console.log(error);
      alert("Login sırasında hata oluştu");
    }
  });




//   const loginForm = document.querySelector(".loginform");
//   const loginPage = document.getElementById("loginPage");
//   const homepagePage = document.getElementById("homepagePage");

//   if (!loginForm) {
//     console.error("loginForm bulunamadı");
//     return;
//   }

//  loginForm.addEventListener("submit", async function (event) {
//   event.preventDefault();

//   const emailOrUsername = document.querySelector('input[name="name"]')?.value.trim();
//   const password = document.querySelector('input[name="password"]')?.value.trim();

//   if (!emailOrUsername || !password) {
//     alert("Lütfen tüm alanları doldurun");
//     return;
//   }

//   try {
//     const response = await fetch(`${API_URL}/api/login`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         emailOrUsername,
//         password
//       })
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       alert(data.message);
//       return;
//     }

//     alert(data.message);

//     loginPage.style.display = "none";
//     homepagePage.style.display = "block";

//     renderPriceChart();

//   } catch (error) {
//     console.log(error);
//     alert("Login sırasında hata oluştu");
//   }
// });
}

function setupSidebarDelegation() {
  document.addEventListener("click", function (event) {
    const openMenu = event.target.closest("#openMenu");
    const closeMenu = event.target.closest("#closeMenu");
    const overlayClick = event.target.closest("#overlay");

   
    if (!openMenu && !closeMenu && !overlayClick) return;

   const sidebar = document.querySelector("#homepagePage #sidebar");
const overlay = document.querySelector("#homepagePage #overlay");

if (!sidebar || !overlay) {
  console.warn("sidebar henüz yüklenmemiş olabilir");
  return;
}

    if (openMenu) {
      console.log("Menü açıldı");
      sidebar.classList.add("active");
      overlay.classList.add("show");
    }

    if (closeMenu || overlayClick) {
      console.log("Menü kapandı");
      sidebar.classList.remove("active");
      overlay.classList.remove("show");
    }
  });
}
function setupThemeToggle() {
  document.addEventListener("click", function (event) {
    const themeToggle = event.target.closest("#themeToggle");

    if (!themeToggle) return;

    document.body.classList.toggle("light-mode");

    if (document.body.classList.contains("light-mode")) {
      themeToggle.textContent = "☀️";
    } else {
      themeToggle.textContent = "🌙";
    }
    updateHomepageLogo();
    updateThemeStatus();
  });
}


function setupForgotPasswordSubmit() {
  let resetEmail = "";

  document.addEventListener("submit", async function (event) {
    const emailForm = event.target.closest("#forgotEmailForm");
    const resetForm = event.target.closest("#forgotResetForm");

    if (emailForm) {
      event.preventDefault();

      const email = emailForm.querySelector('input[name="email"]').value.trim();

      const response = await fetch(`${API_URL}/api/check-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      resetEmail = email;

      document.getElementById("forgotEmailForm").style.display = "none";
      document.getElementById("forgotResetForm").style.display = "flex";
      document.getElementById("forgotDescription").textContent =
        "Email verified. Create your new password.";

      return;
    }

    if (resetForm) {
      event.preventDefault();

      const newPassword = resetForm.querySelector('input[name="newPassword"]').value.trim();
      const confirmPassword = resetForm.querySelector('input[name="confirmPassword"]').value.trim();

      if (newPassword !== confirmPassword) {
        alert("Şifreler eşleşmiyor");
        return;
      }

      const response = await fetch(`${API_URL}/api/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: resetEmail,
          newPassword
        })
      });

      const data = await response.json();

      alert(data.message);

      if (response.ok) {
        document.getElementById("forgotPageWrapper").style.display = "none";
        document.getElementById("loginPage").style.display = "block";
      }
    }
  });
}

//BUTTON OLDUĞUNDA VARLIĞI TETİKLEME KODU:(dilekerz)
// document.body.addEventListener('click', (event) => {
//     // Tıklanan element bizim butonumuz mu kontrol et
//     if (event.target && event.target.classList.contains('predict-action-btn')) {
        
//         // Sol menüdeki seçili sembolü al
//         const selectedAssetNode = document.querySelector('input[name="selectedAsset"]:checked');
        
//         if (!selectedAssetNode) {
//             console.error("Hata: Seçili bir sembol bulunamadı veya input 'name' değeri uyuşmuyor.");
//             return;
//         }
        
//         // Tahmin fonksiyonunu tetikle
//         fetchAIPrediction(selectedAssetNode.value);
//     }
// });

async function fetchAIPrediction(symbol) {
    const predPriceEl = document.getElementById('pred-price');
    const realPriceEl = document.getElementById('real-price');
    const probEl = document.getElementById('price-diff');
    const valueBoxEl = document.getElementById('prediction-value-box');
    const predictedPriceEl = document.getElementById('predicted-price');
    const priceBandEl = document.getElementById('price-band');
    const reliabilityEl = document.getElementById('model-reliability');
const lang = localStorage.getItem("language") || "tr";
    // İstek atılırken ekranda görünecek yükleme durumu
    predPriceEl.textContent = 
     lang === "tr" ? "Hesaplanıyor..." : "Calculating...";
    predPriceEl.style.color = "";
    realPriceEl.textContent = "-";
    probEl.textContent = "-";
    valueBoxEl.style.display = "none";

    const modelSelectEl = document.getElementById('modelSelect');
    const modelType = modelSelectEl ? modelSelectEl.value : 'lstm';

    try {
        // Node.js backend'imize (3000 portu) istek atıyoruz
        const response = await fetch(`${API_URL}/api/prediction?symbol=${symbol}&model=${modelType}`);
        const data = await response.json();

        window.latestPredictionData = {
  symbol,
  direction: data.direction,
  probability: data.probability,
  real_price: data.real_price,
  predicted_price: data.predicted_price,
  price_band_low: data.price_band_low,
  price_band_high: data.price_band_high,
  model_mae: data.model_mae
};

        if(data.error) {
            predPriceEl.textContent = "Hata oluştu";
            console.error("Backend Hatası:", data.error);
            return;
        }

        const direction = data.direction;
        const realValue = data.real_price;
        const probability = data.probability;

        // Verileri arayüze basıyoruz
        const isUp = direction === "Yükseliş";

predPriceEl.textContent =
  lang === "tr"
    ? direction
    : isUp
      ? "Increase"
      : "Decrease";

predPriceEl.style.color = isUp ? "#00ff00" : "#ff4444";

        realPriceEl.textContent = `${realValue.toFixed(2)}`;
        probEl.textContent = `%${probability.toFixed(2)}`;

        // Bazı semboller için (yön doğruluğu yeterli bulunanlar) backend ayrıca
        // bir "Tahmini Değer" üretir. Bu alanlar yoksa kutu gizli kalır.
        if (data.predicted_price !== undefined) {
            predictedPriceEl.textContent = `${data.predicted_price.toFixed(2)}`;
            priceBandEl.textContent = `${data.price_band_low.toFixed(2)} - ${data.price_band_high.toFixed(2)}`;
            reliabilityEl.textContent = `%${(100 - data.model_mae).toFixed(2)}`;
            valueBoxEl.style.display = "block";
        }

    } catch (error) {
        console.error("Fetch Hatası:", error);
        predPriceEl.textContent = "Bağlantı Hatası!";
    }
}


initApp();