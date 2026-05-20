// CONFIG
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz8pxaG0C_kzEVMLN60azCXl7xobPucjsTZEl2J1bVqADM2p8eKVDd9HBRwBSvmKnwfpA/exec";

// Storage helpers
function loadEvents() {
  try {
    return JSON.parse(localStorage.getItem("events")) || [];
  } catch {
    return [];
  }
}

function saveEvents(events) {
  localStorage.setItem("events", JSON.stringify(events));
}

// DOM
const form = document.getElementById("event-form");
const idInput = document.getElementById("event-id");
const titleInput = document.getElementById("event-title-input");
const phraseInput = document.getElementById("event-phrase-input");
const dateInput = document.getElementById("event-date-input");
const timeInput = document.getElementById("event-time-input");
const addressInput = document.getElementById("event-address-input");
const mapsInput = document.getElementById("event-maps-input");

const linkEventSelect = document.getElementById("link-event-select");
const linkNameInput = document.getElementById("link-name-input");
const generatedLinkInput = document.getElementById("generated-link");
const linkStatusEl = document.getElementById("link-status");

const previewFrame = document.getElementById("preview-frame");

let events = loadEvents();
let editingId = null;

// Render event list in selects
function renderEventSelects() {
  linkEventSelect.innerHTML = "";

  if (!events.length) {
    linkEventSelect.innerHTML = `<option value="">Sin eventos</option>`;
    return;
  }

  events.forEach((ev) => {
    const opt = document.createElement("option");
    opt.value = ev.id;
    opt.textContent = `${ev.title} (${ev.id})`;
    linkEventSelect.appendChild(opt);
  });
}

// Load event into preview
function updatePreview(eventData) {
  const frame = previewFrame.contentWindow;

  if (!frame) return;

  frame.postMessage({ type: "updatePreview", data: eventData }, "*");
}

// Load event into form
function loadEventToForm(id) {
  const ev = events.find((e) => e.id === id);
  if (!ev) return;

  editingId = id;

  idInput.value = ev.id;
  titleInput.value = ev.title;
  phraseInput.value = ev.phrase;
  dateInput.value = ev.date;
  timeInput.value = ev.time;
  addressInput.value = ev.address;
  mapsInput.value = ev.mapsUrl;

  updatePreview(ev);
}

// Save event
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const ev = {
    id: idInput.value.trim(),
    title: titleInput.value.trim(),
    phrase: phraseInput.value.trim(),
    date: dateInput.value,
    time: timeInput.value,
    address: addressInput.value.trim(),
    mapsUrl: mapsInput.value.trim(),
  };

  const existingIndex = events.findIndex((e) => e.id === ev.id);

  if (existingIndex >= 0 && editingId !== ev.id) {
    alert("Ya existe un evento con ese ID.");
    return;
  }

  if (editingId && existingIndex >= 0) {
    events[existingIndex] = ev;
  } else {
    events.push(ev);
  }

  editingId = ev.id;
  saveEvents(events);
  renderEventSelects();
  updatePreview(ev);
});

// New event
document.getElementById("btn-new-event").addEventListener("click", () => {
  editingId = null;
  form.reset();
  updatePreview(null);
});

// Generate link
document.getElementById("btn-generate-link").addEventListener("click", () => {
  const eventId = linkEventSelect.value;
  const guestName = linkNameInput.value.trim();

  if (!eventId) {
    linkStatusEl.textContent = "Seleccioná un evento.";
    return;
  }

  const ev = events.find((e) => e.id === eventId);
  const edata = btoa(JSON.stringify(ev));

  const base = `${window.location.origin}/index.html`;
  const params = new URLSearchParams();

  params.set("evento", ev.id);
  if (guestName) params.set("nombre", guestName);
  params.set("edata", edata);

  const link = `${base}?${params.toString()}`;
  generatedLinkInput.value = link;

  linkStatusEl.textContent = "Link generado.";
});

// Copy link
document.getElementById("btn-copy-link").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(generatedLinkInput.value);
    linkStatusEl.textContent = "Copiado.";
  } catch {
    linkStatusEl.textContent = "No se pudo copiar.";
  }
});

// Init
renderEventSelects();
