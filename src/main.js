
 import "./css/styles.css";
 import { renderPriceChart } from './charts.js';
//  const API_URL = "https://stock-tracking-system-production.up.railway.app"; RAİLWAY ÇALIŞMAZSA ALTTAKİ LOCALHOST ÇALIŞTIR
const API_URL = "http://localhost:3000";

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
    setupSidebarSelections();
    applyPreferencesToHomepage();

  } catch (error) {
    console.error("Yükleme hatası:", error);
    app.innerHTML = `<p style="color:white;">İçerik yüklenemedi.</p>`;
  }
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

  themeStatus.textContent =
    document.body.classList.contains("light-mode")
      ? "Light Mode"
      : "Dark Mode";
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

      if (menu.id === "assetMenu") {
        document.getElementById("profilePreferredAsset").textContent = value;
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
  if (currency) currency.textContent = portfolioCurrency;

  if (predictionTitle) {
    predictionTitle.textContent = `${predictionWindow} Prediction`;
  }

  if (chartTitle) {
    chartTitle.textContent = `${selectedAsset} Price Chart • 1M • ${displayMode}`;
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

function setupSidebarSelections() {
  document.addEventListener("click", function (event) {

    const currency = event.target.closest(".currency-option");
    if (currency) {
      document.querySelectorAll(".currency-option").forEach(item => {
        item.classList.remove("active");
      });

      currency.classList.add("active");
      currency.querySelector("input").checked = true;
      updateDashboardFromSidebar();
    }

    const market = event.target.closest(".market-item");
    if (market) {
      document.querySelectorAll(".market-item").forEach(item => {
        item.classList.remove("active");
        item.querySelectorAll("strong").forEach(badge => badge.remove());
      });

      market.classList.add("active");
      market.querySelector("input").checked = true;

      const selectedBadge = document.createElement("strong");
      selectedBadge.textContent = "Selected";
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

      if (linkText.includes("Predictions Details")) {
        infoTitle.textContent = "Prediction Details";
        infoText.textContent =
          "The prediction result is generated using the selected asset, technical indicators, chart data and prediction window.";
      }

      if (linkText.includes("About Model")) {
        infoTitle.textContent = "About Model";
        infoText.textContent =
          "This system uses a hybrid LSTM + XGBoost model. LSTM analyzes time-based price movements, while XGBoost supports decision-making with technical indicators.";
      }

      if (linkText.includes("Disclaimer")) {
        infoTitle.textContent = "Disclaimer";
        infoText.textContent =
          "This application provides AI-based financial predictions for informational purposes only. It is not investment advice.";
      }
    }

    const closeInfoBox = event.target.closest("#closeInfoBox");
    if (closeInfoBox) {
      document.getElementById("sidebarInfoBox").classList.remove("active");
    }
  });
}


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
  assetName.textContent =
 localStorage.getItem("selectedAsset") || selectedAsset;
}

  if (currencyText) {
    // currencyText.textContent =
    //   selectedView === "local" ? selectedCurrency : getOriginalCurrency(selectedAsset);
currencyText.textContent =
localStorage.getItem("portfolioCurrency")
||
(selectedView === "local"
? selectedCurrency
: getOriginalCurrency(selectedAsset));

  }

  if (priceText) {
    priceText.textContent = "Loading...";
  }

  if (chartTitle) {
    chartTitle.textContent =
      `${selectedAsset} Price Chart • ${selectedRange} • ${
        selectedView === "local"
          ? selectedCurrency + " View"
          : "Original Market View"
      }`;
  }

  if (predictionPrice) {
    // predictionPrice.textContent =
    //   `${selectedPrediction.replace("(Recommended)", "").trim()} Prediction`;
predictionPrice.textContent =
`${localStorage.getItem("predictionWindow") || selectedPrediction} Prediction`;

  }
  if (changeText) {
  changeText.textContent = "N/A";
  changeText.classList.remove("positive", "negative");
}

  if (confidence) {
    confidence.textContent =
      `Selected view: ${selectedView === "local" ? selectedCurrency : "Original Currency"}`;
  }
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

const selectedAsset =
localStorage.getItem("selectedAsset")
||
"BIST100";

renderPriceChart(selectedAsset);
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

initApp();