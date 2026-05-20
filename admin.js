// CONFIG
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz8pxaG0C_kzEVMLN60azCXl7xobPucjsTZEl2J1bVqADM2p8eKVDd9HBRwBSvmKnwfpA/exec";

// Storage helpers
function loadEvents() {
  try {
    const raw = localStorage.getItem("events");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEvents(events) {
  localStorage.setItem("events", JSON.stringify(events));
}

// DOM refs
const form = document.getElementById("event-form");
const idInput = document.getElementById("event-id");
const titleInput = document.getElementById("event-title-input");
const phraseInput = document.getElementById("event-phrase-input");
const dateInput = document.getElementById("event-date-input");
const timeInput = document.getElementById("event-time-input");
const addressInput = document.getElementById("event-address-input");
const mapsInput = document.getElementById("event-maps-input");
const btnNewEvent = document.getElementById("btn-new-event");
const eventListEl = document.getElementById("event-list");

const linkEventSelect = document.getElementById("link-event-select");
const linkNameInput = document.getElementById("link-name-input");
const generatedLinkInput = document.getElementById("generated-link");
const btnGenerateLink = document.getElementById("btn-generate-link");
const btnCopyLink = document.getElementById("btn-copy-link");
const linkStatusEl = document.getElementById("link-status");

const attEventSelect = document.getElementById("att-event-select");
const attFilterSelect = document.getElementById("att-filter-select");
const btnLoadAttendees = document.getElementById("btn-load-attendees");
const attendeesTableBody = document.querySelector("#attendees-table tbody");
const attStatusEl = document.getElementById("att-status");

let events = [];
let editingId = null;

// Render events list
function renderEvents() {
  eventListEl.innerHTML = "";
  if (!events.length) {
    eventListEl.innerHTML =
      '<p class="status">Todavía no hay eventos creados.</p>';
    return;
  }

  events.forEach((ev) => {
    const item = document.createElement("div");
    item.className = "event-item";

    const header = document.createElement("div");
    header.className = "event-item-header";

    const title = document.createElement("div");
    title.className = "event-item-title";
    title.textContent = ev.title;

    const idSpan = document.createElement("div");
    idSpan.className = "event-item-id";
    idSpan.textContent = `ID: ${ev.id}`;

    header.appendChild(title);
    header.appendChild(idSpan);

    const meta = document.createElement("div");
    meta.className = "event-item-meta";
    meta.textContent = `${ev.date || "sin fecha"} · ${ev.time || "sin hora"} · ${
      ev.address || "sin dirección"
    }`;

    const actions = document.createElement("div");
    actions.className = "event-item-actions";

    const btnEdit = document.createElement("button");
    btnEdit.type = "button";
    btnEdit.className = "btn btn-outline btn-xs";
    btnEdit.textContent = "Editar";
    btnEdit.addEventListener("click", () => loadEventToForm(ev.id));

    const btnDelete = document.createElement("button");
    btnDelete.type = "button";
    btnDelete.className = "btn btn-outline btn-xs";
    btnDelete.textContent = "Eliminar";
    btnDelete.addEventListener("click", () => deleteEvent(ev.id));

    actions.appendChild(btnEdit);
    actions.appendChild(btnDelete);

    item.appendChild(header);
    item.appendChild(meta);
    item.appendChild(actions);

    eventListEl.appendChild(item);
  });

  renderEventSelects();
}

function renderEventSelects() {
  const selects = [linkEventSelect, attEventSelect];
  selects.forEach((sel) => {
    sel.innerHTML = "";
    if (!events.length) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "Sin eventos";
      sel.appendChild(opt);
      return;
    }
    events.forEach((ev) => {
      const opt = document.createElement("option");
      opt.value = ev.id;
      opt.textContent = `${ev.title} (${ev.id})`;
      sel.appendChild(opt);
    });
  });
}

// Form handling
function clearForm() {
  editingId = null;
  form.reset();
}

function loadEventToForm(id) {
  const ev = events.find((e) => e.id === id);
  if (!ev) return;
  editingId = id;
  idInput.value = ev.id;
  titleInput.value = ev.title || "";
  phraseInput.value = ev.phrase || "";
  dateInput.value = ev.date || "";
  timeInput.value = ev.time || "";
  addressInput.value = ev.address || "";
  mapsInput.value = ev.mapsUrl || "";
}

function deleteEvent(id) {
  if (!confirm("¿Eliminar este evento?")) return;
  events = events.filter((e) => e.id !== id);
  saveEvents(events);
  renderEvents();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = idInput.value.trim();
  if (!id) return;

  const eventData = {
    id,
    title: titleInput.value.trim(),
    phrase: phraseInput.value.trim(),
    date: dateInput.value,
    time: timeInput.value,
    address: addressInput.value.trim(),
    mapsUrl: mapsInput.value.trim() || "",
    // Opcionales para mostrar distinto formato si se quiere
    dateLabel: "",
    timeLabel: "",
  };

  const existingIndex = events.findIndex((e) => e.id === id);

  if (existingIndex >= 0 && editingId !== id) {
    alert("Ya existe un evento con ese ID.");
    return;
  }

  if (editingId && existingIndex >= 0) {
    events[existingIndex] = eventData;
  } else if (editingId && existingIndex === -1) {
    // Cambió el ID
    const oldIndex = events.findIndex((e) => e.id === editingId);
    if (oldIndex >= 0) {
      events.splice(oldIndex, 1, eventData);
    } else {
      events.push(eventData);
    }
  } else {
    events.push(eventData);
  }

  editingId = id;
  saveEvents(events);
  renderEvents();
});

btnNewEvent.addEventListener("click", () => {
  clearForm();
});

// Link generation
function generateLink() {
  linkStatusEl.textContent = "";
  const eventId = linkEventSelect.value;
  if (!eventId) {
    linkStatusEl.textContent = "Seleccioná un evento.";
    return;
  }
  const ev = events.find((e) => e.id === eventId);
  if (!ev) {
    linkStatusEl.textContent = "Evento no encontrado.";
    return;
  }

  const guestName = (linkNameInput.value || "").trim();
  const baseUrl = `${window.location.origin}/index.html`;

  const edata = btoa(JSON.stringify(ev));
  const params = new URLSearchParams();
  params.set("evento", ev.id);
  if (guestName) params.set("nombre", guestName);
  params.set("edata", edata);

  const fullLink = `${baseUrl}?${params.toString()}`;
  generatedLinkInput.value = fullLink;
  linkStatusEl.textContent = "Link generado.";
}

async function copyLink() {
  linkStatusEl.textContent = "";
  const link = generatedLinkInput.value;
  if (!link) {
    linkStatusEl.textContent = "No hay link para copiar.";
    return;
  }
  try {
    await navigator.clipboard.writeText(link);
    linkStatusEl.textContent = "Link copiado al portapapeles.";
    linkStatusEl.classList.add("success");
  } catch (e) {
    console.error(e);
    linkStatusEl.textContent = "No se pudo copiar el link.";
    linkStatusEl.classList.add("error");
  }
}

btnGenerateLink.addEventListener("click", generateLink);
btnCopyLink.addEventListener("click", copyLink);

// Attendees (requires Apps Script to devolver JSON en GET)
async function loadAttendees() {
  attStatusEl.textContent = "";
  attStatusEl.classList.remove("error", "success");
  attendeesTableBody.innerHTML = "";

  const eventId = attEventSelect.value;
  const filter = attFilterSelect.value;

  if (!eventId) {
    attStatusEl.textContent = "Seleccioná un evento.";
    return;
  }

  attStatusEl.textContent = "Cargando asistentes...";

  try {
    const res = await fetch(APPS_SCRIPT_URL);
    // Se asume que el Apps Script devuelve JSON con un array de objetos:
    // { evento, nombre, asistencia, mensaje, fecha }
    const data = await res.json();

    const filtered = data.filter((row) => {
      if (row.evento !== eventId) return false;
      if (filter === "ALL") return true;
      return row.asistencia === filter;
    });

    if (!filtered.length) {
      attStatusEl.textContent = "Sin registros para este filtro.";
      attendeesTableBody.innerHTML = "";
      return;
    }

    filtered.forEach((row) => {
      const tr = document.createElement("tr");

      const tdFecha = document.createElement("td");
      tdFecha.textContent = row.fecha || "";

      const tdEvento = document.createElement("td");
      tdEvento.textContent = row.evento || "";

      const tdNombre = document.createElement("td");
      tdNombre.textContent = row.nombre || "";

      const tdAsistencia = document.createElement("td");
      tdAsistencia.textContent = row.asistencia || "";

      const tdMensaje = document.createElement("td");
      tdMensaje.textContent = row.mensaje || "";

      tr.appendChild(tdFecha);
      tr.appendChild(tdEvento);
      tr.appendChild(tdNombre);
      tr.appendChild(tdAsistencia);
      tr.appendChild(tdMensaje);

      attendeesTableBody.appendChild(tr);
    });

    attStatusEl.textContent = `Registros: ${filtered.length}`;
    attStatusEl.classList.add("success");
  } catch (e) {
    console.error(e);
    attStatusEl.textContent =
      "No se pudieron cargar los asistentes. Revisá el Apps Script.";
    attStatusEl.classList.add("error");
  }
}

btnLoadAttendees.addEventListener("click", loadAttendees);

// Init
document.addEventListener("DOMContentLoaded", () => {
  events = loadEvents();
  renderEvents();
});
