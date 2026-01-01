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
// 3) Helpers
// -------------------------------

// Leaflet + your class names; keep marker icon separate from legend HTML.
// Markers get a colored wrapper span so they ALWAYS show (even if CSS is weird).
function makeMarkerIcon(categoryClass, faHtml, color) {
  return L.divIcon({
    className: 'leaflet-div-icon poi-icon ' + categoryClass,
    html: `<span class="poi-fa" style="color:${color}">${faHtml}</span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -9]
  });
}

// Legend should stay unchanged: it expects cat.icon.options.html
function makeLegendIcon(faHtml) {
  return L.divIcon({
    className: 'poi-icon',
    html: faHtml,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
}

function sportHas(feature, val) {
  const s = (feature.properties && feature.properties.sport) || "";
  const txt = String(s);
  const parts = txt.split(/[;,]+/).map(x => x.trim()).filter(Boolean);
  if (parts.includes(val)) return true;
  return txt.includes(val);
}

// -------------------------------
// 4) Categories (none selected initially)
// -------------------------------
var categories = [
  { name: "Mini Golf",          key: "mini-golf",   color: "#15693C", fa: '<i class="fa-solid fa-golf-ball-tee"></i>',       filter: f => f.properties?.leisure === "miniature_golf" },
  { name: "Amusement Centers",  key: "arcade",      color: "#694DBF", fa: '<i class="fa-brands fa-fort-awesome"></i>',       filter: f => f.properties?.leisure === "amusement_arcade" },
  { name: "Trampoline Parks",   key: "trampoline",  color: "#DB7202", fa: '<i class="fa-solid fa-person-falling"></i>',      filter: f => f.properties?.leisure === "trampoline_park" },
  { name: "Laser Tag",          key: "laser",       color: "#D6665C", fa: '<i class="fa-solid fa-bullseye"></i>',            filter: f => sportHas(f, "laser_tag") },
  { name: "Indoor Playgrounds", key: "indoor-play", color: "#187996", fa: '<i class="fa-solid fa-child-reaching"></i>',      filter: f => f.properties?.leisure === "indoor_play" },
  { name: "Climbing Parks",     key: "climbing",    color: "#A1953F", fa: '<i class="fa-solid fa-person-walking"></i>',      filter: f => sportHas(f, "climbing_adventure") },
  { name: "Go Karts",           key: "karting",     color: "#000000", fa: '<i class="fa-solid fa-flag-checkered"></i>',      filter: f => sportHas(f, "karting") },
  { name: "Escape Rooms",       key: "escape",      color: "#2791C2", fa: '<i class="fa-solid fa-puzzle-piece"></i>',        filter: f => f.properties?.leisure === "escape_game" },
  { name: "Bowling",            key: "bowling",     color: "#121211", fa: '<i class="fa-solid fa-bowling-ball"></i>',         filter: f => f.properties?.leisure === "bowling_alley" },
  { name: "Carousels",          key: "carousel",    color: "#B80D7F", fa: '<i class="fa-solid fa-horse-head"></i>',           filter: f => f.properties?.attraction === "carousel" },
  { name: "Miniature Trains",   key: "train",       color: "#C91B0E", fa: '<i class="fa-solid fa-train"></i>',                filter: f => f.properties?.attraction === "train" },
  { name: "Animal Scooters",    key: "scooter",     color: "#8A8432", fa: '<i class="fa-solid fa-dragon"></i>',               filter: f => f.properties?.attraction === "animal_scooter" },
  { name: "Water Parks",        key: "water-park",  color: "#0E59C9", fa: '<i class="fa-solid fa-water"></i>',                filter: f => f.properties?.leisure === "water_park" },
  { name: "Animal Parks",       key: "zoo",         color: "#D19636", fa: '<i class="fa-solid fa-paw"></i>',                  filter: f => f.properties?.tourism === "zoo" }
];

// Build both icon types
categories.forEach(cat => {
  cat.icon = makeLegendIcon(cat.fa);                    // used by legend ONLY
  cat.markerIcon = makeMarkerIcon(cat.key, cat.fa, cat.color); // used by map markers
});

// -------------------------------
// 5) Legend (Show/Hide toggle) — UNCHANGED
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
        pointToLayer: (feature, latlng) => L.marker(latlng, { icon: cat.markerIcon }),
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
    });

    L.control.layers(baseMaps, overlays, { collapsed: isMobile }).addTo(map);

    if (isMobile) {
      setTimeout(() => map.invalidateSize(), 200);
    }
  })
  .catch(err => console.error("GeoJSON load error:", err));
