/* =========================================
   BAHASA
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
  },
};

/* =========================================
   AMBIL BAHASA
========================================= */

const selectedLanguage = localStorage.getItem("baworLanguage") || "id";

const lang = languageData[selectedLanguage];

/* =========================================
   TERAPKAN BAHASA
========================================= */

document.documentElement.lang = selectedLanguage;

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

const password = document.getElementById("password");

const passwordToggle = document.getElementById("passwordToggle");

passwordToggle.addEventListener("click", function () {
  if (password.type === "password") {
    password.type = "text";
  } else {
    password.type = "password";
  }
});

/* =========================================
   LOGIN FORM
========================================= */

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();

  const passwordValue = document.getElementById("password").value.trim();

  /* Validasi */

  if (email === "" || passwordValue === "") {
    alert(lang.required);

    return;
  }

  /*
            FRONTEND SAJA

            Nantinya bagian ini bisa
            dihubungkan dengan PHP/MySQL,
            Laravel, Firebase, atau backend
            lainnya.
        */

  alert(lang.success);
});
