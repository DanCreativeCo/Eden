/* ============================================================
   The Eden Family — hub logic
   One data array drives BOTH the map pins and the location cards.
   ============================================================ */

/* ------------------------------------------------------------------
   👇 THE ONE PLACE TO EDIT.  Everything on the page reads from this.
   Coordinates are PLACEHOLDERS around Bastrop, TX — swap in real ones.
   Fields: id, name, type, blurb, lat, lng, address, website,
           accentColor (pin + card color), photo (header image URL)
   ------------------------------------------------------------------ */
const LOCATIONS = [
  {
    id: 'storehouse',
    name: 'Storehouse Market & Eatery',
    type: 'Market · Eatery',
    blurb: 'A market and table on Main Street — seasonal plates, a stocked larder, and a room made for lingering.',
    lat: 30.1105,
    lng: -97.3155,
    address: '813 Main Street, Bastrop, TX 78602',
    website: 'https://storehousebastrop.com',
    accentColor: '#9C5B3B',   // terracotta
    photo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=700&q=80',
  },
  {
    id: 'eden-east',
    name: 'Eden East Farms',
    type: 'The Farm',
    blurb: 'Where it all begins. A working farm just outside town, growing the produce that fills our tables.',
    lat: 30.1432,
    lng: -97.2789,
    address: 'Near Bastrop, TX · address coming soon',
    website: '#',
    accentColor: '#6B7A4F',   // olive
    photo: 'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=700&q=80',
  },
  {
    id: 'soil-to-table',
    name: 'Soil to Table',
    type: 'Consulting',
    blurb: 'Helping other growers and kitchens close the loop — from soil health to the plate, the way we do it.',
    lat: 30.0978,
    lng: -97.3402,
    address: 'Bastrop, TX · by appointment',
    website: '#',
    accentColor: '#0A0A0A',   // ink
    photo: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=700&q=80',
  },
];

/* ------------------------------------------------------------------
   Illustrated map
   A bespoke, editorial map sketch — paper texture + vignette, a faint
   graticule, a winding river, soft forest, topographic contours behind
   each place, a "marching" trail you can follow, labelled markers, a
   compass rose and a scale bar. Everything is drawn from the real
   lat/lng so the geography stays honest, and it animates in on scroll.
   ------------------------------------------------------------------ */
const MAP_W = 800, MAP_H = 540, PAD_X = 178, PAD_Y = 150;

const lats = LOCATIONS.map(l => l.lat);
const lngs = LOCATIONS.map(l => l.lng);
const latMin = Math.min(...lats), latMax = Math.max(...lats);
const lngMin = Math.min(...lngs), lngMax = Math.max(...lngs);
const lngSpan = (lngMax - lngMin) || 1;
const latSpan = (latMax - latMin) || 1;

// Project a location's lat/lng into the SVG canvas (north = up).
function project(loc) {
  const x = PAD_X + ((loc.lng - lngMin) / lngSpan) * (MAP_W - 2 * PAD_X);
  const y = PAD_Y + ((latMax - loc.lat) / latSpan) * (MAP_H - 2 * PAD_Y);
  return { x, y };
}
const r1 = n => Math.round(n * 10) / 10;

// Smooth Catmull-Rom path through the projected points → an elegant winding road.
function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M ${r1(pts[0].x)} ${r1(pts[0].y)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i], p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${r1(c1x)} ${r1(c1y)} ${r1(c2x)} ${r1(c2y)} ${r1(p2.x)} ${r1(p2.y)}`;
  }
  return d;
}

// Concentric elevation rings behind a pin — subtle topographic depth.
function contours(loc) {
  const { x, y } = project(loc);
  return [36, 26, 16].map((r, i) =>
    `<circle class="map-contour" data-contour="${loc.id}" cx="${r1(x)}" cy="${r1(y)}" r="${r}"
             style="--accent:${loc.accentColor};animation-delay:${0.15 + i * 0.1}s" />`
  ).join('');
}

// A soft, rounded tree doodle (farm-country, not pine).
function tree(tx, ty, s = 1) {
  return `<g class="map-tree" transform="translate(${tx} ${ty}) scale(${s})">
    <line class="map-tree__trunk" x1="0" y1="0" x2="0" y2="12" />
    <path class="map-tree__top"
          d="M0 -22 C 11 -23 15 -9 9 -3 C 15 -3 13 8 0 6 C -13 8 -15 -3 -9 -3 C -15 -9 -11 -23 0 -22 Z" />
  </g>`;
}

// A refined map marker whose tip sits exactly on (x, y), with a labelled callout.
function markerSvg(loc, index) {
  const { x, y } = project(loc);
  const headY = y - 31;
  const right = x < MAP_W / 2;
  const lx = right ? x + 24 : x - 24;
  const anchor = right ? 'start' : 'end';
  return `
    <g class="map-marker" data-pin="${loc.id}" style="--accent:${loc.accentColor};--i:${index}">
      <g class="map-marker__label">
        <text class="map-label__name" x="${r1(lx)}" y="${r1(headY - 21)}" text-anchor="${anchor}">${loc.name}</text>
        <text class="map-label__type" x="${r1(lx)}" y="${r1(headY - 7)}" text-anchor="${anchor}">${loc.type}</text>
      </g>
      <g class="map-marker__pin">
        <ellipse class="map-marker__shadow" cx="${r1(x)}" cy="${r1(y + 3)}" rx="11" ry="3.5" />
        <path class="map-marker__body"
              d="M ${r1(x)} ${r1(y)}
                 C ${r1(x - 14)} ${r1(y - 20)}, ${r1(x - 16)} ${r1(y - 38)}, ${r1(x)} ${r1(headY - 11)}
                 C ${r1(x + 16)} ${r1(y - 38)}, ${r1(x + 14)} ${r1(y - 20)}, ${r1(x)} ${r1(y)} Z" />
        <circle class="map-marker__disc" cx="${r1(x)}" cy="${r1(headY)}" r="11.5" />
        <text class="map-marker__num" x="${r1(x)}" y="${r1(headY)}">${index + 1}</text>
      </g>
    </g>`;
}

// Geometry shared by the template.
const routePts  = [...LOCATIONS].sort((a, b) => a.lng - b.lng).map(project);
const trailPath = smoothPath(routePts);
const contoursAll = LOCATIONS.map(contours).join('');
const markers   = LOCATIONS.map((loc, i) => markerSvg(loc, i)).join('');

// A faint surveyor's graticule.
let grat = '';
for (let gx = 110; gx < MAP_W - 60; gx += 95) grat += `<line class="map-grat" x1="${gx}" y1="26" x2="${gx}" y2="${MAP_H - 26}" />`;
for (let gy = 100; gy < MAP_H - 60; gy += 95) grat += `<line class="map-grat" x1="26" y1="${gy}" x2="${MAP_W - 26}" y2="${gy}" />`;

const trees = [[70, 360, 1.05], [104, 388, 0.78], [708, 398, 1], [672, 366, 0.8]]
  .map(([tx, ty, s]) => tree(tx, ty, s)).join('');

document.getElementById('doodlemap').innerHTML = `
  <svg viewBox="0 0 ${MAP_W} ${MAP_H}" class="doodle-svg" role="presentation"
       preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="edPaper" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fdfbf7" />
        <stop offset="1" stop-color="#f2ebdd" />
      </linearGradient>
      <radialGradient id="edVignette" cx="50%" cy="44%" r="72%">
        <stop offset="58%" stop-color="#000" stop-opacity="0" />
        <stop offset="100%" stop-color="#5e4d35" stop-opacity="0.17" />
      </radialGradient>
      <linearGradient id="edRiver" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#c4d8dc" />
        <stop offset="1" stop-color="#a3c0c9" />
      </linearGradient>
      <filter id="edShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#3a2c1a" flood-opacity="0.30" />
      </filter>
      <filter id="edGrain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="n" />
        <feColorMatrix in="n" type="saturate" values="0" />
      </filter>
      <clipPath id="edClip"><rect x="22" y="22" width="${MAP_W - 44}" height="${MAP_H - 44}" rx="14" /></clipPath>
    </defs>

    <!-- paper bed + everything that lives "inside" the sheet -->
    <g clip-path="url(#edClip)">
      <rect x="22" y="22" width="${MAP_W - 44}" height="${MAP_H - 44}" fill="url(#edPaper)" />
      ${grat}

      <!-- a winding river + a little pond -->
      <path class="map-river" d="M 24 122 C 168 78 252 198 360 150 S 602 70 ${MAP_W - 24} 184" />
      <ellipse class="map-pond" cx="250" cy="408" rx="46" ry="25" />

      <!-- soft forest -->
      ${trees}

      <!-- topographic contours behind each place -->
      ${contoursAll}

      <!-- the trail between places: a soft casing under a marching dash -->
      <path class="map-trail__casing" d="${trailPath}" />
      <path class="map-trail" d="${trailPath}" />

      <!-- printed-paper grain + vignette -->
      <rect class="map-grain" x="22" y="22" width="${MAP_W - 44}" height="${MAP_H - 44}" filter="url(#edGrain)" />
      <rect x="22" y="22" width="${MAP_W - 44}" height="${MAP_H - 44}" fill="url(#edVignette)" />
    </g>

    <!-- double-line cartouche frame -->
    <rect class="map-frame-outer" x="14" y="14" width="${MAP_W - 28}" height="${MAP_H - 28}" rx="18" />
    <rect class="map-frame-inner" x="24" y="24" width="${MAP_W - 48}" height="${MAP_H - 48}" rx="11" />

    <!-- markers + labels sit above the frame so callouts can breathe -->
    ${markers}

    <!-- compass rose -->
    <g class="map-compass" transform="translate(${MAP_W - 66} 70)">
      <circle class="map-compass__ring"  r="26" />
      <circle class="map-compass__ring2" r="20" />
      <path class="map-compass__star"  d="M0 -25 L5 -5 L25 0 L5 5 L0 25 L-5 5 L-25 0 L-5 -5 Z" />
      <path class="map-compass__star2" d="M0 -14 L4 -4 L14 0 L4 4 L0 14 L-4 4 L-14 0 L-4 -4 Z" />
      <text class="map-compass__n" x="0" y="-30">N</text>
    </g>

    <!-- scale bar -->
    <g class="map-scale" transform="translate(58 ${MAP_H - 46})">
      <line x1="0" y1="0" x2="84" y2="0" />
      <line x1="0" y1="-4" x2="0" y2="4" />
      <line x1="42" y1="-3" x2="42" y2="3" />
      <line x1="84" y1="-4" x2="84" y2="4" />
      <text x="0" y="15">0</text>
      <text x="84" y="15">2 mi</text>
    </g>

    <!-- hand-set place name -->
    <text class="map-title" x="${MAP_W / 2}" y="${MAP_H - 34}">B A S T R O P · T E X A S</text>
  </svg>`;

// Animate the map in once it scrolls into view.
const mapEl = document.getElementById('doodlemap');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { mapEl.classList.add('is-visible'); io.disconnect(); }
    });
  }, { threshold: 0.25 });
  io.observe(mapEl);
} else {
  mapEl.classList.add('is-visible');
}

/* ------------------------------------------------------------------
   Cards — rendered from the same LOCATIONS array
   ------------------------------------------------------------------ */
const cardsEl = document.getElementById('cards');

cardsEl.innerHTML = LOCATIONS.map((loc, index) => {
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(loc.address)}`;
  const hasSite = loc.website && loc.website !== '#';
  return `
    <article class="card" data-card="${loc.id}" style="--accent:${loc.accentColor}">
      <div class="card__photo" style="background-image:url('${loc.photo}')"></div>
      <div class="card__body">
        <p class="card__type"><span>${String(index + 1).padStart(2, '0')}</span>${loc.type}</p>
        <h3 class="card__name">${loc.name}</h3>
        <p class="card__blurb">${loc.blurb}</p>
        <p class="card__addr">${loc.address}</p>
        <div class="card__links">
          <a class="card__link" href="${directions}" target="_blank" rel="noopener">— Directions —</a>
          ${hasSite
            ? `<a class="card__link card__link--ghost" href="${loc.website}" target="_blank" rel="noopener">— Visit Site —</a>`
            : `<span class="card__link card__link--ghost" style="opacity:.5;cursor:default">— Site Soon —</span>`}
        </div>
      </div>
    </article>`;
}).join('');

/* ------------------------------------------------------------------
   Interaction: hovering a card highlights its map marker; clicking a
   card scrolls up to the map and makes that marker pulse.
   ------------------------------------------------------------------ */
function markerByID(id) { return document.querySelector(`.map-marker[data-pin="${id}"]`); }
function contoursByID(id) { return document.querySelectorAll(`.map-contour[data-contour="${id}"]`); }
function setMapActive(id, isActive) {
  markerByID(id)?.classList.toggle('map-marker--active', isActive);
  contoursByID(id).forEach((contour) => contour.classList.toggle('map-contour--active', isActive));
}
function clearMapActive() {
  document.querySelectorAll('.map-marker--active')
    .forEach(m => m.classList.remove('map-marker--active'));
  document.querySelectorAll('.map-contour--active')
    .forEach(c => c.classList.remove('map-contour--active'));
}

document.querySelectorAll('.card').forEach((card) => {
  const id = card.dataset.card;

  card.addEventListener('mouseenter', () => setMapActive(id, true));
  card.addEventListener('mouseleave', () => setMapActive(id, false));

  card.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;            // let real links work
    clearMapActive();
    setMapActive(id, true);
    document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});

/* footer year */
document.getElementById('year').textContent = new Date().getFullYear();
