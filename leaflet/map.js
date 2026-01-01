// ================================
// PlayNoVA — map.js (icons only, mobile-friendly legend)
// - Loads ONE GeoJSON file: data/novafunmap_12.31.25.geojson
// - Builds multiple toggle layers from tags
// - Auto-builds a legend from the same category list
// - NO halos (icons only)
// - Starts with NO categories selected
// - Legend: Show/Hide works (collapsed by default on mobile)
// ================================

// -------------------------------
// 0) Mobile detection
// -------------------------------
var isMobile = window.matchMedia("(max-width: 768px)").matches;

// -------------------------------
// 1) Create the map
// -------------------------------
var map = L.map('map').setView([38.95, -77.35], 10);

// -------------------------------
// 2) Base maps (free)
// -------------------------------
var cartoLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  subdomains: 'abcd',
  maxZoom: 20
});

var cartoVoyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  subdomains: 'abcd',
  maxZoom: 20
});

var cartoDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  subdomains: 'abcd',
  maxZoom: 20
});

var esriImagery = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { attribution: 'Tiles &copy; Esri', maxZoom: 19 }
);

var baseMaps = {
  "Light": cartoLight,
  "Voyager": cartoVoyager,
  "Dark": cartoDark,
  "Imagery": esriImagery
};

// Default basemap
cartoLight.addTo(map);

// -------------------------------
// 3) Helpers for icons + sport parsing
// -------------------------------

// IMPORTANT FIX:
// Always include the base class "poi-icon" so your CSS applies,
// and make the icon size/anchors match the CSS box.
function makeFaIcon(categoryClass, faHtml) {
  return L.divIcon({
    // include Leaflet's class + your own classes
    className: 'leaflet-div-icon poi-icon ' + categoryClass,
    html: faHtml,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -9]
  });
}


function sportHas(feature, val) {
  const s = (feature.properties && feature.properties.sport) || "";
  const txt = String(s);
  // support "laser_tag;something", "laser_tag something", etc.
  const parts = txt.split(/[;,]+/).map(x => x.trim()).filter(Boolean);
  if (parts.includes(val)) return true;
  // fallback (some data arrives as free text)
  return txt.includes(val);
}

// -------------------------------
// 4) Categories (no onByDefault => none selected initially)
// -------------------------------
var categories = [
  { name: "Mini Golf",          filter: f => f.properties?.leisure === "miniature_golf",    icon: makeFaIcon('mini-golf',   '<i class="fa-solid fa-golf-ball-tee"></i>'),      color: "#15693C" },
  { name: "Amusement Centers",  filter: f => f.properties?.leisure === "amusement_arcade",  icon: makeFaIcon('arcade',      '<i class="fa-brands fa-fort-awesome"></i>'),      color: "#694DBF" },
  { name: "Trampoline Parks",   filter: f => f.properties?.leisure === "trampoline_park",   icon: makeFaIcon('trampoline',  '<i class="fa-solid fa-person-falling"></i>'),      color: "#DB7202" },
  { name: "Laser Tag",          filter: f => sportHas(f, "laser_tag"),                      icon: makeFaIcon('laser',       '<i class="fa-solid fa-bullseye"></i>'),            color: "#D6665C" },
  { name: "Indoor Playgrounds", filter: f => f.properties?.leisure === "indoor_play",       icon: makeFaIcon('indoor-play', '<i class="fa-solid fa-child-reaching"></i>'),      color: "#187996" },
  { name: "Climbing Parks",     filter: f => sportHas(f, "climbing_adventure"),             icon: makeFaIcon('climbing',    '<i class="fa-solid fa-person-walking"></i>'),       color: "#A1953F" },
  { name: "Go Karts",           filter: f => sportHas(f, "karting"),                        icon: makeFaIcon('karting',     '<i class="fa-solid fa-flag-checkered"></i>'),      color: "#000000" },
  { name: "Escape Rooms",       filter: f => f.properties?.leisure === "escape_game",       icon: makeFaIcon('escape',      '<i class="fa-solid fa-puzzle-piece"></i>'),        color: "#2791C2" },
  { name: "Bowling",            filter: f => f.properties?.leisure === "bowling_alley",     icon: makeFaIcon('bowling',     '<i class="fa-solid fa-bowling-ball"></i>'),         color: "#121211" },
  { name: "Carousels",          filter: f => f.properties?.attraction === "carousel",       icon: makeFaIcon('carousel',    '<i class="fa-solid fa-horse-head"></i>'),           color: "#B80D7F" },
  { name: "Miniature Trains",   filter: f => f.properties?.attraction === "train",          icon: makeFaIcon('train',       '<i class="fa-solid fa-train"></i>'),                color: "#C91B0E" },
  { name: "Animal Scooters",    filter: f => f.properties?.attraction === "animal_scooter", icon: makeFaIcon('scooter',     '<i class="fa-solid fa-dragon"></i>'),               color: "#8A8432" },
  { name: "Water Parks",        filter: f => f.properties?.leisure === "water_park",        icon: makeFaIcon('water-park',  '<i class="fa-solid fa-water"></i>'),                color: "#0E59C9" },
  { name: "Animal Parks",       filter: f => f.properties?.tourism === "zoo",               icon: makeFaIcon('zoo',         '<i class="fa-solid fa-paw"></i>'),                  color: "#D19636" }
];

// -------------------------------
// 5) Legend (Show/Hide toggle) — DO NOT CHANGE
// -------------------------------
var legend = L.control({ position: isMobile ? "bottomleft" : "topleft" });

legend.onAdd = function () {
  var div = L.DomUtil.create("div", "legend");

  var itemsHtml = categories.map(cat => {
    return `
      <div class="legend-item">
        <span class="legend-swatch">
          <span class="legend-dot" style="background:${cat.color}"></span>
          <span class="legend-glyph" style="color:${cat.color}">${cat.icon.options.html}</span>
        </span>
        <span>${cat.name}</span>
      </div>
    `;
  }).join("");

  // Start collapsed on mobile, expanded on desktop
  div.innerHTML = `
    <div class="legend-header">
      <div class="legend-title">Legend</div>
      <button class="legend-toggle" type="button">
        ${isMobile ? "Show" : "Hide"}
      </button>
    </div>
    <div class="legend-body ${isMobile ? "is-collapsed" : ""}">
      ${itemsHtml}
    </div>
  `;

  // IMPORTANT: allow clicks on the button (and don't drag the map)
  L.DomEvent.disableClickPropagation(div);
  L.DomEvent.disableScrollPropagation(div);

  var btn = div.querySelector(".legend-toggle");
  var body = div.querySelector(".legend-body");

  btn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    body.classList.toggle("is-collapsed");
    btn.textContent = body.classList.contains("is-collapsed") ? "Show" : "Hide";
  });

  return div;
};

legend.addTo(map);

// -------------------------------
// 6) Build overlays from ONE GeoJSON file (icons only)
// -------------------------------
var overlays = {};

fetch('data/novafunmap_12.31.25.geojson')
  .then(r => {
    if (!r.ok) throw new Error(`GeoJSON HTTP ${r.status}`);
    return r.json();
  })
  .then(data => {

    categories.forEach(cat => {
      const points = L.geoJSON(data, {
        filter: cat.filter,
        pointToLayer: (feature, latlng) => L.marker(latlng, { icon: cat.icon }),
        onEachFeature: (feature, layer) => {
          const p = feature.properties || {};
          const name = p.name || "Unnamed";
          const city = p["addr:city"] || "";
          const state = p["addr:state"] || "";
          const website = p.website || "";

          const locationLine =
            (city || state) ? `${city}${city && state ? ", " : ""}${state}<br>` : "";

          const websiteLine =
            website ? `<a href="${website}" target="_blank" rel="noopener noreferrer">Website</a>` : "";

          layer.bindPopup(`<strong>${name}</strong><br>${locationLine}${websiteLine}`);
        }
      });

      overlays[cat.name] = points;
      // NOTE: no default addTo(map) — starts with NO categories selected
    });

    // Mobile: keep this collapsed so it doesn't cover the screen
    L.control.layers(baseMaps, overlays, { collapsed: isMobile }).addTo(map);

    // Mobile render sanity
    if (isMobile) {
      setTimeout(() => map.invalidateSize(), 200);
    }
  })
  .catch(err => console.error("GeoJSON load error:", err));
