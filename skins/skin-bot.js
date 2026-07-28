/* =====================================================
   SKIN: BOT
   Diseño decorativo inspirado en tarjetas de bots de WhatsApp.
===================================================== */
window.SKINS = window.SKINS || {};

window.SKINS.bot = function(id, p, puedeEditar){
  const nombre = p.nombre || 'Sin nombre';
  const edad = p.edad || '??';
  const cumple = p.cumple || 'No establecido';
  const genero = p.genero || 'No establecido';
  const region = p.region || 'No establecida';
  const rep = p.rep || 0;

  return `
  <div class="card skin-bot">
    <div class="pfp-wrap">
      <img class="pfp" src="${p.foto||''}" onerror="this.src='https://files.catbox.moe/ifpixp.jpeg'">
    </div>

    <pre class="ascii-block">╔┅┉✦┉┅✦┅┉✦┉┅✦┉┅✦┅┅❥⧽
║✿ Perfil de › ${nombre}
║
╠┅┉✦┉┅✦┅┉✦┉┅✦┉┅✦┅┅❥⧽
║ ✦ Edad       ▸ ${edad}
║ ꕥ Reputación ▸ ${rep} pts
╠┅┉✦┉┅✦┅┉✦┉┅✦┉┅✦┅┅❥⧽
║「⌕」SOBRE MÍ
║ ฅ Cumpleaños » ${cumple}
║ ⚧ Género     » ${genero}
║ 🌎 Región     » ${region}
╚┅┉✦┉┅✦┅┉✦┉┅✦┉┅✦┅┅❥⧽</pre>

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
