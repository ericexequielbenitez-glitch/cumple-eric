// CONFIG
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz8pxaG0C_kzEVMLN60azCXl7xobPucjsTZEl2J1bVqADM2p8eKVDd9HBRwBSvmKnwfpA/exec";

// Helpers
function getUrlParams() {
  return new URLSearchParams(window.location.search);
}

function decodeEventFromParam() {
  const params = getUrlParams();
  const encoded = params.get("edata");
  if (!encoded) return null;
  try {
    const json = atob(encoded);
    return JSON.parse(json);
  } catch (e) {
    console.warn("No se pudo decodificar edata", e);
    return null;
  }
}

function loadEventsFromStorage() {
  try {
    const raw = localStorage.getItem("events");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function findEventById(id) {
  const events = loadEventsFromStorage();
  return events.find((e) => e.id === id) || null;
}

function buildMapsLink(address, customUrl) {
  if (customUrl) return customUrl;
  const q = encodeURIComponent(address);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function buildDateTime(event) {
  // event.date: yyyy-mm-dd, event.time: HH:MM
  if (!event.date || !event.time) return null;
  const [year, month, day] = event.date.split("-").map(Number);
  const [hour, minute] = event.time.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, 0);
}

// DOM references
const titleEl = document.getElementById("event-title");
const phraseEl = document.getElementById("event-phrase");
const dateEl = document.getElementById("event-date");
const timeEl = document.getElementById("event-time");
const addressEl = document.getElementById("event-address");
const guestNameEl = document.getElementById("guest-name");
const guestNameWrapper = document.getElementById("guest-name-wrapper");

const cdDays = document.getElementById("cd-days");
const cdHours = document.getElementById("cd-hours");
const cdMinutes = document.getElementById("cd-minutes");
const cdSeconds = document.getElementById("cd-seconds");

const btnYes = document.getElementById("btn-yes");
const btnNo = document.getElementById("btn-no");
const btnConfirm = document.getElementById("btn-confirm");
const messageEl = document.getElementById("message");
const statusEl = document.getElementById("status");

let selectedRSVP = null;
let currentEvent = null;
let countdownInterval = null;

// Load event from URL/localStorage
function initEvent() {
  const params = getUrlParams();
  const eventoId = params.get("evento");
  const nombre = params.get("nombre");

  if (nombre) {
    guestNameEl.textContent = nombre;
  } else {
    guestNameWrapper.style.display = "none";
  }

  // Priority: edata param, then localStorage by evento
  let eventData = decodeEventFromParam();
  if (!eventData && eventoId) {
    eventData = findEventById(eventoId);
  }

  if (!eventData) {
    statusEl.textContent =
      "No se encontró el evento. Verificá el link o consultá al organizador.";
    statusEl.classList.add("error");
    return;
  }

  currentEvent = eventData;

  titleEl.textContent = eventData.title || "Celebración";
  phraseEl.textContent =
    eventData.phrase || "Una noche para celebrar juntos.";

  dateEl.textContent = eventData.dateLabel || eventData.date || "--/--/----";
  timeEl.textContent = eventData.timeLabel || eventData.time || "--:--";

  const address = eventData.address || "A confirmar";
  const mapsUrl = buildMapsLink(address, eventData.mapsUrl);
  addressEl.textContent = address;
  addressEl.href = mapsUrl;

  const dt = buildDateTime(eventData);
  if (dt) {
    startCountdown(dt);
  }
}

function startCountdown(targetDate) {
  function update() {
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();

    if (diff <= 0) {
      cdDays.textContent = "00";
      cdHours.textContent = "00";
      cdMinutes.textContent = "00";
      cdSeconds.textContent = "00";
      clearInterval(countdownInterval);
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    cdDays.textContent = String(days).padStart(2, "0");
    cdHours.textContent = String(hours).padStart(2, "0");
    cdMinutes.textContent = String(minutes).padStart(2, "0");
    cdSeconds.textContent = String(seconds).padStart(2, "0");
  }

  update();
  countdownInterval = setInterval(update, 1000);
}

// RSVP selection
function setRSVP(value) {
  selectedRSVP = value;
  btnYes.classList.toggle("selected", value === "SI");
  btnNo.classList.toggle("selected", value === "NO");
}

btnYes.addEventListener("click", () => setRSVP("SI"));
btnNo.addEventListener("click", () => setRSVP("NO"));

// Send RSVP
async function sendRSVP() {
  statusEl.textContent = "";
  statusEl.classList.remove("error", "success");

  if (!currentEvent) {
    statusEl.textContent = "No hay evento cargado.";
    statusEl.classList.add("error");
    return;
  }

  if (!selectedRSVP) {
    statusEl.textContent = "Elegí si vas a asistir o no.";
    statusEl.classList.add("error");
    return;
  }

  const params = getUrlParams();
  const nombre = params.get("nombre") || "Invitado";

  const payload = {
    evento: currentEvent.id || "",
    nombre,
    asistencia: selectedRSVP,
    mensaje: messageEl.value || "",
    fecha: new Date().toISOString(),
  };

  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors", // Apps Script suele aceptar no-cors
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Con no-cors no podemos leer el status, asumimos éxito si no hay error de red
    statusEl.textContent = "Respuesta registrada. ¡Gracias!";
    statusEl.classList.add("success");
  } catch (err) {
    console.error(err);
    statusEl.textContent =
      "No se pudo enviar la confirmación. Probá de nuevo en unos minutos.";
    statusEl.classList.add("error");
  }
}

btnConfirm.addEventListener("click", sendRSVP);

// Init
document.addEventListener("DOMContentLoaded", initEvent);
