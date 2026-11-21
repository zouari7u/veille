// Rafraîchit le « Fil en direct » sans recharger la page (toutes les 5 min).
(() => {
  const fil = document.getElementById('fil');
  if (!fil) return;
  const NAV = {cyber: 'Cyber', tech: 'Tech & IA', dental: 'Odontologie'};
  const ACC = {cyber: '#b45309', tech: '#7c3aed', dental: '#0284c7'};
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt = ts => { const d = new Date(ts * 1000); const p = n => String(n).padStart(2, '0');
    return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`; };
  const sev = s => s == null ? 'na' : s >= 9 ? 'crit' : s >= 7 ? 'high' : s >= 4 ? 'med' : 'low';
  const safe = u => /^https:\/\//.test(u || '') ? u : '#';
  let last = null;

  function render(data) {
    const items = (data.items || []).slice(0, 25);
    fil.innerHTML = items.map(it => {
      const cves = (it.cves || []).slice(0, 3).map(c =>
        ` <span class="cvepill ${sev(c.cvss)}">${esc([c.id, c.cvss != null ? 'CVSS ' + c.cvss : null, c.kev ? 'KEV' : null].filter(Boolean).join(' · '))}</span>`).join('');
      return `<li class="fl${it.score >= 5 ? ' hot' : ''}" style="--acc:${ACC[it.flux] || '#555'}">
        <time>${fmt(it.ts)}</time><span class="fx">${esc(NAV[it.flux] || it.flux)} · ${esc(it.tag)}</span>
        <a href="${esc(safe(it.url))}" rel="noopener">${esc(it.title)}</a>
        <p>${esc(it.summary)}${cves}</p><small>${esc(it.source)}</small></li>`;
    }).join('') || '<li class="fl"><p>Aucune alerte pour le moment.</p></li>';
    const u = document.getElementById('flashupd');
    if (u && data.updated) u.textContent = 'vérifié ' + fmt(data.updated);
  }

  async function poll() {
    try {
      const r = await fetch('flash.json?t=' + Date.now(), {cache: 'no-store'});
      const data = await r.json();
      if (last !== null && data.updated !== last) render(data);
      last = data.updated;
    } catch (e) {}
  }
  poll();
  setInterval(() => { if (!document.hidden) poll(); }, 5 * 60 * 1000);
})();
