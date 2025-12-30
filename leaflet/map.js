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

// Dedicated layer for halos (keeps them behind markers and perfectly centered)
var haloLayer = L.layerGroup().addTo(map);

// Load the GeoJSON file
fetch('data/minigolf.geojson')
  .then(r => r.json())
  .then(data => {

    console.log("Loaded GeoJSON:", data);
    console.log("Feature count:", data.features?.length);

    const markers = L.geoJSON(data, {
      pointToLayer: (feature, latlng) => {
        // Add halo BEHIND marker (centered exactly on the point)
        L.circleMarker(latlng, {
          radius: 10,
          fillColor: "green",
          color: "green",
          weight: 1,
          fillOpacity: 0.3
        }).addTo(haloLayer);

        // Return ONLY the icon marker (no layerGroup = no offset issues)
        return L.marker(latlng, { icon: golferIcon });
      },

      onEachFeature: (feature, layer) => {
        const p = feature.properties || {};
        const name = p.name || "Unnamed";
        const city = p["addr:city"] || "";
        const state = p["addr:state"] || "";
        const website = p
