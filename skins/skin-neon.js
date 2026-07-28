/* =====================================================
   SKIN: NEON (estilo clásico de bordes brillantes)
===================================================== */
window.SKINS = window.SKINS || {};

window.SKINS.neon = function(id, p, puedeEditar){
  return `
  <div class="card skin-neon skin-classic">
    <div class="pfp-wrap">
      <img class="pfp" src="${p.foto||''}" onerror="this.src='https://files.catbox.moe/ifpixp.jpeg'">
    </div>

    <div class="rows">
      <div class="line-row">🍭 ▸ NOMBRE:: ${p.nombre||'EDITAR'}</div>
      <div class="line-row">🍂 ▸ EDAD:: ${p.edad||'EDITAR'}</div>
      <div class="line-row">🎉 ▸ CUMPLEAÑOS:: ${p.cumple||'EDITAR'}</div>
      <div class="line-row">⚧️ ▸ GÉNERO:: ${p.genero||'EDITAR'}</div>
      <div class="line-row">🌎 ▸ REGIÓN:: ${p.region||'EDITAR'}</div>
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
