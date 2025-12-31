// ================================
// Create the map
// ================================
var map = L.map('map').setView([38.95, -77.35], 10);

// ================================
// Base maps (free, no API keys)
// ================================

// Carto Light (default)
var cartoLight = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20
  }
);

// Carto Voyager
var cartoVoyager = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20
  }
);

// Carto Dark Matter
var cartoDark = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20
  }
);

// OpenTopoMap
var openTopo = L.tileLayer(
  'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  {
    attribution:
      '&copy; OpenStreetMap contributors &copy; OpenTopoMap (CC-BY-SA)',
    maxZoom: 17
  }
);

// Esri World Imagery
var esriImagery = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  {
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19
  }
);

// Basemap control
var baseMaps = {
  "Light": cartoLight,
  "Voyager": cartoVoyager,
  "Dark": cartoDark,
  "Imagery": esriImagery,
  "Topo": openTopo
};

// Add default basemap
cartoLight.addTo(map);

// Layer switcher
L.control.layers(baseMaps, null, { collapsed: false }).addTo(map);

// ================================
// Font Awesome golfer icon
// ================================
var golferIcon = L.divIcon({
  className: 'golfer-icon',
  html: '<i class="fa-solid fa-golf-ball-tee"></i>',
  iconSize: [8, 8],
  iconAnchor: [4, 7]   // visually centered for tiny FA glyph
});

// ================================
// Legend
// ================================
var legend = L.control({ position: "bottomright" });

legend.onAdd = function () {
  var div = L.DomUtil.create("div", "legend");
  div.innerHTML = `
    <div class="legend-title">Legend</div>
    <div class="legend-item">
      <span class="legend-swatch">
        <span class="legend-halo"></span>
        <i class="fa-solid fa-golf-ball-tee legend-icon"></i>
      </span>
      <span>Mini golf</span>
    </div>
  `;
  return div;
};

legend.addTo(map);

// ================================
// Halo layer (behind markers)
// ================================
var haloLayer = L.layerGroup().addTo(map);

// ================================
// Load GeoJSON
// ================================
fetch('data/minigolf.geojson')
  .then(r => {
    if (!r.ok) throw new Error(`GeoJSON HTTP ${r.status}`);
    return r.json();
  })
  .then(data => {

    const markers = L.geoJSON(data, {
      pointToLayer: (feature, latlng) => {

        // White halo with green ring
        L.circleMarker(latlng, {
          radius: 11,
          fillColor: "#ffffff",
          fillOpacity: 1.0,
          color: "#3d7d6d",
          weight: 2
        }).addTo(haloLayer);

        // Icon on top
        return L.marker(latlng, { icon: golferIcon });
      },

      onEachFeature: (feature, layer) => {
        const p = feature.properties || {};
        const name = p.name || "Unnamed";
        const city = p["addr:city"] || "";
        const state = p["addr:state"] || "";
        const website = p.website || "";

        const locationLine =
          (city || state)
            ? `${city}${city && state ? ", " : ""}${state}<br>`
            : "";

        const websiteLine =
          website
            ? `<a href="${website}" target="_blank" rel="noopener">Website</a>`
            : "";

        layer.bindPopup(
          `<strong>${name}</strong><br>` +
          locationLine +
          websiteLine
        );
      }
    }).addTo(map);

    // Zoom to features
    if (markers.getLayers().length) {
      map.fitBounds(markers.getBounds(), { padding: [20, 20] });
    }
  })
  .catch(err => console.error("GeoJSON load error:", err));
