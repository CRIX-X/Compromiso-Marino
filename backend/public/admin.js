import { auth, db } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const btnUsuarios = document.getElementById("btnUsuarios");
const btnCompromisos = document.getElementById("btnCompromisos");
const adminResultado = document.getElementById("adminResultado");
const volverPerfil = document.getElementById("volverPerfil");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userRef = doc(db, "usuarios", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists() || userSnap.data().role !== "admin") {
    alert("Acceso denegado. Solo administradores.");
    window.location.href = "perfil.html";
    return;
  }
});

btnUsuarios.addEventListener("click", async () => {
  const usuariosSnap = await getDocs(collection(db, "usuarios"));

  let html = `
    <h2>Usuarios registrados</h2>
    <table>
      <tr>
        <th>Email</th>
        <th>Rol</th>
      </tr>
  `;

  usuariosSnap.forEach(doc => {
    const u = doc.data();

    html += `
      <tr>
        <td>${u.email}</td>
        <td>${u.role}</td>
      </tr>
    `;
  });

  html += `</table>`;
  adminResultado.innerHTML = html;
});

btnCompromisos.addEventListener("click", async () => {
  const res = await fetch("/compromisos");
  const data = await res.json();

  let html = `<h2>Compromisos publicados</h2>`;

  data.forEach(c => {
    html += `
      <div class="compromiso-admin">
        <p><strong>${c.userEmail}</strong></p>
        <p>${c.texto}</p>
        <button class="btnEliminar" data-id="${c._id}">
          Eliminar
        </button>
      </div>
    `;
  });

  adminResultado.innerHTML = html;

  document.querySelectorAll(".btnEliminar").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      await fetch(`/compromisos/${id}`, {
        method: "DELETE"
      });

      btn.parentElement.remove();
    });
  });
});

volverPerfil.addEventListener("click", () => {
  window.location.href = "perfil.html";
});