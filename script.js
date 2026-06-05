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
   Doodle map
   A hand-drawn SVG sketch instead of a heavy interactive tile map.
   Pins are placed from the real lat/lng (so the layout stays honest)
   and joined by dashed "trail" lines you can follow between places.
   ------------------------------------------------------------------ */
const MAP_W = 760, MAP_H = 440, PAD_X = 150, PAD_Y = 120;

// Project a location's lat/lng into the SVG canvas.
const lats = LOCATIONS.map(l => l.lat);
const lngs = LOCATIONS.map(l => l.lng);
const latMin = Math.min(...lats), latMax = Math.max(...lats);
const lngMin = Math.min(...lngs), lngMax = Math.max(...lngs);
const lngSpan = (lngMax - lngMin) || 1;
const latSpan = (latMax - latMin) || 1;

function project(loc) {
  const x = PAD_X + ((loc.lng - lngMin) / lngSpan) * (MAP_W - 2 * PAD_X);
  const y = PAD_Y + ((latMax - loc.lat) / latSpan) * (MAP_H - 2 * PAD_Y); // north = up
  return { x, y };
}

// A gently bowed quadratic curve between two points — reads as hand-drawn.
function trail(a, b, bow = 26) {
  const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
  const dx = b.x - a.x, dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx + (-dy / len) * bow;
  const cy = my + ( dx / len) * bow;
  return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
}

// A doodle teardrop pin whose tip sits exactly on (x, y).
function pinSvg(loc, index) {
  const { x, y } = project(loc);
  const cy = y - 27; // centre of the pin's round head
  return `
    <g class="doodle-pin" data-pin="${loc.id}" style="--accent:${loc.accentColor}">
      <circle class="doodle-pin__ring" cx="${x}" cy="${y}" r="22" />
      <path class="doodle-pin__drop"
            d="M ${x} ${y}
               C ${x - 13} ${y - 18}, ${x - 15} ${y - 34}, ${x} ${y - 40}
               C ${x + 15} ${y - 34}, ${x + 13} ${y - 18}, ${x} ${y} Z"
            fill="${loc.accentColor}" />
      <circle class="doodle-pin__dot" cx="${x}" cy="${cy}" r="11" />
      <text class="doodle-pin__num" x="${x}" y="${cy}">${index + 1}</text>
    </g>`;
}

// Build the trail: connect the places west-to-east so the path reads naturally.
const route = [...LOCATIONS].sort((a, b) => a.lng - b.lng).map(project);
const trails = route.slice(1)
  .map((p, i) => `<path class="doodle-trail" d="${trail(route[i], p, i % 2 ? -26 : 26)}" />`)
  .join('');

const pins = LOCATIONS.map((loc, i) => pinSvg(loc, i)).join('');

document.getElementById('doodlemap').innerHTML = `
  <svg viewBox="0 0 ${MAP_W} ${MAP_H}" class="doodle-svg" role="presentation"
       preserveAspectRatio="xMidYMid meet">
    <!-- sketchy frame -->
    <rect class="doodle-frame" x="14" y="14" width="${MAP_W - 28}" height="${MAP_H - 28}" rx="10" />

    <!-- a winding river dash for flavour -->
    <path class="doodle-river" d="M 40 96 C 150 60, 230 150, 330 110 S 560 60, 720 130" />

    <!-- compass rose -->
    <g class="doodle-compass" transform="translate(${MAP_W - 70} 78)">
      <circle r="22" />
      <path d="M 0 -16 L 6 0 L 0 16 L -6 0 Z" />
      <text x="0" y="-28">N</text>
    </g>

    <!-- little tree doodles -->
    <g class="doodle-tree" transform="translate(96 350)">
      <path d="M 0 0 L -12 22 L 12 22 Z M 0 12 L -16 36 L 16 36 Z" />
      <line x1="0" y1="36" x2="0" y2="46" />
    </g>
    <g class="doodle-tree" transform="translate(660 320) scale(.85)">
      <path d="M 0 0 L -12 22 L 12 22 Z M 0 12 L -16 36 L 16 36 Z" />
      <line x1="0" y1="36" x2="0" y2="46" />
    </g>

    <!-- the dashed trail between places -->
    ${trails}

    <!-- the pins -->
    ${pins}

    <!-- hand-lettered place name -->
    <text class="doodle-place" x="${MAP_W / 2}" y="${MAP_H - 30}">~ Bastrop, Texas ~</text>
  </svg>`;

/* ------------------------------------------------------------------
   Cards — rendered from the same LOCATIONS array
   ------------------------------------------------------------------ */
const cardsEl = document.getElementById('cards');

cardsEl.innerHTML = LOCATIONS.map((loc) => {
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(loc.address)}`;
  const hasSite = loc.website && loc.website !== '#';
  return `
    <article class="card" data-card="${loc.id}">
      <div class="card__photo" style="background-image:url('${loc.photo}'); border-bottom-color:${loc.accentColor}"></div>
      <div class="card__body">
        <p class="card__type" style="color:${loc.accentColor}">${loc.type}</p>
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
   Interaction: hovering a card highlights its doodle pin; clicking a
   card scrolls up to the map and makes that pin pulse.
   ------------------------------------------------------------------ */
function pinEl(id) { return document.querySelector(`.doodle-pin[data-pin="${id}"]`); }

document.querySelectorAll('.card').forEach((card) => {
  const id = card.dataset.card;

  card.addEventListener('mouseenter', () => pinEl(id)?.classList.add('doodle-pin--active'));
  card.addEventListener('mouseleave', () => pinEl(id)?.classList.remove('doodle-pin--active'));

  card.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;            // let real links work
    document.querySelectorAll('.doodle-pin--active')
      .forEach(p => p.classList.remove('doodle-pin--active'));
    pinEl(id)?.classList.add('doodle-pin--active');
    document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});

/* footer year */
document.getElementById('year').textContent = new Date().getFullYear();
