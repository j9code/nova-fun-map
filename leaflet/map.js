// Create the Leaflet map
var map = L.map('map').setView([38.95, -77.35], 10);

// Add the OpenStreetMap basemap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Load the local GeoJSON file
fetch('data/minigolf.geojson')
  .then(r => r.json())
  .then(data => {

    // 🔍 DIAGNOSTIC LINE — ADD THIS
    console.log("Loaded GeoJSON:", data);
    console.log("Feature count:", data.features?.length);

    const layer = L.geoJSON(data, {
      pointToLayer: (feature, latlng) =>
        L.circleMarker(latlng, {
          radius: 6,
          fillColor: "purple",
          color: "#000",
          weight: 1,
          fillOpacity: 0.7
        }),
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          layer.bindPopup(
            `<strong>${feature.properties.name || "Unnamed"}</strong>`
          );
        }
      }
    }).addTo(map);

    // 🔍 SECOND DIAGNOSTIC
    console.log("Layer bounds:", layer.getBounds());
    map.fitBounds(layer.getBounds());
  })
  .catch(err => console.error("GeoJSON load error:", err));

