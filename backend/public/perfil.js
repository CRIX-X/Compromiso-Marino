import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const perfilEmail = document.getElementById("perfilEmail");
const perfilRole = document.getElementById("perfilRole");
const logoutPerfil = document.getElementById("logoutPerfil");
const fechaRegistro = document.getElementById("fechaRegistro");
const adminOpciones = document.getElementById("adminOpciones");
const btnIrAdmin = document.getElementById("btnIrAdmin");
const misCompromisos = document.getElementById("misCompromisos");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Debes iniciar sesión.");
    window.location.href = "login.html";
    return;
  }

  perfilEmail.textContent = user.email;

  const userRef = doc(db, "usuarios", user.uid);
  const userSnap = await getDoc(userRef);

 if (userSnap.exists()) {

  const datos = userSnap.data();

  perfilRole.textContent = datos.role || "usuario";

if (datos.role === "admin") {
  adminOpciones.style.display = "block";
} else {
  adminOpciones.style.display = "none";
}


  if (datos.fechaRegistro) {

    if (typeof datos.fechaRegistro.toDate === "function") {

      fechaRegistro.textContent =
        datos.fechaRegistro.toDate().toLocaleDateString("es-MX");

    } else {

      fechaRegistro.textContent = datos.fechaRegistro;

    }

  } else {

    fechaRegistro.textContent = "No disponible";

  }

} else {

  perfilRole.textContent = "usuario";
  fechaRegistro.textContent = "No disponible";

}
cargarMisCompromisos(user.email);
});

logoutPerfil.addEventListener("click", async () => {
  await signOut(auth);
  localStorage.removeItem("role");
  window.location.href = "login.html";
});
async function cargarMisCompromisos(email) {
  try {
    const res = await fetch("/compromisos");
    const data = await res.json();

    const misDatos = data.filter(c => c.userEmail === email);

    misCompromisos.innerHTML = "";

    if (misDatos.length === 0) {
      misCompromisos.innerHTML = "<li>No tienes compromisos registrados.</li>";
      return;
    }

    misDatos.forEach(c => {
      const li = document.createElement("li");
const span = document.createElement("span");
span.textContent = c.texto;

const btnEditar = document.createElement("button");
btnEditar.textContent = "Editar";
btnEditar.addEventListener("click", () => {
  editarCompromiso(c._id, c.texto);
});

const btnEliminar = document.createElement("button");
btnEliminar.textContent = "Eliminar";
btnEliminar.addEventListener("click", () => {
  eliminarCompromiso(c._id);
});

const acciones = document.createElement("div");

acciones.appendChild(btnEditar);
acciones.appendChild(btnEliminar);

li.appendChild(span);
li.appendChild(acciones);

      misCompromisos.appendChild(li);
      
    });

  } catch (error) {
    misCompromisos.innerHTML = "<li>Error al cargar compromisos.</li>";
  }
}

window.eliminarCompromiso = function(id) {
  mostrarModal(
    "Eliminar compromiso",
    "¿Seguro que deseas eliminar este compromiso?",
    async (respuesta) => {

      if (!respuesta) return;

      try {
        await fetch(`/compromisos/${id}`, {
          method: "DELETE"
        });

        location.reload();

      } catch (error) {
        mostrarModal(
          "Error",
          "No se pudo eliminar el compromiso.",
          () => {}
        );
      }
    }
  );
};
window.editarCompromiso = function(id, textoActual) {
  const modalEditar = document.getElementById("modalEditar");
  const textoEditar = document.getElementById("textoEditar");
  const guardarEdicion = document.getElementById("guardarEdicion");
  const cancelarEdicion = document.getElementById("cancelarEdicion");

  textoEditar.value = textoActual;
  modalEditar.style.display = "flex";

  guardarEdicion.onclick = async () => {
    const nuevoTexto = textoEditar.value.trim();

    if (!nuevoTexto) {
      mostrarModal("Aviso", "El compromiso no puede estar vacío.", () => {});
      return;
    }

    try {
      await fetch(`/compromisos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          texto: nuevoTexto
        })
      });

      modalEditar.style.display = "none";
      location.reload();

    } catch (error) {
      mostrarModal("Error", "No se pudo editar el compromiso.", () => {});
    }
  };

  cancelarEdicion.onclick = () => {
    modalEditar.style.display = "none";
  };
};
function mostrarModal(titulo, texto, callback){
  const modal = document.getElementById("modal");
  const modalTitulo = document.getElementById("modalTitulo");
  const modalTexto = document.getElementById("modalTexto");
  const aceptar = document.getElementById("modalAceptar");
  const cancelar = document.getElementById("modalCancelar");

  modalTitulo.textContent = titulo;
  modalTexto.textContent = texto;

  modal.style.display = "flex";

  aceptar.onclick = () => {
    modal.style.display = "none";
    callback(true);
  };

  cancelar.onclick = () => {
    modal.style.display = "none";
    callback(false);
  };
}
const volverInicio = document.getElementById("volverInicio");

volverInicio?.addEventListener("click", () => {
  window.location.href = "index.html";
});
btnIrAdmin?.addEventListener("click", () => {
  window.location.href = "admin.html";
});