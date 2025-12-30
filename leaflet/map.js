// Create the map
var map = L.map('map').setView([38.95, -77.35], 10);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Define the Font Awesome golfer icon
var golferIcon = L.divIcon({
  className: 'golfer-icon',
  html: '<i class="fa-solid fa-golf-ball-tee"></i>',
  iconSize: [8, 8],
  iconAnchor: [4, 3]
});

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
          radius: 11,
          fillColor: "green",
          color: "green",
          weight: 1,
          fillOpacity: 1.0
        }).addTo(haloLayer);

        // Inner white fill
        L.circleMarker(latlng, {
          radius: 9,
          fillColor: "#ffffff",
          color: "#ffffff",
          weight: 1,
          fillOpacity: 0.9
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
