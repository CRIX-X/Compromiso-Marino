document.addEventListener("DOMContentLoaded", () => {

  import("./firebase.js").then(({ auth }) => {
    import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js").then(({ onAuthStateChanged, signOut }) => {

      /* =========================
         API BACKEND
      ========================= */
      const LOCAL = "http://localhost:5000";
      const PROD = "https://mi-proyecto.onrender.com"; // Cambia a tu URL de Render
      const API = window.location.hostname.includes("localhost") ? LOCAL : PROD;

      const form = document.getElementById("donacionForm");
      const lista = document.getElementById("listaDonaciones");
      const logoutBtn = document.getElementById("logoutBtn");

      const numero = document.getElementById("NumeroTarjeta");
      const nombre = document.getElementById("NombreCliente");
      const fecha = document.getElementById("Fecha");
      const cvvInput = document.getElementById("CVV");
      const card = document.getElementById("card");
      const montoInput = document.getElementById("MontoDinero");

      const modal = document.getElementById("modalConfirm");
      const btnSi = document.getElementById("btnSi");
      const btnNo = document.getElementById("btnNo");

      let email = null;
      let idAEliminar = null;

      /* =========================
          USUARIO
      ========================= */
      onAuthStateChanged(auth, (user) => {
        if (!user) {
          window.location.href = "login.html";
        } else {
          email = user.email.trim().toLowerCase();

          const usuarioSpan = document.getElementById("usuarioLogueado");
          if (usuarioSpan) {
            usuarioSpan.textContent = "👤 " + email;
          }

          cargarDonaciones();
        }
      });

      /* =========================
         TARJETA
      ========================= */

      numero?.addEventListener("input", () => {
        let valor = numero.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
        numero.value = valor;
        document.getElementById("cardNumber").textContent = valor || "#### #### #### ####";
      });

      nombre?.addEventListener("input", () => {
        document.getElementById("cardName").textContent = nombre.value || "NOMBRE";
      });

      fecha?.addEventListener("input", () => {
        let val = fecha.value.replace(/\D/g, "");
        if (val.length >= 3) val = val.slice(0,2) + "/" + val.slice(2,4);
        fecha.value = val;
        document.getElementById("cardDate").textContent = val || "MM/AA";
      });

      cvvInput?.addEventListener("focus", () => card.classList.add("flip"));
      cvvInput?.addEventListener("blur", () => card.classList.remove("flip"));

      cvvInput?.addEventListener("input", () => {
        cvvInput.value = cvvInput.value.replace(/\D/g, "").slice(0,3);
        document.getElementById("cardCVV").textContent = "***";
      });

      montoInput?.addEventListener("input", () => {
        montoInput.value = montoInput.value.replace(/[^0-9.]/g, "");
      });

      /* =========================
         VALIDACIONES
      ========================= */

      function luhn(numero) {
        let suma = 0, alt = false;
        for (let i = numero.length - 1; i >= 0; i--) {
          let n = parseInt(numero[i]);
          if (alt) { n *= 2; if (n > 9) n -= 9; }
          suma += n;
          alt = !alt;
        }
        return suma % 10 === 0;
      }

      function validar() {
        const numeroVal = numero.value.replace(/\s/g,"");
        const cvv = cvvInput.value;
        const org = document.getElementById("Organizacion").value;
        const monto = montoInput.value;

        if (!luhn(numeroVal)) return alert("Tarjeta inválida"), false;
        if (cvv.length !== 3) return alert("CVV inválido"), false;
        if (!org) return alert("Selecciona organización"), false;
        if (!monto || monto <= 0) return alert("Monto inválido"), false;

        return true;
      }

      /* =========================
         CARGAR
      ========================= */

      async function cargarDonaciones() {
        const res = await fetch(`${API}/donaciones/${email}`);
        const data = await res.json();
        lista.innerHTML = "";
        data.forEach(d => agregarDonacionLista(d));
      }

      /* =========================
         LISTA + MODAL
      ========================= */

      function agregarDonacionLista(d) {
        const li = document.createElement("li");

        li.innerHTML = `
          ${d.NombreCliente} - $${d.MontoDinero}
          <button class="cancelar">Cancelar</button>
        `;

        li.querySelector(".cancelar").onclick = () => {
          modal.style.display = "flex";
          idAEliminar = d._id;

          btnSi.onclick = async () => {
            await fetch(`${API}/donacion/${idAEliminar}`, { method: "DELETE" });
            li.innerHTML = `<span style="color:red;">❌ Cancelado</span>`;
            modal.style.display = "none";
          };

          btnNo.onclick = () => {
            modal.style.display = "none";
          };
        };

        lista.prepend(li);
      }

      /* =========================
         GUARDAR
      ========================= */

      form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!validar()) return;

        const nuevaDonacion = {
          NombreCliente: nombre.value,
          Organizacion: document.getElementById("Organizacion").value,
          MontoDinero: parseFloat(montoInput.value),
          userEmail: email
        };

        const res = await fetch(`${API}/donacion`, {
          method: "POST",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify(nuevaDonacion)
        });

        const data = await res.json();
        agregarDonacionLista(data);

        mostrarExito();
        form.reset();

        document.getElementById("cardNumber").textContent = "#### #### #### ####";
        document.getElementById("cardName").textContent = "NOMBRE";
        document.getElementById("cardDate").textContent = "MM/AA";
        document.getElementById("cardCVV").textContent = "***";

        card.classList.remove("flip");
      });

      /* =========================
         UI
      ========================= */

      function mostrarExito() {
        const msg = document.getElementById("successMsg");
        if(msg) msg.style.display = "block";
        setTimeout(() => msg.style.display = "none", 2000);
      }

      /* =========================
         LOGOUT
      ========================= */
      logoutBtn?.addEventListener("click", () => {
        signOut(auth)
          .then(() => window.location.href = "login.html")
          .catch(err => {
            console.error("Error al cerrar sesión:", err);
            alert("No se pudo cerrar sesión. Intenta de nuevo.");
          });
      });

      document.getElementById("homeBtn")?.addEventListener("click", () => {
        window.location.href = "index.html";
      });

    });
  });
});