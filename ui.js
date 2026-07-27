/* =====================================================
   NAVEGACIÓN ENTRE PÁGINAS
===================================================== */
function irA(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

/* =====================================================
   BURBUJAS DE FONDO
===================================================== */
window.addEventListener('DOMContentLoaded', ()=>{
  const container = document.querySelector(".bubble-container");
  for(let i=0;i<30;i++){
    const b = document.createElement("div");
    b.className="bubble";
    b.style.width=(Math.random()*35+10)+"px";
    b.style.height=b.style.width;
    b.style.left=Math.random()*100+"%";
    b.style.animationDuration=(Math.random()*10+8)+"s";
    container.appendChild(b);
  }
});

/* =====================================================
   ABRIR ENLACES / WHATSAPP
===================================================== */
function openWA(num){ window.open("https://wa.me/"+num,"_blank"); }

/* =====================================================
   DESPLEGABLES (redes sociales / grupos)
===================================================== */
function toggleRedes(btn){
  const redes = btn.nextElementSibling;
  redes.style.display = redes.style.display==="flex" ? "none" : "flex";
}

function toggleGrupo(btn){
  const grupo = btn.nextElementSibling;
  const abierto = grupo.style.display === "block";
  grupo.style.display = abierto ? "none" : "block";
  const chevron = btn.querySelector('.chevron');
  if(chevron) chevron.style.transform = abierto ? "rotate(0deg)" : "rotate(180deg)";
}

/* =====================================================
   COPIAR TARJETA (usa el cache de datos que llena app.js)
===================================================== */
function copyCard(id){
  const d = window.profilesCache ? window.profilesCache[id] : null;
  if(!d) return;
  const text =
`🍭 ▸ NOMBRE:: ${d.nombre||'EDITAR'}
🍂 ▸ EDAD:: ${d.edad||'EDITAR'}
🎉 ▸ CUMPLEAÑOS:: ${d.cumple||'EDITAR'}
⚧️ ▸ GÉNERO:: ${d.genero||'EDITAR'}
🌎 ▸ REGIÓN:: ${d.region||'EDITAR'}`;
  navigator.clipboard.writeText(text);
}

/* =====================================================
   MODALES (abrir / cerrar)
===================================================== */
function abrirModal(id){ document.getElementById(id).classList.add('active'); }
function cerrarModal(id){ document.getElementById(id).classList.remove('active'); }
