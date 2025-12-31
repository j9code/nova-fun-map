// ================================
// - Loads ONE GeoJSON file: data/novafunmap_12.30.25.geojson
// - Builds multiple toggle layers from tags
// - Auto-builds a legend from the same category list
// ================================

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

cartoLight.addTo(map);

// -------------------------------
// 3) Helpers for icons + sport parsing
// -------------------------------
function makeFaIcon(extraClass, faHtml) {
  return L.divIcon({
    className: extraClass,  // styled by CSS
    html: faHtml,
    iconSize: [8, 8],
    iconAnchor: [4, 8]
  });
}

function sportHas(feature, val) {
  const s = (feature.properties && feature.properties.sport) || "";
  const txt = String(s);
  // Handles values like "karting" or "karting;something"
  return txt.split(/[;,\s]+/).includes(val) || txt.includes(val);
}

// -------------------------------
// 4) Category list (single source of truth)
//    - name: label in control + legend
//    - filter: decides whether a feature is in that category
//    - icon: Font Awesome marker icon
//    - ring: halo ring color
//    - onByDefault: start visible
// -------------------------------
var categories = [
  { name: "Mini Golf",          filter: f => f.properties?.leisure === "miniature_golf",   icon: makeFaIcon('poi-icon mini-golf',   '<i class="fa-solid fa-golf-ball-tee"></i>'), ring: "#2e7d32", onByDefault: true },
  { name: "Amusement Centers",  filter: f => f.properties?.leisure === "amusement_arcade", icon: makeFaIcon('poi-icon arcade',      '<i class="fa-solid fa-gamepad"></i>'),       ring: "#6a1b9a", onByDefault: true },
  { name: "Trampoline Parks",   filter: f => f.properties?.leisure === "trampoline_park",  icon: makeFaIcon('poi-icon trampoline',  '<i class="fa-solid fa-person-falling"></i>'),ring: "#0277bd", onByDefault: true },
  { name: "Escape Rooms",       filter: f => f.properties?.leisure === "escape_game",      icon: makeFaIcon('poi-icon escape',      '<i class="fa-solid fa-key"></i>'),           ring: "#424242", onByDefault: true },
  { name: "Bowling",            filter: f => f.properties?.leisure === "bowling_alley",    icon: makeFaIcon('poi-icon bowling',     '<i class="fa-solid fa-bowling-ball"></i>'),  ring: "#039be5", onByDefault: true },
  { name: "Indoor Playgrounds", filter: f => f.properties?.leisure === "indoor_play",      icon: makeFaIcon('poi-icon indoor-play', '<i class="fa-solid fa-child"></i>'),          ring: "#00897b", onByDefault: true },
  { name: "Laser Tag",          filter: f => sportHas(f, "laser_tag"),                     icon: makeFaIcon('poi-icon laser',       '<i class="fa-solid fa-bullseye"></i>'),       ring: "#e91e63", onByDefault: true },
  { name: "Climbing Parks",     filter: f => sportHas(f, "climbing_adventure"),            icon: makeFaIcon('poi-icon climbing',    '<i class="fa-solid fa-mountain"></i>'),       ring: "#455a64", onByDefault: true },
  { name: "Go Karts",           filter: f => sportHas(f, "karting"),                       icon: makeFaIcon('poi-icon karting',     '<i class="fa-solid fa-flag-checkered"></i>'), ring: "#000000", onByDefault: true },
  { name: "Carousels",          filter: f => f.properties?.attraction === "carousel",      icon: makeFaIcon('poi-icon carousel',    '<i class="fa-solid fa-rotate"></i>'),         ring: "#3d7d6d" },
  { name: "Miniature Trains",   filter: f => f.properties?.attraction === "train",         icon: makeFaIcon('poi-icon train',       '<i class="fa-solid fa-train"></i>'),          ring: "#3d7d6d" },
  { name: "Animal Scooters",    filter: f => f.properties?.attraction === "animal_scooter",icon: makeFaIcon('poi-icon scooter',     '<i class="fa-solid fa-person-snowboarding"></i>'), ring: "#f9a825" },
  { name: "Water Parks",        filter: f => f.properties?.leisure === "water_park",       icon: makeFaIcon('poi-icon water-park',  '<i class="fa-solid fa-water"></i>'),          ring: "#039be5" },
  { name: "Animal Parks",       filter: f => f.properties?.tourism === "zoo",              icon: makeFaIcon('poi-icon zoo',         '<i class="fa-solid fa-paw"></i>'),           ring: "#5d4037" },
];

// -------------------------------
// 5) Legend (auto-built from categories)
// -------------------------------
var legend = L.control({ position: "topleft" });

legend.onAdd = function () {
  var div = L.DomUtil.create("div", "legend");

  var itemsHtml = categories.map(cat => {
    // Use the same halo style as the map; icon glyph from cat.icon.options.html
    return `
      <div class="legend-item">
        <span class="legend-swatch">
          <span class="legend-halo" style="border-color:${cat.ring}"></span>
          <span class="legend-glyph">${cat.icon.options.html}</span>
        </span>
        <span>${cat.name}</span>
      </div>
    `;
  }).join("");

  div.innerHTML = `
    <div class="legend-title">Legend</div>
    ${itemsHtml}
  `;
  return div;
};

legend.addTo(map);

// -------------------------------
// 6) Build overlays from ONE GeoJSON file
//    - Each category gets its own halo layer + points layer
//    - Both are grouped so toggling works cleanly
// -------------------------------
var overlays = {};
var defaultBounds = null;

// Load once
fetch('data/novafunmap_12.30.25.geojson')
  .then(r => {
    if (!r.ok) throw new Error(`GeoJSON HTTP ${r.status}`);
    return r.json();
  })
  .then(data => {

    categories.forEach(cat => {
      const halo = L.layerGroup();
      const points = L.geoJSON(data, {
        filter: cat.filter,
        pointToLayer: (feature, latlng) => {
          // White halo with colored ring
          L.circleMarker(latlng, {
            radius: 11,
            fillColor: "#ffffff",
            fillOpacity: 1.0,
            color: cat.ring,
            weight: 2
          }).addTo(halo);

          // Icon on top
          return L.marker(latlng, { icon: cat.icon });
        },
        onEachFeature: (feature, layer) => {
          const p = feature.properties || {};
          const name = p.name || "Unnamed";
          const city = p["addr:city"] || "";
          const state = p["addr:state"] || "";
          const website = p.website || "";

          const locationLine =
            (city || state) ? `${city}${city && state ? ", " : ""}${state}<br>` : "";

          const websiteLine =
            website ? `<a href="${website}" target="_blank" rel="noopener">Website</a>` : "";

          layer.bindPopup(`<strong>${name}</strong><br>${locationLine}${websiteLine}`);
        }
      });

      // Group halo + points so the checkbox controls both
      const group = L.layerGroup([halo, points]);
      overlays[cat.name] = group;

      // Default visibility
      if (cat.onByDefault) {
        group.addTo(map);

        // Bounds based on default-on layers
        if (points.getLayers().length) {
          const b = points.getBounds();
          defaultBounds = defaultBounds ? defaultBounds.extend(b) : b;
        }
      }
    });

    // Add layer control ONCE with base maps + overlays
    L.control.layers(baseMaps, overlays, { collapsed: false }).addTo(map);

    // Zoom to default-on categories
    if (defaultBounds) {
      map.fitBounds(defaultBounds, { padding: [20, 20] });
    }
  })
  .catch(err => console.error("GeoJSON load error:", err));
