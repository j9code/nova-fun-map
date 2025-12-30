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
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

// Load the GeoJSON file
fetch('data/minigolf.geojson')
  .then(r => r.json())
  .then(data => {

    console.log("Loaded GeoJSON:", data);
    console.log("Feature count:", data.features?.length);

    const layer = L.geoJSON(data, {
      pointToLayer: (feature, latlng) => {
        // Marker with golfer icon
        const marker = L.marker(latlng, { icon: golferIcon });

        // Optional halo behind the marker
        const halo = L.circleMarker(latlng, {
          radius: 10,
          fillColor: "green",
          color: "green",
          weight: 1,
          fillOpacity: 0.3
        });

        // LayerGroup combines halo + marker
        return L.layerGroup([halo, marker]);
      },
      onEachFeature: (feature, layer) => {
        if (feature.properties) {
          layer.bindPopup(
            `<strong>${feature.properties.name || "Unnamed"}</strong><br>` +
            `${feature.properties.addr_city || ""}, ${feature.properties.addr_state || ""} <br>` +
            `<a href="${feature.properties.website || "#"}" target="_blank">Website</a>`
          );
        }
      }
    }).addTo(map);

    // Zoom map to fit all features
    map.fitBounds(layer.getBounds());
  })
  .catch(err => console.error("GeoJSON load error:", err));
