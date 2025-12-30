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
    L.geoJSON(data, {
      pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
        radius: 6,
        fillColor: "purple",
        color: "#000",
        weight: 1,
        fillOpacity: 0.7
      }),
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          layer.bindPopup(JSON.stringify(feature.properties, null, 2));
        }
      }
    }).addTo(map);
  });
;
