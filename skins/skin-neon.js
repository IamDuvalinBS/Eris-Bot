/* =====================================================
   SKIN: NEON
   Diseño moderno con tarjeta de vidrio y filas etiqueta/valor.
===================================================== */
window.SKINS = window.SKINS || {};

window.SKINS.neon = function(id, p, puedeEditar){
  return `
  <div class="card skin-neon">
    <div class="pfp-wrap">
      <img class="pfp" src="${p.foto||''}" onerror="this.src='https://files.catbox.moe/ifpixp.jpeg'">
    </div>

    <div class="rows">
      <div class="row"><span class="row-icon">🍭</span><span class="row-label">Nombre</span><span class="row-value">${p.nombre||'EDITAR'}</span></div>
      <div class="row"><span class="row-icon">🍂</span><span class="row-label">Edad</span><span class="row-value">${p.edad||'EDITAR'}</span></div>
      <div class="row"><span class="row-icon">🎉</span><span class="row-label">Cumple</span><span class="row-value">${p.cumple||'EDITAR'}</span></div>
      <div class="row"><span class="row-icon">⚧️</span><span class="row-label">Género</span><span class="row-value">${p.genero||'EDITAR'}</span></div>
      <div class="row"><span class="row-icon">🌎</span><span class="row-label">Región</span><span class="row-value">${p.region||'EDITAR'}</span></div>
    </div>

    ${reputationWidgetHTML(id, p.rep)}

    <div class="btn copy" onclick="copyCard('${id}')">📋 Copiar</div>

    ${(p.wa||p.yt||p.ig||p.tt) ? `
    <div class="redes-toggle" onclick="toggleRedes(this)">🌐 Redes Sociales <span>▾</span></div>
    <div class="redes" style="display:none;">
      ${p.wa? `<div class="social-pill wa" onclick="openWA('${p.wa}')">WhatsApp</div>`:''}
      ${p.yt? `<div class="social-pill yt" onclick="window.open('${p.yt}','_blank')">YouTube</div>`:''}
      ${p.ig? `<div class="social-pill ig" onclick="window.open('${p.ig}','_blank')">Instagram</div>`:''}
      ${p.tt? `<div class="social-pill tt" onclick="window.open('${p.tt}','_blank')">TikTok</div>`:''}
    </div>` : ''}

    ${puedeEditar ? `<div class="btn edit" onclick="abrirEdicion('${id}')">✏️ Editar este perfil</div>` : ''}
  </div>`;
};
