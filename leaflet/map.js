// Create the map
var map = L.map('map').setView([38.95, -77.35], 10);
var baseMaps = {
  "Light": L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd'
  }),
  "Dark": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd'
  }),
  "Voyager": L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd'
  }),
  "Imagery": L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri'
    }
  )
};

baseMaps["Light"].addTo(map);
L.control.layers(baseMaps, null, { collapsed: false }).addTo(map);


// Define the Font Awesome golfer icon
var golferIcon = L.divIcon({
  className: 'golfer-icon',
  html: '<i class="fa-solid fa-golf-ball-tee"></i>',
  iconSize: [8, 8],
  iconAnchor: [5, 8]
});

// Legend (bottom-right)
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


// Dedicated layer for halos (keeps them behind markers and centered)
var haloLayer = L.layerGroup().addTo(map);

// Load the GeoJSON file
fetch('data/minigolf.geojson')
  .then(r => {
    if (!r.ok) throw new Error(`GeoJSON HTTP ${r.status} ${r.statusText}`);
    return r.json();
  })
  .then(data => {
    console.log("Feature count:", data.features?.length);

    const markers = L.geoJSON(data, {
      pointToLayer: (feature, latlng) => {
        // Halo behind marker (centered exactly on the point)
        L.circleMarker(latlng, {
          radius: 10,
          fillColor: "#ffffff",
          color: "#3d7d6d",
          weight: 1,
          fillOpacity: 1.0
        }).addTo(haloLayer);

        // Icon marker on top
        return L.marker(latlng, { icon: golferIcon });
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

        layer.bindPopup(
          `<strong>${name}</strong><br>` +
          locationLine +
          websiteLine
        );
      }
    }).addTo(map);

    // Zoom to data (only if there are features)
    if (markers.getLayers().length) {
      map.fitBounds(markers.getBounds(), { padding: [20, 20] });
    }
  })
  .catch(err => console.error("GeoJSON load error:", err));
