// API Paris-graphie (Bouchaud Architectes) : lit les fichiers publiés chaque semaine par le robot sur GitHub Pages.
const SITE = 'https://hubbokobza-lab.github.io/paris-graphie/';
const LON0 = 2.2255, LAT0 = 48.8162, KX = 111320 * Math.cos(LAT0 * Math.PI / 180), KY = 110574;
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'content-type, mcp-session-id, mcp-protocol-version' };
const J = (o, st = 200) => new Response(JSON.stringify(o, null, 1), { status: st, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=600', ...CORS } });

async function site(path, ttl = 3600) {          // fichier publié (parfois compressé en gzip sans en-tête)
  const r = await fetch(SITE + path, { cf: { cacheTtl: ttl, cacheEverything: true } });
  if (!r.ok) return null;
  const b = new Uint8Array(await r.arrayBuffer());
  const txt = (b[0] === 0x1f && b[1] === 0x8b) ? await new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'))).text() : new TextDecoder().decode(b);
  return JSON.parse(txt);
}
const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const nz = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

async function geocode(q) {
  const u = 'https://data.geopf.fr/geocodage/search?limit=5&q=' + encodeURIComponent(/paris|750\d\d/i.test(q) ? q : q + ' Paris');
  const r = await fetch(u).then(r => r.json()).catch(() => null);
  const f = (r && r.features || []).find(f => String(f.properties.citycode || '').startsWith('751'));
  return f ? f.properties : null;
}
let INDEX = null;
async function voieSlug(street) {
  INDEX = INDEX || await site('api/voies.json');
  const z = nz(street), v = INDEX && INDEX.voies.find(x => nz(x[0]) === z);
  return v ? v[1] : slug(street);
}
async function walk(lon, lat) {
  const G = await site('gares.json'); if (!G) return [];
  const x = (lon - LON0) * KX, y = (lat - LAT0) * KY;
  const C = G.filter(g => /Métro|RER/.test(g[2])).map(g => [Math.hypot(g[0] - x, g[1] - y), g]).sort((a, b) => a[0] - b[0]).slice(0, 4);
  const R = await Promise.all(C.map(async ([d, g]) => {
    const glo = LON0 + g[0] / KX, gla = LAT0 + g[1] / KY;
    try {
      const r = await fetch(`https://data.geopf.fr/navigation/itineraire?resource=bdtopo-osrm&profile=pedestrian&optimization=shortest&start=${lon},${lat}&end=${glo.toFixed(6)},${gla.toFixed(6)}&distanceUnit=meter&timeUnit=minute&getSteps=false&geometryFormat=polyline`).then(r => r.json());
      if (r && r.distance > 0) return { station: g[2], distance_a_pied_m: Math.round(r.distance), temps_a_pied_min: Math.max(1, Math.round(r.distance / 75)), calcul: 'itinéraire piéton IGN' };
    } catch (e) {}
    return { station: g[2], distance_a_pied_m: Math.round(d * 1.3), temps_a_pied_min: Math.max(1, Math.round(d * 1.3 / 75)), calcul: 'estimation (vol d\'oiseau × 1,3)' };
  }));
  return R.sort((a, b) => a.distance_a_pied_m - b.distance_a_pied_m).slice(0, 3);
}

async function adresse(q, opts = {}) {
  const g = await geocode(q);
  if (!g || !g.street) return { saisie: q, statut: 'adresse introuvable à Paris' };
  const sl = await voieSlug(g.street), V = await site('api/voies/' + sl + '.json');
  if (!V) return { saisie: q, statut: 'voie absente des données', voie: g.street };
  const num = String(g.housenumber || '').toLowerCase().replace(/^(\d+)\s*(bis|ter|quater|b|t|q)?$/, (m, n, s) => n + (s ? ' ' + ({ b: 'bis', t: 'ter', q: 'quater' }[s] || s) : ''));
  let k = V.numeros[num], approx = false;
  if (k == null && g.housenumber) {           // numéro absent : le plus proche du même côté
    const n0 = parseInt(g.housenumber); let bd = 1e9;
    for (const [n, b] of Object.entries(V.numeros)) { const d = Math.abs(parseInt(n) - n0); if ((parseInt(n) - n0) % 2 === 0 && d < bd) { bd = d; k = b; } }
    if (bd > 6) k = null; else approx = true;
  }
  if (k == null) return { saisie: q, statut: 'aucun bâtiment rattaché à cette adresse', adresse: g.label };
  const row = Object.fromEntries(V.champs.map((c, i) => [c, V.batiments[k][i]]).filter(([, v]) => v !== null && v !== ''));
  const out = { saisie: q, statut: approx ? 'ok (numéro voisin)' : 'ok', adresse: g.label, batiment: Number(k), carte: SITE + '?b=' + row.lon + ',' + row.lat, indicateurs: row };
  if (opts.walk !== false && row.lon) out.metro_rer_a_pied = await walk(row.lon, row.lat);
  out.sources = 'https://' + opts.host + '/sources';
  out.editeur = 'Paris-graphie, Bouchaud Architectes (https://www.bouchaudarchitectes.com/hors-piste/paris-graphie)';
  out.avertissement = 'Données ouvertes, rattachements approximatifs ; surface de plancher et indice de vacance sont des estimations. Vérifier sur les sources.';
  return out;
}

const DOC = host => ({
  nom: 'API Paris-graphie (Bouchaud Architectes)',
  editeur: 'Bouchaud Architectes, Paris',
  presentation: 'https://www.bouchaudarchitectes.com/hors-piste/paris-graphie',
  contact: 'h.bokobza@bouchaudarchitectes.com (anomalie, réclamation, question)',
  description: 'Indicateurs des immeubles de Paris intra-muros (âge, hauteur, niveaux, surface de plancher estimée, usages, DPE, patrimoine, PLU, autorisations d\'urbanisme, occupants, propriétaires personnes morales, suspicion de vacance des bureaux), mis à jour chaque semaine à partir de données ouvertes.',
  carte: SITE,
  points_d_acces: {
    ['https://' + host + '/adresse?q=40 rue Laffitte']: 'un immeuble, avec distances à pied au métro et RER (ajouter &marche=0 pour les omettre)',
    ['https://' + host + '/adresses?q=12 rue de Rivoli|3 boulevard Haussmann']: 'jusqu\'à 25 adresses séparées par | (sans distances à pied)',
    ['https://' + host + '/voie?nom=rue Laffitte']: 'tous les bâtiments d\'une voie',
    ['https://' + host + '/sources']: 'sources, producteur de chaque indicateur et dates d\'extraction',
    ['https://' + host + '/mcp']: 'serveur MCP (outils pour assistants IA, transport HTTP)'
  },
  licence: 'Données ouvertes (ODbL ou Licence Ouverte selon le producteur). Citer les sources listées sur /sources.'
});

// ---------- serveur MCP minimal (JSON-RPC sur HTTP, sans état)
const TOOLS = [
  { name: 'immeuble_paris', description: 'Indicateurs d\'un immeuble de Paris à partir de son adresse : année, hauteur, niveaux, surface de plancher estimée, usages, DPE, patrimoine, PLU, permis, occupants, propriétaires personnes morales, suspicion de vacance, métro et RER à pied. Avec les sources.', inputSchema: { type: 'object', properties: { adresse: { type: 'string', description: 'Adresse à Paris, ex. 40 rue Laffitte' } }, required: ['adresse'] } },
  { name: 'immeubles_paris', description: 'Mêmes indicateurs pour une liste d\'adresses à Paris (25 au plus), sans distances à pied.', inputSchema: { type: 'object', properties: { adresses: { type: 'array', items: { type: 'string' } } }, required: ['adresses'] } },
  { name: 'sources_paris_graphie', description: 'Liste des sources de données, producteur de chaque indicateur et dates d\'extraction.', inputSchema: { type: 'object', properties: {} } }
];
async function mcp(req, host) {
  const m = await req.json().catch(() => null);
  const one = async r => {
    if (!r || r.id === undefined) return null;   // notification
    const ok = result => ({ jsonrpc: '2.0', id: r.id, result });
    if (r.method === 'initialize') return ok({ protocolVersion: (r.params && r.params.protocolVersion) || '2025-03-26', capabilities: { tools: {} }, serverInfo: { name: 'paris-graphie', version: '1.0' }, instructions: 'Paris-graphie, outil de Bouchaud Architectes : données ouvertes sur les immeubles de Paris intra-muros. Toujours citer les sources renvoyées. Contact : h.bokobza@bouchaudarchitectes.com' });
    if (r.method === 'ping') return ok({});
    if (r.method === 'tools/list') return ok({ tools: TOOLS });
    if (r.method === 'tools/call') {
      const a = r.params.arguments || {}; let res;
      if (r.params.name === 'immeuble_paris') res = await adresse(String(a.adresse || ''), { host });
      else if (r.params.name === 'immeubles_paris') res = await Promise.all((a.adresses || []).slice(0, 25).map(q => adresse(String(q), { host, walk: false })));
      else if (r.params.name === 'sources_paris_graphie') res = await site('api/sources.json');
      else return { jsonrpc: '2.0', id: r.id, error: { code: -32602, message: 'outil inconnu' } };
      return ok({ content: [{ type: 'text', text: JSON.stringify(res) }] });
    }
    return { jsonrpc: '2.0', id: r.id, error: { code: -32601, message: 'méthode non prise en charge' } };
  };
  const out = Array.isArray(m) ? (await Promise.all(m.map(one))).filter(Boolean) : await one(m);
  if (!out || (Array.isArray(out) && !out.length)) return new Response(null, { status: 202, headers: CORS });
  return J(out);
}

export default {
  async fetch(req) {
    const u = new URL(req.url), host = u.host, p = u.pathname.replace(/\/+$/, '') || '/';
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    try {
      if (p === '/mcp') return req.method === 'POST' ? mcp(req, host) : J({ erreur: 'serveur MCP : utiliser POST (JSON-RPC)' }, 405);
      if (p === '/') return J(DOC(host));
      if (p === '/sources') return J(await site('api/sources.json'));
      if (p === '/adresse') { const q = u.searchParams.get('q'); if (!q) return J({ erreur: 'paramètre q manquant' }, 400); return J(await adresse(q, { host, walk: u.searchParams.get('marche') !== '0' })); }
      if (p === '/adresses') { const L = (u.searchParams.get('q') || '').split('|').map(s => s.trim()).filter(Boolean).slice(0, 25); return J({ resultats: await Promise.all(L.map(q => adresse(q, { host, walk: false }))), sources: 'https://' + host + '/sources' }); }
      if (p === '/voie') { const n = u.searchParams.get('nom'); if (!n) return J({ erreur: 'paramètre nom manquant' }, 400); const V = await site('api/voies/' + await voieSlug(n) + '.json'); return V ? J(V) : J({ erreur: 'voie introuvable' }, 404); }
      return J({ erreur: 'point d\'accès inconnu', aide: 'https://' + host + '/' }, 404);
    } catch (e) { return J({ erreur: String(e && e.message || e) }, 500); }
  }
};
