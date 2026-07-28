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

/* =====================================================
   REPUTACIÓN: widget + cooldown en tiempo real
   (el cooldown se guarda en este mismo navegador/dispositivo)
===================================================== */
function msRestantes(id){
  const cd = parseInt(localStorage.getItem('star_cd_'+id) || '0', 10);
  return cd - Date.now();
}

function formatoTiempo(ms){
  if(ms<=0) return '00:00:00';
  const totalSeg = Math.floor(ms/1000);
  const h = String(Math.floor(totalSeg/3600)).padStart(2,'0');
  const m = String(Math.floor((totalSeg%3600)/60)).padStart(2,'0');
  const s = String(totalSeg%60).padStart(2,'0');
  return `${h}:${m}:${s}`;
}

function reputationWidgetHTML(id, rep){
  const listo = localStorage.getItem('claim_ready_'+id) === '1';
  return `
  <div class="rep-row">
    <button class="star-btn" id="star-${id}" onclick="darStar('${id}')">
      <span class="star-icon">⭐</span>
      <span class="rep-count">${rep||0}</span>
      <span class="star-label" id="star-label-${id}">Dar reputación</span>
    </button>
    <button class="claim-btn" id="claim-${id}" style="display:${listo?'flex':'none'};" onclick="abrirCanje('${id}')">🎁 Canjear recompensa</button>
  </div>`;
}

setInterval(()=>{
  document.querySelectorAll('.star-btn').forEach(btn=>{
    const id = btn.id.replace('star-','');
    const restante = msRestantes(id);
    const label = document.getElementById('star-label-'+id);
    if(restante > 0){
      btn.classList.add('on-cooldown');
      btn.disabled = true;
      if(label) label.textContent = formatoTiempo(restante);
    } else {
      btn.classList.remove('on-cooldown');
      btn.disabled = false;
      if(label) label.textContent = 'Dar reputación';
    }
  });
}, 1000);
