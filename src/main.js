
 import "./css/styles.css";
 import { renderPriceChart } from './charts.js';

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
    const loginHtml = await loadPartial("./src/partials/login.html");
    const homepageHtml = await loadPartial("./src/partials/homepage.html");
    
    const registerHtml = await loadPartial("./src/partials/create-account.html");
const profileHtml = await loadPartial("./src/partials/profile.html");
const forgotHtml = await loadPartial("./src/partials/forgot-password.html");

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
    updateThemeStatus();

  } catch (error) {
    console.error("Yükleme hatası:", error);
    app.innerHTML = `<p style="color:white;">İçerik yüklenemedi.</p>`;
  }
}

function updateHomepageLogo() {
  const homepageLogo = document.getElementById("homepage-logo"); // ✅ BURAYA AL

  if (!homepageLogo) return;

  const isLight = document.body.classList.contains("light-mode");

  homepageLogo.src = isLight
    ? "/assets/logos/logo-light.png"
    : "/assets/logos/logo-dark.png";
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
    }
  });
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
      "http://localhost:3000/api/register",
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
  const loginPage = document.getElementById("loginPage");
  const homepagePage = document.getElementById("homepagePage");

  if (!loginForm) {
    console.error("loginForm bulunamadı");
    return;
  }

 loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const emailOrUsername = document.querySelector('input[name="name"]')?.value.trim();
  const password = document.querySelector('input[name="password"]')?.value.trim();

  if (!emailOrUsername || !password) {
    alert("Lütfen tüm alanları doldurun");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        emailOrUsername,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    alert(data.message);

    loginPage.style.display = "none";
    homepagePage.style.display = "block";

    renderPriceChart();

  } catch (error) {
    console.log(error);
    alert("Login sırasında hata oluştu");
  }
});
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

      const response = await fetch("http://localhost:3000/api/check-email", {
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

      const response = await fetch("http://localhost:3000/api/reset-password", {
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