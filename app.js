/* =====================================================
   FIREBASE (usa firebaseConfig ya inicializado en config.js)
===================================================== */
const auth = firebase.auth();
const db = firebase.firestore();

/* =====================================================
   ESTADO GLOBAL
===================================================== */
let currentUid = null;
let currentRole = null;      // "owner" | "admin" | null
let currentProfileId = null; // perfil que este usuario puede editar (si es admin)
window.profilesCache = {};   // id -> data  (usado también por ui.js para copiar)
let editingId = null;        // qué perfil se está editando en el modal

/* =====================================================
   RENDER DE PERFILES (tiempo real desde Firestore)
===================================================== */
const grupos = ['owner','devs','ayudantes','miembros'];

db.collection('profiles').onSnapshot(snap=>{
  window.profilesCache = {};
  const porGrupo = { owner:[], devs:[], ayudantes:[], miembros:[] };

  snap.forEach(doc=>{
    const d = doc.data();
    window.profilesCache[doc.id] = d;
    if(porGrupo[d.grupo]) porGrupo[d.grupo].push({id:doc.id, ...d});
  });

  grupos.forEach(g=>{
    const cont = document.getElementById('grupo-'+g);
    if(!cont) return;
    cont.innerHTML = porGrupo[g].map(p=>tarjetaHTML(p)).join('') ||
      '<p style="text-align:center;color:#666;">Sin perfiles aún.</p>';
  });

  if(currentRole === 'owner') renderPanelOwner();
});

function tarjetaFallback(id, p, puedeEditar){
  return `
  <div class="card">
    <p style="color:#ff3355;font-size:12px;text-align:center;">⚠ No se cargó el diseño (skins/). Mostrando modo básico.</p>
    <div class="rows">
      <div class="row"><span class="row-icon">🍭</span><span class="row-label">Nombre</span><span class="row-value">${p.nombre||'EDITAR'}</span></div>
      <div class="row"><span class="row-icon">🍂</span><span class="row-label">Edad</span><span class="row-value">${p.edad||'EDITAR'}</span></div>
      <div class="row"><span class="row-icon">🎉</span><span class="row-label">Cumple</span><span class="row-value">${p.cumple||'EDITAR'}</span></div>
      <div class="row"><span class="row-icon">⚧️</span><span class="row-label">Género</span><span class="row-value">${p.genero||'EDITAR'}</span></div>
      <div class="row"><span class="row-icon">🌎</span><span class="row-label">Región</span><span class="row-value">${p.region||'EDITAR'}</span></div>
    </div>
    ${puedeEditar ? `<div class="btn edit" onclick="abrirEdicion('${id}')">✏️ Editar este perfil</div>` : ''}
  </div>`;
}

function tarjetaHTML(p){
  const puedeEditar = currentRole === 'owner' || p.id === currentProfileId;
  let skinFn = null;
  if(window.SKINS && window.SKINS[p.estilo]) skinFn = window.SKINS[p.estilo];
  else if(window.SKINS && window.SKINS.neon) skinFn = window.SKINS.neon;
  else skinFn = tarjetaFallback;

  try{
    return skinFn(p.id, p, puedeEditar);
  }catch(e){
    console.error('Error al renderizar tarjeta', p.id, e);
    return tarjetaFallback(p.id, p, puedeEditar);
  }
}

/* =====================================================
   LOGIN POR PIN
===================================================== */
function abrirLogin(){
  document.getElementById('loginMsg').textContent = '';
  document.getElementById('pinInput').value = '';
  abrirModal('modalLogin');
}

async function intentarLogin(){
  const pin = document.getElementById('pinInput').value.trim();
  const msg = document.getElementById('loginMsg');
  msg.className = 'msg';
  if(!pin){ msg.textContent='Escribe un PIN.'; msg.className='msg err'; return; }

  msg.textContent = 'Verificando...';

  try{
    const pinDoc = await db.collection('pins').doc(pin).get();
    if(!pinDoc.exists){
      msg.textContent = 'PIN inválido.'; msg.className='msg err'; return;
    }
    const { role, profileId } = pinDoc.data();

    if(!auth.currentUser){
      await auth.signInAnonymously();
    }
    const uid = auth.currentUser.uid;

    const roleRef = db.collection('roles').doc(uid);
    const roleSnap = await roleRef.get();
    if(!roleSnap.exists){
      await roleRef.set({ role, profileId, pin });
    }

    const profRef = db.collection('profiles').doc(profileId);
    const profSnap = await profRef.get();
    if(profSnap.exists){
      const data = profSnap.data();
      if(!data.ownerUid){
        await profRef.update({ ownerUid: uid });
      } else if(data.ownerUid !== uid){
        msg.textContent = 'Este PIN ya está activo en otro dispositivo. Pide al Owner que reinicie tu acceso.';
        msg.className = 'msg err';
        return;
      }
    }

    msg.textContent = '¡Acceso concedido!';
    msg.className = 'msg ok';
    setTimeout(()=> cerrarModal('modalLogin'), 700);
    aplicarSesion(uid, role, profileId);

  }catch(e){
    console.error(e);
    msg.textContent = 'Error al verificar. Intenta de nuevo.';
    msg.className = 'msg err';
  }
}

function aplicarSesion(uid, role, profileId){
  currentUid = uid;
  currentRole = role;
  currentProfileId = profileId;

  document.getElementById('btnAcceso').style.display = 'none';
  if(role === 'owner'){
    document.getElementById('btnPanel').style.display = 'block';
  } else {
    document.getElementById('btnMiPerfil').style.display = 'block';
  }
}

/* Revisar si ya había sesión guardada (mismo navegador) */
auth.onAuthStateChanged(async user=>{
  if(!user){ return; }

  // Sincronizar cooldowns reales de reputación guardados en el servidor
  try{
    const votesSnap = await db.collection('votes').doc(user.uid).collection('items').get();
    votesSnap.forEach(doc=>{
      const next = doc.data().nextEligible;
      if(next) localStorage.setItem('star_cd_'+doc.id, String(next));
    });
  }catch(e){ /* silencioso: si falla, se queda el valor local anterior */ }

  const roleSnap = await db.collection('roles').doc(user.uid).get();
  if(roleSnap.exists){
    const { role, profileId } = roleSnap.data();
    aplicarSesion(user.uid, role, profileId);
  }
});

/* =====================================================
   EDITAR PERFIL (propio o cualquiera si eres owner)
===================================================== */
function abrirEdicionPropia(){
  abrirEdicion(currentProfileId);
}

function abrirEdicion(id){
  const d = window.profilesCache[id];
  if(!d) return;
  editingId = id;
  document.getElementById('f_foto').value = d.foto||'';
  document.getElementById('f_grupo').value = d.grupo||'miembros';
  document.getElementById('f_nombre').value = d.nombre||'';
  document.getElementById('f_edad').value = d.edad||'';
  document.getElementById('f_cumple').value = d.cumple||'';
  document.getElementById('f_genero').value = d.genero||'';
  document.getElementById('f_region').value = d.region||'';
  document.getElementById('f_wa').value = d.wa||'';
  document.getElementById('f_yt').value = d.yt||'';
  document.getElementById('f_ig').value = d.ig||'';
  document.getElementById('f_tt').value = d.tt||'';
  document.getElementById('f_estilo').value = d.estilo||'neon';
  document.getElementById('editMsg').textContent = '';

  document.getElementById('f_grupo').disabled = (currentRole !== 'owner');

  abrirModal('modalEdit');
}

async function guardarEdicion(){
  const msg = document.getElementById('editMsg');
  if(!editingId){ return; }
  const payload = {
    foto: document.getElementById('f_foto').value.trim(),
    nombre: document.getElementById('f_nombre').value.trim(),
    edad: document.getElementById('f_edad').value.trim(),
    cumple: document.getElementById('f_cumple').value.trim(),
    genero: document.getElementById('f_genero').value.trim(),
    region: document.getElementById('f_region').value.trim(),
    wa: document.getElementById('f_wa').value.trim(),
    yt: document.getElementById('f_yt').value.trim(),
    ig: document.getElementById('f_ig').value.trim(),
    tt: document.getElementById('f_tt').value.trim(),
    estilo: document.getElementById('f_estilo').value,
  };
  if(currentRole === 'owner'){
    payload.grupo = document.getElementById('f_grupo').value;
  }
  try{
    await db.collection('profiles').doc(editingId).update(payload);
    msg.textContent = 'Guardado ✔';
    msg.className = 'msg ok';
    setTimeout(()=> cerrarModal('modalEdit'), 600);
  }catch(e){
    console.error(e);
    msg.textContent = 'No se pudo guardar.';
    msg.className = 'msg err';
  }
}

/* =====================================================
   PANEL OWNER: crear perfiles/PIN, listar, resetear, eliminar
===================================================== */
function abrirPanelOwner(){
  document.getElementById('crearForm').style.display = 'none';
  document.getElementById('crearMsg').textContent = '';
  renderPanelOwner();
  abrirModal('modalOwner');
}

function mostrarCrear(){
  const f = document.getElementById('crearForm');
  f.style.display = f.style.display === 'none' ? 'block' : 'none';
}

function generarPin(){
  return String(Math.floor(100000 + Math.random()*900000));
}

async function crearPerfil(){
  const msg = document.getElementById('crearMsg');
  const nombre = document.getElementById('nc_nombre').value.trim();
  const grupo = document.getElementById('nc_grupo').value;
  const rol = document.getElementById('nc_rol').value;

  if(!nombre){ msg.textContent='Ponle un nombre.'; msg.className='msg err'; return; }

  try{
    const profRef = db.collection('profiles').doc();
    await profRef.set({
      nombre, grupo, ownerUid: '',
      edad:'', cumple:'', genero:'', region:'',
      foto:'', wa:'', yt:'', ig:'', tt:'',
      rep: 0, estilo: 'neon'
    });

    const pin = generarPin();
    await db.collection('pins').doc(pin).set({ role: rol, profileId: profRef.id });

    msg.innerHTML = `Perfil creado. Comparte este PIN con la persona:<div class="pin-reveal">${pin}</div>`;
    msg.className = 'msg ok';
    document.getElementById('nc_nombre').value = '';
  }catch(e){
    console.error(e);
    msg.textContent = 'Error al crear (revisa las reglas de Firestore).';
    msg.className = 'msg err';
  }
}

async function renderPanelOwner(){
  const cont = document.getElementById('listaOwner');
  if(!cont || currentRole !== 'owner') return;
  const rows = Object.entries(window.profilesCache).map(([id,d])=>`
    <div class="owner-row">
      <b>${d.nombre||'(sin nombre)'}</b> — ${d.grupo}<br>
      <small>${d.ownerUid ? '🔒 Acceso reclamado' : '🟡 PIN sin usar aún'}</small>
      <div style="display:flex;gap:6px;margin-top:8px;">
        <div class="btn edit" style="flex:1;margin:0;" onclick="cerrarModal('modalOwner');abrirEdicion('${id}')">Editar</div>
        <div class="btn" style="flex:1;margin:0;" onclick="resetearAcceso('${id}')">Reset</div>
        <div class="btn danger" style="flex:1;margin:0;" onclick="eliminarPerfil('${id}')">Eliminar</div>
      </div>
    </div>
  `).join('');
  cont.innerHTML = rows || '<p style="color:#666;text-align:center;">No hay perfiles todavía.</p>';
}

async function resetearAcceso(id){
  if(!confirm('¿Reiniciar el acceso de este perfil? La persona necesitará volver a usar su PIN para reclamarlo (por ejemplo en un celular nuevo).')) return;
  await db.collection('profiles').doc(id).update({ ownerUid: '' });
}

async function eliminarPerfil(id){
  if(!confirm('¿Eliminar este perfil por completo? Esto no se puede deshacer.')) return;
  await db.collection('profiles').doc(id).delete();
  renderPanelOwner();
}

/* =====================================================
   REPUTACIÓN: dar estrella
   (el cooldown de 24h se guarda en el navegador de quien vota)
===================================================== */
async function darStar(id){
  const restante = msRestantes(id);
  if(restante > 0) return;

  if(!auth.currentUser){
    try{ await auth.signInAnonymously(); }
    catch(e){ alert('No se pudo verificar tu dispositivo, intenta de nuevo.'); return; }
  }
  const uid = auth.currentUser.uid;
  const voteRef = db.collection('votes').doc(uid).collection('items').doc(id);
  const profRef = db.collection('profiles').doc(id);

  try{
    await db.runTransaction(async (tx)=>{
      const voteSnap = await tx.get(voteRef);
      const now = Date.now();
      if(voteSnap.exists && (voteSnap.data().nextEligible||0) > now){
        throw new Error('cooldown');
      }
      const profSnap = await tx.get(profRef);
      if(!profSnap.exists) throw new Error('no-profile');
      const nuevaRep = (profSnap.data().rep || 0) + 1;
      const proximo = now + 24*60*60*1000;
      tx.update(profRef, { rep: nuevaRep });
      tx.set(voteRef, { nextEligible: proximo });
    });

    const proximo = Date.now() + 24*60*60*1000;
    localStorage.setItem('star_cd_'+id, String(proximo));
    localStorage.setItem('claim_ready_'+id, '1');

    const claimBtn = document.getElementById('claim-'+id);
    if(claimBtn) claimBtn.style.display = 'flex';
  }catch(e){
    if(e.message !== 'cooldown'){
      console.error(e);
      alert('No se pudo dar la estrella, intenta de nuevo.');
    }
  }
}

/* =====================================================
   CANJEAR RECOMPENSA
===================================================== */
let canjeProfileId = null;

function abrirCanje(id){
  canjeProfileId = id;
  const p = window.profilesCache[id] || {};
  const restante = msRestantes(id);
  document.getElementById('canjeTexto').innerHTML =
    `Canjea tus <b>20,000¥</b> en Eris-Bot (esto por dar reputación a <b>${p.nombre||'este admin'}</b>).<br>Próximo rep disponible en: <b>${formatoTiempo(restante)}</b>`;
  document.getElementById('canjeWa').value = '';
  document.getElementById('canjeMsg').textContent = '';
  abrirModal('modalCanje');
}

async function enviarCanje(){
  const msg = document.getElementById('canjeMsg');
  const wa = document.getElementById('canjeWa').value.trim();
  if(!wa){ msg.textContent='Escribe tu número de WhatsApp.'; msg.className='msg err'; return; }

  try{
    const p = window.profilesCache[canjeProfileId] || {};
    await db.collection('buzon').add({
      whatsapp: wa,
      profileId: canjeProfileId,
      profileNombre: p.nombre || '',
      ts: Date.now()
    });

    localStorage.removeItem('claim_ready_'+canjeProfileId);
    const claimBtn = document.getElementById('claim-'+canjeProfileId);
    if(claimBtn) claimBtn.style.display = 'none';

    msg.textContent = '¡Enviado! El Owner te contactará por WhatsApp.';
    msg.className = 'msg ok';
    setTimeout(()=> cerrarModal('modalCanje'), 900);
  }catch(e){
    console.error(e);
    msg.textContent = 'No se pudo enviar, intenta de nuevo.';
    msg.className = 'msg err';
  }
}

/* =====================================================
   BUZÓN PRIVADO (solo visible para el Owner)
===================================================== */
function mostrarBuzon(){
  const cont = document.getElementById('buzonLista');
  const abrir = cont.style.display === 'none';
  cont.style.display = abrir ? 'block' : 'none';
  if(abrir) renderBuzon();
}

async function renderBuzon(){
  const cont = document.getElementById('buzonLista');
  if(!cont || currentRole !== 'owner') return;
  try{
    const snap = await db.collection('buzon').orderBy('ts','desc').get();
    if(snap.empty){
      cont.innerHTML = '<p style="color:#666;text-align:center;">No hay solicitudes de canje.</p>';
      return;
    }
    cont.innerHTML = snap.docs.map(doc=>{
      const d = doc.data();
      const fecha = new Date(d.ts).toLocaleString();
      return `
      <div class="owner-row">
        <b>${d.profileNombre||'(perfil)'}</b><br>
        <small>📱 ${d.whatsapp}</small><br>
        <small style="color:#666;">${fecha}</small>
        <div class="btn danger" style="margin-top:8px;" onclick="eliminarBuzon('${doc.id}')">Eliminar / Atendido</div>
      </div>`;
    }).join('');
  }catch(e){
    console.error(e);
    cont.innerHTML = '<p style="color:#ff3355;text-align:center;">Error al cargar el buzón.</p>';
  }
}

async function eliminarBuzon(docId){
  await db.collection('buzon').doc(docId).delete();
  renderBuzon();
}
   
