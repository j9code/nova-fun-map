// ================================
// Create the map
// ================================
var map = L.map('map').setView([38.95, -77.35], 10);

// ================================
// Base maps (free, no API keys)
// ================================
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

// ================================
// Icons (Font Awesome)
// ================================
function makeFaIcon(extraClass, faHtml) {
  return L.divIcon({
    className: extraClass,   // styled in CSS (size/color)
    html: faHtml,
    iconSize: [8, 8],
    iconAnchor: [4, 7]
  });
}

// Black icons (CSS controls color)
var iconMiniGolf   = makeFaIcon('poi-icon mini-golf',   '<i class="fa-solid fa-golf-ball-tee"></i>');
var iconArcade     = makeFaIcon('poi-icon arcade',      '<i class="fa-solid fa-gamepad"></i>');
var iconTrampoline = makeFaIcon('poi-icon trampoline',  '<i class="fa-solid fa-person-jumping"></i>');
var iconEscape     = makeFaIcon('poi-icon escape',      '<i class="fa-solid fa-key"></i>');
var iconBowling    = makeFaIcon('poi-icon bowling',     '<i class="fa-solid fa-bowling-ball"></i>');
var iconIndoorPlay = makeFaIcon('poi-icon indoor-play', '<i class="fa-solid fa-child"></i>');
var iconWaterPark  = makeFaIcon('poi-icon water-park',  '<i class="fa-solid fa-water"></i>');
var iconZoo        = makeFaIcon('poi-icon zoo',         '<i class="fa-solid fa-paw"></i>');
var iconCarousel   = makeFaIcon('poi-icon carousel',    '<i class="fa-solid fa-rotate"></i>');
var iconTrain      = makeFaIcon('poi-icon train',       '<i class="fa-solid fa-train"></i>');
var iconScooter    = makeFaIcon('poi-icon scooter',     '<i class="fa-solid fa-person-snowboarding"></i>');
var iconClimbing   = makeFaIcon('poi-icon climbing',    '<i class="fa-solid fa-mountain"></i>');
var iconLaserTag   = makeFaIcon('poi-icon laser',       '<i class="fa-solid fa-bullseye"></i>');
var iconKarting    = makeFaIcon('poi-icon karting',     '<i class="fa-solid fa-flag-checkered"></i>');

// ================================
// Legend (simple starter; you can expand later)
// ================================
var legend = L.control({ position: "bottomright" });
legend.onAdd = function () {
  var div = L.DomUtil.create("div", "legend");
  div.innerHTML = `
    <div class="legend-title">Legend</div>
    <div class="legend-item"><span class="legend-swatch"><span class="legend-halo"></span><i class="fa-solid fa-golf-ball-tee legend-icon"></i></span><span>Mini golf (example)</span></div>
    <div style="margin-top:6px; font-size:12px; color:#555;">Use the layer control to toggle categories.</div>
  `;
  return div;
};
legend.addTo(map);

// ================================
// Category definitions
// ================================
function sportHas(feature, val) {
  const s = (feature.properties && feature.properties.sport) || "";
  // sport can be "karting" OR "climbing_adventure;something"
  return String(s).split(/[;,\s]+/).includes(val) || String(s).includes(val);
}

var categories = [
  { name: "Mini golf",        filter: f => f.properties?.leisure === "miniature_golf", icon: iconMiniGolf,   ring: "#3d7d6d", onByDefault: true },
  { name: "Arcades",          filter: f => f.properties?.leisure === "amusement_arcade", icon: iconArcade, ring: "#3d7d6d" },
  { name: "Trampoline parks", filter: f => f.properties?.leisure === "trampoline_park", icon: iconTrampoline, ring: "#3d7d6d" },
  { name: "Escape games",     filter: f => f.properties?.leisure === "escape_game", icon: iconEscape,     ring: "#3d7d6d" },
  { name: "Bowling",          filter: f => f.properties?.leisure === "bowling_alley", icon: iconBowling,  ring: "#3d7d6d" },
  { name: "Indoor play",      filter: f => f.properties?.leisure === "indoor_play", icon: iconIndoorPlay, ring: "#3d7d6d" },
  { name: "Water parks",      filter: f => f.properties?.leisure === "water_park", icon: iconWaterPark,  ring: "#3d7d6d" },
  { name: "Zoos",             filter: f => f.properties?.tourism === "zoo", icon: iconZoo,              ring: "#3d7d6d" },
  { name: "Carousels",        filter: f => f.properties?.attraction === "carousel", icon: iconCarousel,  ring: "#3d7d6d" },
  { name: "Trains",           filter: f => f.properties?.attraction === "train", icon: iconTrain,        ring: "#3d7d6d" },
  { name: "Animal scooters",  filter: f => f.properties?.attraction === "animal_scooter", icon: iconScooter, ring: "#3d7d6d" },
  { name: "Climbing adventure", filter: f => sportHas(f, "climbing_adventure"), icon: iconClimbing, ring: "#3d7d6d" },
  { name: "Laser tag",        filter: f => sportHas(f, "laser_tag"), icon: iconLaserTag, ring: "#3d7d6d" },
  { name: "Karting",          filter: f => sportHas(f, "karting"), icon: iconKarting, ring: "#3d7d6d" }
];

// ================================
// Load GeoJSON once, build overlays
// ================================
var overlays = {};
var overlayGroups = {}; // category name -> L.layerGroup([halo, points])
var layersControl = null;

fetch('data/novafunmap_12.30.25.geojson?v=123025')
  .then(r => {
    if (!r.ok) throw new Error(`GeoJSON HTTP ${r.status}`);
    return r.json();
  })
  .then(data => {
    let overallBounds = null;

    categories.forEach(cat => {
      // Separate halo layer per category so toggling works cleanly
      const halo = L.layerGroup();
      const points = L.geoJSON(data, {
        filter: cat.filter,
        pointToLayer: (feature, latlng) => {
          L.circleMarker(latlng, {
            radius: 11,
            fillColor: "#ffffff",
            fillOpacity: 1.0,
            color: cat.ring,
            weight: 2
          }).addTo(halo);

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

      const group = L.layerGroup([halo, points]);
      overlayGroups[cat.name] = group;
      overlays[cat.name] = group;

      // Turn on default categories
      if (cat.onByDefault) group.addTo(map);

      // Expand bounds based on default-on layers
      if (cat.onByDefault && points.getLayers().length) {
        const b = points.getBounds();
        overallBounds = overallBounds ? overallBounds.extend(b) : b;
      }
    });

    // Add overlays to the existing control (remove old one first if present)
    if (layersControl) layersControl.remove();
    layersControl = L.control.layers(baseMaps, overlays, { collapsed: false }).addTo(map);

    // Zoom to default-visible layers
    if (overallBounds) {
      map.fitBounds(overallBounds, { padding: [20, 20] });
    }
  })
  .catch(err => console.error("GeoJSON load error:", err));
