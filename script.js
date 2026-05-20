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
const db = getFirestore(app);

const params = new URLSearchParams(window.location.search);

const invitado =
params.get("nombre") || "Invitado";

const evento =
params.get("evento") || "principal";

const eventos = {

  principal:{
    fechaTexto:"Viernes 21 de Mayo, 2026",
    hora:"21:30 hs",
    direccion:"Bar Bricks · Corrientes 366",
    maps:"https://maps.google.com",
    fechaCountdown:"2026-05-21T21:30:00"
  },

  after:{
    fechaTexto:"Sábado 22 de Mayo, 2026",
    hora:"00:30 hs",
    direccion:"After privado",
    maps:"https://maps.google.com",
    fechaCountdown:"2026-05-22T00:30:00"
  }
};

const data = eventos[evento];

if(data){

  document.getElementById("fecha")
  .textContent = data.fechaTexto;

  document.getElementById("hora")
  .textContent = data.hora;

  document.getElementById("maps-link")
  .textContent = data.direccion;

  document.getElementById("maps-link")
  .href = data.maps;
}

document.getElementById("guest-name")
.textContent = invitado;

let asistencia = true;

const btnSi = document.getElementById("btn-si");
const btnNo = document.getElementById("btn-no");

btnSi.addEventListener("click",()=>{

  asistencia = true;

  btnSi.classList.add("active");
  btnNo.classList.remove("active");

});

btnNo.addEventListener("click",()=>{

  asistencia = false;

  btnNo.classList.add("active");
  btnSi.classList.remove("active");

});

const confirmarBtn =
document.getElementById("confirmar-btn");

confirmarBtn.addEventListener("click",async()=>{

  const mensaje =
  document.getElementById("mensaje").value;

  try{

    confirmarBtn.innerText = "ENVIANDO...";

    await addDoc(collection(db,"respuestas"),{

      nombre:invitado,
      evento,
      asistencia,
      mensaje,
      fecha:new Date().toISOString()

    });

    confirmarBtn.innerText = "CONFIRMADO ✓";

    alert("Confirmación enviada ✨");

  }catch(err){

    console.error(err);

    confirmarBtn.innerText = "ERROR";

    alert("Error al enviar");
  }
});

const targetDate = new Date(data.fechaCountdown);

function updateCountdown(){

  const now = new Date();

  const diff = targetDate - now;

  if(diff <= 0) return;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  document.getElementById("dias").textContent = days;
  document.getElementById("horas").textContent = hours;
  document.getElementById("minutos").textContent = minutes;
}

updateCountdown();

setInterval(updateCountdown,1000);
