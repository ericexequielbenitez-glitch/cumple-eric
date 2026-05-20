import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBNj2P1En2CJwkOHYBD4ipYeOnDBc7no1w",
  authDomain: "cumpleeric.firebaseapp.com",
  projectId: "cumpleeric",
  storageBucket: "cumpleeric.firebasestorage.app",
  messagingSenderId: "279643487809",
  appId: "1:279643487809:web:caa2e7c9a0dee2ba3a90c0"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

const BASE_URL = "https://cumple-eric.vercel.app";

let allRespuestas = [];
let filtroActivo  = "todos";

// ── Cargar respuestas ──
async function cargarRespuestas() {
  try {
    const snapshot = await getDocs(collection(db, "respuestas"));
    allRespuestas = [];
    snapshot.forEach(doc => {
      allRespuestas.push({ id: doc.id, ...doc.data() });
    });
    renderStats(allRespuestas);
    renderRespuestas(allRespuestas, filtroActivo);
  } catch (err) {
    console.error("Error cargando respuestas:", err);
    document.getElementById("respuestas").innerHTML =
      `<div class="empty-state">Error al cargar respuestas.<br><small>${err.message}</small></div>`;
  }
}

// ── Stats ──
function renderStats(data) {
  const asisten   = data.filter(d => d.asistencia).length;
  const noAsisten = data.filter(d => !d.asistencia).length;
  document.getElementById("total").textContent      = data.length;
  document.getElementById("asisten").textContent    = asisten;
  document.getElementById("no-asisten").textContent = noAsisten;
}

// ── Render tarjetas ──
function renderRespuestas(data, filtro) {
  const container = document.getElementById("respuestas");

  const filtered = filtro === "todos"
    ? data
    : data.filter(d => d.evento === filtro);

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state">Sin respuestas aún${filtro !== "todos" ? " para este evento" : ""}.</div>`;
    return;
  }

  const labels = { amigos: "Amigos · 21/05", trabajo: "Trabajo · 22/05" };

  container.innerHTML = filtered.map(d => {
    const fecha = d.fecha
      ? new Date(d.fecha).toLocaleDateString("es-AR", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" })
      : "";
    const eventoLabel = labels[d.evento] || d.evento;

    return `
      <div class="response-card">
        <div>
          <h3>${escapeHtml(d.nombre || "—")}</h3>
          <p class="response-meta">${eventoLabel} · ${fecha}</p>
          ${d.mensaje ? `<p class="response-meta" style="margin-top:8px;font-style:italic;">"${escapeHtml(d.mensaje)}"</p>` : ""}
        </div>
        <span class="badge ${d.asistencia ? "badge-si" : "badge-no"}">
          ${d.asistencia ? "ASISTE" : "NO ASISTE"}
        </span>
      </div>
    `;
  }).join("");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;");
}

// ── Filtros ──
document.querySelectorAll(".filter-tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    filtroActivo = btn.dataset.filter;
    renderRespuestas(allRespuestas, filtroActivo);
  });
});

// ── Generar link ──
const infoEventos = {
  amigos:  { fecha: "Jueves 21 de mayo", hora: "21:00 hs", lugar: "Bricks Coffee & Food, Corrientes 366" },
  trabajo: { fecha: "viernes 22 de mayo", hora: "21:00 hs", lugar: "Bricks Coffee & Food, Corrientes 366" }
};

document.getElementById("generar-link").addEventListener("click", () => {
  const nombre = document.getElementById("nombre-input").value.trim();
  if (!nombre) { document.getElementById("nombre-input").focus(); return; }
  const evento = document.getElementById("evento-select").value;
  const link   = `${BASE_URL}/?evento=${evento}&nombre=${encodeURIComponent(nombre)}`;
  const info   = infoEventos[evento];

  const linkResult    = document.getElementById("link-result");
  const linkContainer = document.getElementById("link-container");
  linkResult.value            = link;
  linkContainer.style.display = "block";

  // ── Mensaje WhatsApp ──
  const msg = `🎂 *¡Hola ${nombre}!*

Te invito a festejar mis 26 años 🥂

📅 *Fecha:* ${info.fecha}
⏰ *Horario:* ${info.hora}
📍 *Lugar:* ${info.lugar}

Confirmá tu asistencia desde el link 👇
${link}

*Tené en cuenta:*
⏰ Se requiere puntualidad
🍻 El consumo en el bar no está cubierto (cada uno paga lo que consume)

¡Espero verte ahí! ✨`;

  document.getElementById("whatsapp-msg").value = msg;
});

// ── Copiar link ──
document.getElementById("copy-btn").addEventListener("click", () => {
  const val = document.getElementById("link-result").value;
  if (!val) return;
  navigator.clipboard.writeText(val).then(() => {
    const btn = document.getElementById("copy-btn");
    btn.textContent = "COPIADO ✓";
    setTimeout(() => btn.textContent = "COPIAR", 2000);
  });
});

// ── Copiar mensaje WhatsApp ──
document.getElementById("copy-wa").addEventListener("click", () => {
  const val = document.getElementById("whatsapp-msg").value;
  if (!val) return;
  navigator.clipboard.writeText(val).then(() => {
    const btn = document.getElementById("copy-wa");
    btn.textContent = "COPIADO ✓";
    setTimeout(() => btn.textContent = "COPIAR", 2000);
  });
});

// ── Exportar Excel ──
document.getElementById("excel-btn").addEventListener("click", async () => {
  if (allRespuestas.length === 0) { alert("No hay respuestas para exportar."); return; }

  const labels = { amigos: "Amigos 21/05", trabajo: "Trabajo 22/05" };

  const datos = allRespuestas.map(d => ({
    Nombre:     d.nombre    || "",
    Evento:     labels[d.evento] || d.evento || "",
    Asistencia: d.asistencia ? "Sí" : "No",
    Mensaje:    d.mensaje   || "",
    Fecha:      d.fecha     || ""
  }));

  const ws = XLSX.utils.json_to_sheet(datos);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Invitados");
  XLSX.writeFile(wb, `invitados-eric26-${new Date().toISOString().slice(0,10)}.xlsx`);
});

// ── Init ──
cargarRespuestas();
