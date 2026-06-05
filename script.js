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
   Map
   ------------------------------------------------------------------ */
const map = L.map('leaflet', { scrollWheelZoom: false }).setView([30.118, -97.31], 12);

// Soft, low-contrast tiles so the brand colors of the pins stand out.
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap &copy; CARTO',
  maxZoom: 19,
}).addTo(map);

// Build a pin DivIcon colored per location.
function makePin(loc, index) {
  return L.divIcon({
    className: '',
    html: `<div class="pin" data-pin="${loc.id}" style="background:${loc.accentColor}">
             <span>${index + 1}</span>
           </div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32],
  });
}

const markers = {};
LOCATIONS.forEach((loc, i) => {
  const marker = L.marker([loc.lat, loc.lng], { icon: makePin(loc, i) })
    .addTo(map)
    .bindPopup(`
      <p class="popup__type" style="color:${loc.accentColor}">${loc.type}</p>
      <p class="popup__name">${loc.name}</p>
      <p class="popup__addr">${loc.address}</p>
    `);
  markers[loc.id] = marker;
});

// Fit the map nicely to all three pins.
map.fitBounds(LOCATIONS.map(l => [l.lat, l.lng]), { padding: [60, 60] });

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
   Interaction: hovering a card highlights its map pin; clicking a
   card flies the map to that location and opens its popup.
   ------------------------------------------------------------------ */
function pinEl(id) { return document.querySelector(`.pin[data-pin="${id}"]`); }

document.querySelectorAll('.card').forEach((card) => {
  const id = card.dataset.card;

  card.addEventListener('mouseenter', () => pinEl(id)?.classList.add('pin--active'));
  card.addEventListener('mouseleave', () => pinEl(id)?.classList.remove('pin--active'));

  card.addEventListener('click', (e) => {
    if (e.target.closest('a')) return;            // let real links work
    const loc = LOCATIONS.find(l => l.id === id);
    map.flyTo([loc.lat, loc.lng], 14, { duration: 0.8 });
    markers[id].openPopup();
    document.getElementById('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});

/* footer year */
document.getElementById('year').textContent = new Date().getFullYear();
