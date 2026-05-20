import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs
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

async function cargarRespuestas(){

  const snapshot =
  await getDocs(collection(db,"respuestas"));

  const container =
  document.getElementById("respuestas");

  container.innerHTML = "";

  let total = 0;
  let asisten = 0;
  let noAsisten = 0;

  snapshot.forEach((doc)=>{

    total++;

    const data = doc.data();

    if(data.asistencia){
      asisten++;
    }else{
      noAsisten++;
    }

    container.innerHTML += `

      <div
        style="
        background:#0f0f0f;
        border:1px solid rgba(255,255,255,.06);
        padding:20px;
        border-radius:18px;
        margin-bottom:15px;
        "
      >

        <h3>${data.nombre}</h3>

        <p style="margin-top:8px;">
          Evento: ${data.evento}
        </p>

        <p style="margin-top:8px;color:${data.asistencia ? '#55d36a' : '#ff6b6b'};">
          ${data.asistencia ? 'Asiste' : 'No asiste'}
        </p>

        <small style="display:block;margin-top:10px;color:#ccc;">
          ${data.mensaje || '-'}
        </small>

      </div>

    `;
  });

  document.getElementById("total")
  .textContent = total;

  document.getElementById("asisten")
  .textContent = asisten;

  document.getElementById("no-asisten")
  .textContent = noAsisten;
}

cargarRespuestas();

const generarBtn =
document.getElementById("generar-link");

const linkResult =
document.getElementById("link-result");

const nombreInput =
document.getElementById("nombre-input");

const eventoSelect =
document.getElementById("evento-select");

const BASE_URL =
"https://cumple-eric.vercel.app";


generarBtn.addEventListener("click",()=>{

  const nombre = encodeURIComponent(
    nombreInput.value
  );

  const evento = eventoSelect.value;

  const link =
  `${BASE_URL}/?evento=${evento}&nombre=${nombre}`;

  linkResult.value = link;
});


document
.getElementById("excel-btn")
.addEventListener("click",exportarExcel);

async function exportarExcel(){

  const snapshot =
  await getDocs(collection(db,"respuestas"));

  const datos = [];

  snapshot.forEach((doc)=>{

    datos.push(doc.data());

  });

  const ws = XLSX.utils.json_to_sheet(datos);

  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    "Invitados"
  );

  XLSX.writeFile(wb,"invitados.xlsx");
}
