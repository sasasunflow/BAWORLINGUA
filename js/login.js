/* =========================================
   DATA BAHASA
========================================= */

const languageData = {
  id: {
    title: "Masuk ke BaworLingua",

    emailLabel: "Email",

    emailPlaceholder: "Masukkan email kamu",

    passwordLabel: "Password",

    passwordPlaceholder: "Masukkan password kamu",

    forgotPassword: "Lupa password?",

    remember: "Ingat saya",

    login: "Masuk",

    divider: "atau masuk dengan",

    google: "Masuk dengan Google",

    emailLogin: "Masuk dengan Email",

    registerQuestion: "Belum punya akun?",

    register: "Daftar sekarang",

    required: "Email dan password harus diisi.",

    success: "Login berhasil!",

    showPassword: "Tampilkan password",

    hidePassword: "Sembunyikan password",
  },

  en: {
    title: "Sign In to BaworLingua",

    emailLabel: "Email",

    emailPlaceholder: "Enter your email",

    passwordLabel: "Password",

    passwordPlaceholder: "Enter your password",

    forgotPassword: "Forgot password?",

    remember: "Remember me",

    login: "Sign In",

    divider: "or sign in with",

    google: "Sign in with Google",

    emailLogin: "Sign in with Email",

    registerQuestion: "Don't have an account?",

    register: "Sign up now",

    required: "Email and password are required.",

    success: "Login successful!",

    showPassword: "Show password",

    hidePassword: "Hide password",
  },
};

/* =========================================
   AMBIL BAHASA DARI LOCAL STORAGE
========================================= */

let selectedLanguage = localStorage.getItem("baworLanguage");

/*
   Jika belum memilih bahasa,
   gunakan Bahasa Indonesia.
*/

if (selectedLanguage !== "id" && selectedLanguage !== "en") {
  selectedLanguage = "id";
}

const lang = languageData[selectedLanguage];

/* =========================================
   SET LANGUAGE HTML
========================================= */

document.documentElement.lang = selectedLanguage;

/* =========================================
   TERAPKAN BAHASA
========================================= */

document.title = lang.title;

document.getElementById("login-title").textContent = lang.title;

document.getElementById("email-label").textContent = lang.emailLabel;

document.getElementById("email").placeholder = lang.emailPlaceholder;

document.getElementById("password-label").textContent = lang.passwordLabel;

document.getElementById("password").placeholder = lang.passwordPlaceholder;

document.getElementById("forgot-password").textContent = lang.forgotPassword;

document.getElementById("remember-label").textContent = lang.remember;

document.getElementById("login-button").textContent = lang.login;

document.getElementById("divider-text").textContent = lang.divider;

document.getElementById("google-text").textContent = lang.google;

document.getElementById("email-login-text").textContent = lang.emailLogin;

document.getElementById("register-question").textContent =
  lang.registerQuestion;

document.getElementById("register-link").innerHTML =
  lang.register + " <span>›</span>";

/* =========================================
   SHOW / HIDE PASSWORD
========================================= */

const passwordInput = document.getElementById("password");

const passwordToggle = document.getElementById("passwordToggle");

passwordToggle.addEventListener("click", function () {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";

    passwordToggle.setAttribute("aria-label", lang.hidePassword);
  } else {
    passwordInput.type = "password";

    passwordToggle.setAttribute("aria-label", lang.showPassword);
  }
});

/* =========================================
   REMEMBER ME
========================================= */

const rememberCheckbox = document.getElementById("remember");

const savedEmail = localStorage.getItem("baworRememberEmail");

if (savedEmail) {
  document.getElementById("email").value = savedEmail;

  rememberCheckbox.checked = true;
}

rememberCheckbox.addEventListener("change", function () {
  const email = document.getElementById("email").value.trim();

  if (this.checked && email) {
    localStorage.setItem("baworRememberEmail", email);
  } else {
    localStorage.removeItem("baworRememberEmail");
  }
});

/* =========================================
   LOGIN FORM
========================================= */

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();

  const password = document.getElementById("password").value.trim();

  /* ===============================
           VALIDASI
        ================================ */

  if (email === "" || password === "") {
    alert(lang.required);

    return;
  }

  /* ===============================
           REMEMBER EMAIL
        ================================ */

  if (rememberCheckbox.checked) {
    localStorage.setItem("baworRememberEmail", email);
  } else {
    localStorage.removeItem("baworRememberEmail");
  }

  /* ===============================
           FRONTEND TEST
        ================================ */

  alert(lang.success);

  /*
           Nanti bagian ini bisa
           diarahkan ke dashboard:

           window.location.href =
               "dashboard.html";
        */
});
