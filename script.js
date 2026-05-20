import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "PEGA_TU_API_KEY",
  authDomain: "PEGA_TU_AUTH_DOMAIN",
  projectId: "PEGA_TU_PROJECT_ID",
  storageBucket: "PEGA_TU_STORAGE_BUCKET",
  messagingSenderId: "PEGA_TU_SENDER_ID",
  appId: "PEGA_TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ── URL params ──
const params   = new URLSearchParams(window.location.search);
const invitado = params.get("nombre") || "Invitado";
const evento   = params.get("evento") || "principal";

// ── Eventos ──
const eventos = {
  principal: {
    fechaTexto:      "Viernes 21 de Mayo, 2026",
    hora:            "21:30 hs",
    direccion:       "Bar Bricks · Corrientes 366",
    maps:            "https://maps.google.com/?q=Corrientes+366+Buenos+Aires",
    fechaCountdown:  "2026-05-21T21:30:00"
  },
  after: {
    fechaTexto:      "Sábado 22 de Mayo, 2026",
    hora:            "00:30 hs",
    direccion:       "After privado",
    maps:            "https://maps.google.com",
    fechaCountdown:  "2026-05-22T00:30:00"
  }
};

// ── FIX: fallback al evento principal si el parámetro no existe ──
const data = eventos[evento] ?? eventos.principal;

// ── Rellenar info ──
document.getElementById("fecha").textContent     = data.fechaTexto;
document.getElementById("hora").textContent      = data.hora;
document.getElementById("maps-link").textContent = data.direccion;
document.getElementById("maps-link").href        = data.maps;
document.getElementById("guest-name").textContent = invitado;

// ── Botones si/no ──
let asistencia = true;
const btnSi = document.getElementById("btn-si");
const btnNo = document.getElementById("btn-no");

btnSi.addEventListener("click", () => {
  asistencia = true;
  btnSi.classList.add("btn-active-si");
  btnSi.classList.remove("btn-active-no");
  btnNo.classList.remove("btn-active-si", "btn-active-no");
});

btnNo.addEventListener("click", () => {
  asistencia = false;
  btnNo.classList.add("btn-active-no");
  btnNo.classList.remove("btn-active-si");
  btnSi.classList.remove("btn-active-si", "btn-active-no");
});

// ── Confirmar ──
const confirmarBtn = document.getElementById("confirmar-btn");

confirmarBtn.addEventListener("click", async () => {
  const mensaje = document.getElementById("mensaje").value.trim();

  // Deshabilitar mientras envía
  confirmarBtn.disabled  = true;
  confirmarBtn.innerText = "ENVIANDO...";

  try {
    await addDoc(collection(db, "respuestas"), {
      nombre:     invitado,
      evento,
      asistencia,
      mensaje,
      fecha:      new Date().toISOString()
    });

    confirmarBtn.innerText = "CONFIRMADO ✓";
    confirmarBtn.style.background = "linear-gradient(135deg,#55d36a,#38b350)";

  } catch (err) {
    console.error(err);
    confirmarBtn.disabled  = false;
    confirmarBtn.innerText = "REINTENTAR";
    confirmarBtn.style.background = "linear-gradient(135deg,#ff6b6b,#c94a4a)";
    alert("Error al enviar la confirmación. Verificá tu conexión.");
  }
});

// ── Countdown ──
const targetDate = new Date(data.fechaCountdown);

function pad(n) { return String(n).padStart(2, "0"); }

function updateCountdown() {
  const diff = targetDate - new Date();

  if (diff <= 0) {
    document.getElementById("dias").textContent    = "00";
    document.getElementById("horas").textContent   = "00";
    document.getElementById("minutos").textContent = "00";
    return;
  }

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  document.getElementById("dias").textContent    = pad(days);
  document.getElementById("horas").textContent   = pad(hours);
  document.getElementById("minutos").textContent = pad(minutes);
}

updateCountdown();
setInterval(updateCountdown, 1000);
