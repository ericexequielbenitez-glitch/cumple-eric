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
    return JSON.parse(atob(encoded));
  } catch {
    return null;
  }
}

function loadEventsFromStorage() {
  try {
    return JSON.parse(localStorage.getItem("events")) || [];
  } catch {
    return [];
  }
}

function findEventById(id) {
  return loadEventsFromStorage().find(e => e.id === id) || null;
}

function buildMapsLink(address, customUrl) {
  if (customUrl) return customUrl;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

function buildDateTime(event) {
  if (!event.date || !event.time) return null;
  const [y, m, d] = event.date.split("-").map(Number);
  const [hh, mm] = event.time.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, 0);
}

// DOM
const titleEl = document.getElementById("event-title");
const phraseEl = document.getElementById("event-phrase");
const dateEl = document.getElementById("event-date");
const timeEl = document.getElementById("event-time");
const addressEl = document.getElementById("event-address");

const cdDays = document.getElementById("cd-days");
const cdHours = document.getElementById("cd-hours");
const cdMinutes = document.getElementById("cd-minutes");
const cdSeconds = document.getElementById("cd-seconds");

let countdownInterval = null;

// INIT
function initEvent() {
  const params = getUrlParams();
  const eventoId = params.get("evento");

  // 1) Intentar cargar desde edata
  let eventData = decodeEventFromParam();

  // 2) Si no hay edata, cargar desde localStorage
  if (!eventData && eventoId) {
    eventData = findEventById(eventoId);
  }

  // 3) Si no hay evento → mostrar error premium (NO modo poronga)
  if (!eventData) {
    document.body.classList.add("no-event");
    return;
  }

  // 4) Cargar datos
  titleEl.textContent =
