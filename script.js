import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc
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

// ── URL params ──
const params   = new URLSearchParams(window.location.search);
const invitado = params.get("nombre") || "Invitado";
const evento   = params.get("evento") || "amigos";

// ── Maps link ──
const MAPS = "https://www.google.com/maps/place/Bricks+coffee+and+food/@-27.4458841,-58.9869402,17z/data=!3m1!4b1!4m6!3m5!1s0x94450d007ebda64d:0x90d95abb863652a6!8m2!3d-27.4458841!4d-58.9869402!16s%2Fg%2F11wpp7zdz0?entry=ttu";

// ── Eventos ──
const eventos = {
  amigos: {
    fechaTexto:     "Viernes 21 de Mayo, 2026",
    hora:           "21:30 hs",
    direccion:      "Bricks Coffee & Food · Corrientes 366",
    maps:           MAPS,
    fechaCountdown: "2026-05-21T21:30:00"
  },
  trabajo: {
    fechaTexto:     "Viernes 22 de Mayo, 2026",
    hora:           "21:30 hs",
    direccion:      "Bricks Coffee & Food · Corrientes 366",
    maps:           MAPS,
    fechaCountdown: "2026-05-22T21:30:00"
  }
};

// ── Fallback al evento amigos si el parámetro no existe ──
const data = eventos[evento] ?? eventos.amigos;

// ── Rellenar info ──
document.getElementById("fecha").textContent      = data.fechaTexto;
document.getElementById("hora").textContent       = data.hora;
document.getElementById("maps-link").textContent  = data.direccion;
document.getElementById("maps-link").href         = data.maps;
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
