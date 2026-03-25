import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* ===== ELEMENTOS ===== */
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userEmail = document.getElementById("userEmail");
const lista = document.getElementById("listaCompromisos");
const input = document.getElementById("inputCompromiso");
const btnAgregar = document.getElementById("btnAgregar");
const btnCurioso = document.getElementById("btnCurioso");
const datoCurioso = document.getElementById("datoCurioso");
const listaCampañas = document.getElementById("listaCampañas") || document.createElement("div");

/* ===== SESIÓN ===== */
onAuthStateChanged(auth, (user) => {
    if (user) {
        loginBtn.style.display = "none";
        registerBtn.style.display = "none";
        userEmail.style.display = "inline-block";
        logoutBtn.style.display = "inline-block";
        userEmail.textContent = "👤 " + user.email;
    } else {
        loginBtn.style.display = "inline-block";
        registerBtn.style.display = "inline-block";
        userEmail.style.display = "none";
        logoutBtn.style.display = "none";
    }
});

/* ===== LOGOUT ===== */
logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
});

/* ===== CARGAR COMPROMISOS ===== */
window.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch("/compromisos");
        const data = await res.json();
        lista.innerHTML = "";

        data.forEach(c => {
            const li = document.createElement("li");
            li.textContent = c.userEmail + ": " + c.texto;
            li.style.opacity = "0";
            li.style.transform = "translateY(30px) scale(0.9)";
            lista.appendChild(li);

            setTimeout(() => {
                li.style.opacity = "1";
                li.style.transform = "translateY(0) scale(1)";
            }, 50);
        });
    } catch (error) {
        console.error("Error al cargar compromisos:", error);
    }
});

/* ===== AGREGAR COMPROMISO ===== */
btnAgregar.addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) { 
        alert("Inicia sesión primero"); 
        return; 
    }

    const texto = input.value.trim();
    if (!texto) { 
        alert("Escribe algo"); 
        return; 
    }

    const li = document.createElement("li");
    li.textContent = user.email + ": " + texto;
    li.style.opacity = "0";
    li.style.transform = "translateY(30px) scale(0.9)";
    lista.appendChild(li);

    setTimeout(() => {
        li.style.opacity = "1";
        li.style.transform = "translateY(0) scale(1)";
    }, 50);

    lista.scrollTop = lista.scrollHeight;
    input.value = "";

    try {
        await fetch("/compromisos", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ userEmail: user.email, texto })
        });
    } catch (error) {
        console.error("Error al guardar:", error);
    }
});

/* ===== DATOS CURIOSOS ===== */
const datosCuriosos = [
    "El océano cubre más del 70% de la superficie de la Tierra.",
    "Los corales pueden vivir más de 4.000 años.",
    "El tiburón ballena es el pez más grande del mundo.",
    "Más del 8 millones de toneladas de plástico llegan al océano cada año.",
    "Algunos peces pueden cambiar de sexo durante su vida.",
    "Los pulpos tienen tres corazones y sangre azul.",
    "Se han descubierto más de 230.000 especies marinas hasta ahora.",
    "Los caballitos de mar son los únicos animales donde el macho queda embarazado."
];

btnCurioso.addEventListener("click", () => {
    const random = datosCuriosos[Math.floor(Math.random() * datosCuriosos.length)];
    datoCurioso.textContent = `🧠 ${random}`;
});