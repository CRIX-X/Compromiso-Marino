import { auth } from "./firebase.js";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* =========================
   MENSAJES BONITOS
========================= */
function mostrarMensaje(texto, tipo = "error") {
  const div = document.getElementById("mensaje");
  if (!div) return;

  div.textContent = texto;
  div.className = "mensaje " + tipo;
  div.style.display = "block";

  // Ocultar mensaje después de 3 segundos
  setTimeout(() => {
    div.style.display = "none";
  }, 3000);
}

/* =========================
   REGISTRO
========================= */
async function registrar() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirmPassword")?.value.trim();

  if (!email || !password || !confirmPassword) {
    mostrarMensaje("⚠️ Completa todos los campos");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    mostrarMensaje("📧 Ingresa un correo válido");
    return;
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(password)) {
    mostrarMensaje("🔒 La contraseña debe tener mínimo 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos.");
    return;
  }

  if (password !== confirmPassword) {
    mostrarMensaje("❌ Las contraseñas no coinciden");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    mostrarMensaje("✅ Registro exitoso", "exito");

    setTimeout(() => {
      window.location.href = "login.html";
    }, 1500);
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      mostrarMensaje("❌ Este correo ya está registrado");
    } else if (error.code === "auth/weak-password") {
      mostrarMensaje("🔒 La contraseña es demasiado débil");
    } else if (error.code === "auth/invalid-email") {
      mostrarMensaje("📧 Correo inválido");
    } else {
      mostrarMensaje("❌ Error: " + error.message);
    }
  }
}

/* =========================
   LOGIN
========================= */
async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    mostrarMensaje("⚠️ Completa todos los campos");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    mostrarMensaje("📧 Correo inválido");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    mostrarMensaje("✅ Login correcto", "exito");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  } catch {
    mostrarMensaje("❌ Correo o contraseña incorrectos");
  }
}

/* =========================
   RECUPERAR CONTRASEÑA
========================= */
document.getElementById("recuperar")?.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();

  if (!email) {
    mostrarMensaje("📧 Escribe tu correo primero");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    mostrarMensaje("📩 Correo enviado", "exito");
  } catch {
    mostrarMensaje("❌ Error al enviar correo");
  }
});

/* =========================
   BOTONES
========================= */
document.getElementById("loginBtn")?.addEventListener("click", login);
document.getElementById("registerBtn")?.addEventListener("click", registrar);

/* =========================
   LOGOUT
========================= */
window.logout = async function () {
  await signOut(auth);
  window.location.href = "login.html";
};

/* =========================
   BOTÓN IR AL INICIO
========================= */
document.getElementById("homeBtn")?.addEventListener("click", () => {
  window.location.href = "index.html";
});

/* =========================
   MOSTRAR / OCULTAR PASSWORD
========================= */
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

if (togglePassword && passwordInput) {
  togglePassword.addEventListener("click", () => {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    togglePassword.textContent = type === "password" ? "👁" : "🙈";
  });
}

/* =========================
   CONFIRM PASSWORD
========================= */
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");

if (toggleConfirmPassword && confirmPasswordInput) {
  toggleConfirmPassword.addEventListener("click", () => {
    const type = confirmPasswordInput.type === "password" ? "text" : "password";
    confirmPasswordInput.type = type;
    toggleConfirmPassword.textContent = type === "password" ? "👁" : "🙈";
  });
}