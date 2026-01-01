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
function makeFaIcon(categoryClass, faHtml, color) {
  return L.divIcon({
    // include Leaflet default class + your classes to avoid weird CSS edge cases
    className: 'leaflet-div-icon poi-icon ' + categoryClass,
    // colored wrapper ensures visibility even if some CSS overrides i tag color
    html: `<span class="poi-fa" style="color:${color}">${faHtml}</span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -9]
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
// 4) Categories (no onByDefault => none selected initially)
// -------------------------------
var categories = [
  { name: "Mini Golf",          key: "mini-golf",   color: "#15693C", fa: '<i class="fa-solid fa-golf-ball-tee"></i>',       filter: f => f.properties?.leisure === "miniature_golf" },
  { name: "Amusement Centers",  key: "arcade",
