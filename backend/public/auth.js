import { auth, db } from "./firebase.js";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { 
  doc, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* =========================
   MENSAJES BONITOS
========================= */
function mostrarMensaje(texto, tipo = "error") {

  const div = document.getElementById("mensaje");
  if (!div) return;

  div.textContent = texto;
  div.className = "mensaje " + tipo;
  div.style.display = "block";

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

const privacyCheck = document.getElementById("privacyCheck");

if (!privacyCheck || !privacyCheck.checked) {
  mostrarMensaje("📄 Debes aceptar el Aviso de Privacidad");
  return;
}

  try {
const userCredential = await createUserWithEmailAndPassword(auth, email, password);

await setDoc(doc(db, "usuarios", userCredential.user.uid), {
  email: userCredential.user.email,
  role: "usuario",
  fechaRegistro: new Date()
});

mostrarMensaje("✅ Registro exitoso", "exito");

setTimeout(() => {
  window.location.href = "login.html";
}, 1500);

  } catch (error) {

    if (error.code === "auth/email-already-in-use") {
      mostrarMensaje("❌ Este correo ya está registrado");
    }
    else if (error.code === "auth/weak-password") {
      mostrarMensaje("🔒 La contraseña es demasiado débil");
    }
    else if (error.code === "auth/invalid-email") {
      mostrarMensaje("📧 Correo inválido");
    }
    else {
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

  } catch (error) {

    if (error.code === "auth/user-not-found") {
      mostrarMensaje("❌ Correo no registrado");
    }
    else if (error.code === "auth/wrong-password") {
      mostrarMensaje("❌ Contraseña incorrecta");
    }
    else if (error.code === "auth/invalid-email") {
      mostrarMensaje("📧 Correo inválido");
    }
    else {
      mostrarMensaje("❌ Error al iniciar sesión");
    }

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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    mostrarMensaje("📧 Correo inválido");
    return;
  }

  try {

    await sendPasswordResetEmail(auth, email);

    mostrarMensaje("📩 Si el correo existe, se enviará un enlace de recuperación", "exito");

  } catch (error) {

    if (error.code === "auth/invalid-email") {
      mostrarMensaje("📧 Correo inválido");
    }
    else if (error.code === "auth/missing-email") {
      mostrarMensaje("📧 Escribe un correo");
    }
    else {
      mostrarMensaje("❌ Error al enviar correo");
      console.error(error);
    }

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

/* =========================
   INDICADOR DE FUERZA
========================= */
const passwordField = document.getElementById("password");

if(passwordField){

passwordField.addEventListener("input", ()=>{

  const value = passwordField.value;

  let strength = 0;

  const ruleLength = document.getElementById("ruleLength");
  const ruleUpper = document.getElementById("ruleUpper");
  const ruleLower = document.getElementById("ruleLower");
  const ruleNumber = document.getElementById("ruleNumber");
  const ruleSymbol = document.getElementById("ruleSymbol");

  if(value.length >= 8){
    strength++;
    if(ruleLength){
      ruleLength.textContent = "✔ 8 caracteres mínimo";
      ruleLength.style.color = "lightgreen";
    }
  }else{
    if(ruleLength){
      ruleLength.textContent = "❌ 8 caracteres mínimo";
      ruleLength.style.color = "#ddd";
    }
  }

  if(/[A-Z]/.test(value)){
    strength++;
    if(ruleUpper){
      ruleUpper.textContent = "✔ Una letra MAYÚSCULA";
      ruleUpper.style.color = "lightgreen";
    }
  }else{
    if(ruleUpper){
      ruleUpper.textContent = "❌ Una letra MAYÚSCULA";
      ruleUpper.style.color = "#ddd";
    }
  }

  if(/[a-z]/.test(value)){
    strength++;
    if(ruleLower){
      ruleLower.textContent = "✔ Una letra minúscula";
      ruleLower.style.color = "lightgreen";
    }
  }else{
    if(ruleLower){
      ruleLower.textContent = "❌ Una letra minúscula";
      ruleLower.style.color = "#ddd";
    }
  }

  if(/[0-9]/.test(value)){
    strength++;
    if(ruleNumber){
      ruleNumber.textContent = "✔ Un número";
      ruleNumber.style.color = "lightgreen";
    }
  }else{
    if(ruleNumber){
      ruleNumber.textContent = "❌ Un número";
      ruleNumber.style.color = "#ddd";
    }
  }

  if(/[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\\/]/.test(value)){
    strength++;
    if(ruleSymbol){
      ruleSymbol.textContent = "✔ Un símbolo";
      ruleSymbol.style.color = "lightgreen";
    }
  }else{
    if(ruleSymbol){
      ruleSymbol.textContent = "❌ Un símbolo";
      ruleSymbol.style.color = "#ddd";
    }
  }

  const bar = document.getElementById("passwordStrengthBar");

  if(bar){

    const percent = (strength/5)*100;

    bar.style.width = percent+"%";

    if(strength <=1){
      bar.style.background = "red";
    }
    else if(strength ==2){
      bar.style.background = "orange";
    }
    else if(strength ==3){
      bar.style.background = "yellow";
    }
    else if(strength ==4){
      bar.style.background = "#7CFC00";
    }
    else{
      bar.style.background = "limegreen";
    }

  }

});

}
