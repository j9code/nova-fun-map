// --------------------------------------
// 1. Initialize the Leaflet map
// --------------------------------------
var map = L.map('map').setView([38.95, -77.35], 10);

var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// This will hold the live layer to replace on refresh
var liveLayer = null;


// --------------------------------------
// 2. Mini Golf Overpass query (Northern VA)
// --------------------------------------
var overpassQuery = `
[out:json][timeout:180];
(
  area["boundary"="administrative"]["admin_level"="6"]["name"="Fairfax County"];
  area["boundary"="administrative"]["admin_level"="6"]["name"="Loudoun County"];
  area["boundary"="administrative"]["admin_level"="6"]["name"="Prince William County"];
  area["boundary"="administrative"]["admin_level"="6"]["name"="Arlington County"];
  area["boundary"="administrative"]["admin_level"="6"]["name"="Fauquier County"];

  area["boundary"="administrative"]["admin_level"="8"]["name"="Manassas"];
  area["boundary"="administrative"]["admin_level"="8"]["name"="Manassas Park"];
  area["boundary"="administrative"]["admin_level"="8"]["name"="Falls Church"];
  area["boundary"="administrative"]["admin_level"="8"]["name"="Fairfax"];
  area["boundary"="administrative"]["admin_level"="8"]["name"="Alexandria"];
)->.nova;

nwr["leisure"="miniature_golf"](area.nova);
out center;
`;


// --------------------------------------
// 3. Function to load live data
// --------------------------------------
function loadLiveData() {
  console.log("Refreshing Overpass data…");

  var url = "https://overpass.kumi.systems/api/interpreter?data=" + encodeURIComponent(overpassQuery);

  fetch(url)
    .then(r => r.json())
    .then(osmData => {
      var geojson = osmtogeojson(osmData);

      // Remove old layer if it exists
      if (liveLayer) {
        map.removeLayer(liveLayer);
      }

      // Add new layer
      liveLayer = L.geoJSON(geojson, {
        style: { color: "purple", weight: 2 },
        pointToLayer: (feature, latlng) => L.circleMarker(latlng, {
          radius: 6,
          fillColor: "purple",
          color: "#000",
          weight: 1,
          fillOpacity: 0.7
        }),
        onEachFeature: (feature, layer) => {
          if (feature.properties && feature.properties.tags) {
            layer.bindPopup(JSON.stringify(feature.properties.tags, null, 2));
          }
        }
      }).addTo(map);
    })
    .catch(err => console.error("Overpass error:", err));
}


// --------------------------------------
// 4. Initial load + auto-refresh
// --------------------------------------
loadLiveData();

// Refresh every 5 minutes (300,000 ms)
setInterval(loadLiveData, 300000);

