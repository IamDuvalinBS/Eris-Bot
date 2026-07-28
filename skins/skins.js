/* =====================================================
   MÓDULO: LINKS
   Controla los botones de la página "Links Oficiales".
   Solo el Owner puede agregarlos/editarlos/eliminarlos.
   Se guardan en Firestore, así que se actualizan solos
   para todos los que visiten la página (sin tocar código).
===================================================== */

function renderPublicLinks(){
  const cont = document.getElementById('links-list');
  if(!cont) return;
  db.collection('links').onSnapshot(snap=>{
    if(snap.empty){
      cont.innerHTML = '<p style="color:#666;text-align:center;">Aún no hay links configurados.</p>';
      return;
    }
    cont.innerHTML = snap.docs.map(doc=>{
      const d = doc.data();
      return `<a class="btn" href="${d.url}" target="_blank">${d.label}</a>`;
    }).join('');
  });
}

function mostrarLinksAdmin(){
  const cont = document.getElementById('linksAdminLista');
  const abrir = cont.style.display === 'none';
  cont.style.display = abrir ? 'block' : 'none';
  if(abrir) renderLinksAdmin();
}

async function renderLinksAdmin(){
  const cont = document.getElementById('linksAdminItems');
  if(!cont || currentRole !== 'owner') return;
  try{
    const snap = await db.collection('links').get();
    const items = snap.docs.map(doc=>{
      const d = doc.data();
      return `
      <div class="owner-row">
        <div class="field"><label>Nombre del botón</label><input id="ll_label_${doc.id}" value="${d.label||''}"></div>
        <div class="field"><label>Link (URL)</label><input id="ll_url_${doc.id}" value="${d.url||''}"></div>
        <div style="display:flex;gap:6px;margin-top:8px;">
          <div class="btn edit" style="flex:1;margin:0;" onclick="guardarLink('${doc.id}')">Guardar</div>
          <div class="btn danger" style="flex:1;margin:0;" onclick="eliminarLink('${doc.id}')">Eliminar</div>
        </div>
      </div>`;
    }).join('');
    cont.innerHTML = items || '<p style="color:#666;text-align:center;">No hay links todavía.</p>';
  }catch(e){
    console.error(e);
    cont.innerHTML = '<p style="color:#ff3355;text-align:center;">Error al cargar los links.</p>';
  }
}

async function guardarLink(id){
  const label = document.getElementById('ll_label_'+id).value.trim();
  const url = document.getElementById('ll_url_'+id).value.trim();
  if(!label || !url) return;
  await db.collection('links').doc(id).update({ label, url });
}

async function eliminarLink(id){
  if(!confirm('¿Eliminar este link?')) return;
  await db.collection('links').doc(id).delete();
  renderLinksAdmin();
}

async function agregarLink(){
  const label = document.getElementById('nl_label').value.trim();
  const url = document.getElementById('nl_url').value.trim();
  const msg = document.getElementById('nlMsg');
  if(!label || !url){ msg.textContent='Completa nombre y link.'; msg.className='msg err'; return; }
  try{
    await db.collection('links').add({ label, url });
    document.getElementById('nl_label').value = '';
    document.getElementById('nl_url').value = '';
    msg.textContent = 'Agregado ✔';
    msg.className = 'msg ok';
    renderLinksAdmin();
  }catch(e){
    console.error(e);
    msg.textContent = 'No se pudo agregar.';
    msg.className = 'msg err';
  }
}

renderPublicLinks();
    
