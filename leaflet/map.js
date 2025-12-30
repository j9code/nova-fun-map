// Load the local GeoJSON file. Overpass and uMap are very unstable Dec 30, 2025.
fetch('../data/minigolf.geojson')
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
