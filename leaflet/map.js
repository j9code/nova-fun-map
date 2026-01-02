// PlayNoVA — map.js (ES5 safe)
// Working version

(function () {
  // Run after page + deferred scripts load
  window.addEventListener('load', function () {
    if (!window.L) {
      console.error("Leaflet (L) is not available. Check leaflet.js script loading.");
      return;
    }

    var isMobile = window.matchMedia && window.matchMedia("(max-width: 768px)").matches;

    var mapEl = document.getElementById('map');
    if (!mapEl) {
      console.error("Missing #map div.");
      return;
    }

    // 1) Map
    var map = L.map('map').setView([38.95, -77.35], 10);

    // 2) Basemaps
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

    cartoLight.addTo(map);

    // 3) Helpers
    function makeMarkerIcon(categoryClass, faHtml, color) {
      return L.divIcon({
        className: 'leaflet-div-icon poi-icon ' + categoryClass,
        html: '<span class="poi-fa" style="color:' + color + '">' + faHtml + '</span>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        popupAnchor: [0, -9]
      });
    }

    function sportHas(feature, val) {
      var p = (feature && feature.properties) ? feature.properties : {};
      var s = p.sport || "";
      var txt = String(s);

      // split by ; or , and trim
      var parts = txt.split(/[;,]+/);
      for (var i = 0; i < parts.length; i++) {
        if (String(parts[i]).trim() === val) return true;
      }
      return txt.indexOf(val) !== -1;
    }

    // 4) Categories
    var categories = [
      { name: "Mini Golf",          key: "mini-golf",   color: "#15693C", fa: '<i class="fa-solid fa-golf-ball-tee"></i>',       filter: function (f) { return f.properties && f.properties.leisure === "miniature_golf"; } },
      { name: "Amusement Centers",  key: "arcade",      color: "#694DBF", fa: '<i class="fa-brands fa-fort-awesome"></i>',       filter: function (f) { return f.properties && f.properties.leisure === "amusement_arcade"; } },
      { name: "Trampoline Parks",   key: "trampoline",  color: "#DB7202", fa: '<i class="fa-solid fa-person-falling"></i>',      filter: function (f) { return f.properties && f.properties.leisure === "trampoline_park"; } },
      { name: "Laser Tag",          key: "laser",       color: "#D6665C", fa: '<i class="fa-solid fa-bullseye"></i>',            filter: function (f) { return sportHas(f, "laser_tag"); } },
      { name: "Indoor Playgrounds", key: "indoor-play", color: "#187996", fa: '<i class="fa-solid fa-child-reaching"></i>',      filter: function (f) { return f.properties && f.properties.leisure === "indoor_play"; } },
      { name: "Climbing Parks",     key: "climbing",    color: "#A1953F", fa: '<i class="fa-solid fa-person-walking"></i>',      filter: function (f) { return sportHas(f, "climbing_adventure"); } },
      { name: "Go Karts",           key: "karting",     color: "#000000", fa: '<i class="fa-solid fa-flag-checkered"></i>',      filter: function (f) { return sportHas(f, "karting"); } },
      { name: "Escape Rooms",       key: "escape",      color: "#2791C2", fa: '<i class="fa-solid fa-puzzle-piece"></i>',        filter: function (f) { return f.properties && f.properties.leisure === "escape_game"; } },
      { name: "Bowling",            key: "bowling",     color: "#121211", fa: '<i class="fa-solid fa-bowling-ball"></i>',         filter: function (f) { return f.properties && f.properties.leisure === "bowling_alley"; } },
      { name: "Carousels",          key: "carousel",    color: "#B80D7F", fa: '<i class="fa-solid fa-horse-head"></i>',           filter: function (f) { return f.properties && f.properties.attraction === "carousel"; } },
      { name: "Miniature Trains",   key: "train",       color: "#C91B0E", fa: '<i class="fa-solid fa-train"></i>',                filter: function (f) { return f.properties && f.properties.attraction === "train"; } },
      { name: "Animal Scooters",    key: "scooter",     color: "#8A8432", fa: '<i class="fa-solid fa-dragon"></i>',               filter: function (f) { return f.properties && f.properties.attraction === "animal_scooter"; } },
      { name: "Water Parks",        key: "water-park",  color: "#0E59C9", fa: '<i class="fa-solid fa-water"></i>',                filter: function (f) { return f.properties && f.properties.leisure === "water_park"; } },
      { name: "Animal Parks",       key: "zoo",         color: "#D19636", fa: '<i class="fa-solid fa-paw"></i>',                  filter: function (f) { return f.properties && f.properties.tourism === "zoo"; } }
    ];

    for (var c = 0; c < categories.length; c++) {
      categories[c].markerIcon = makeMarkerIcon(categories[c].key, categories[c].fa, categories[c].color);
    }

    // 5) Legend (UNCHANGED structure/behavior)
    var legend = L.control({ position: isMobile ? "bottomleft" : "topleft" });

    legend.onAdd = function () {
      var div = L.DomUtil.create("div", "legend");

      var itemsHtml = "";
      for (var i = 0; i < categories.length; i++) {
        var cat = categories[i];
        itemsHtml +=
          '<div class="legend-item">' +
            '<span class="legend-swatch">' +
              '<span class="legend-dot" style="background:' + cat.color + '"></span>' +
              '<span class="legend-glyph" style="color:' + cat.color + '">' + cat.fa + '</span>' +
            '</span>' +
            '<span>' + cat.name + '</span>' +
          '</div>';
      }

      div.innerHTML =
        '<div class="legend-header">' +
          '<div class="legend-title">Legend</div>' +
          '<button class="legend-toggle" type="button">' + (isMobile ? "Show" : "Hide") + '</button>' +
        '</div>' +
        '<div class="legend-body ' + (isMobile ? "is-collapsed" : "") + '">' +
          itemsHtml +
        '</div>';

      L.DomEvent.disableClickPropagation(div);
      L.DomEvent.disableScrollPropagation(div);

      var btn = div.querySelector(".legend-toggle");
      var body = div.querySelector(".legend-body");

      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        body.classList.toggle("is-collapsed");
        btn.textContent = body.classList.contains("is-collapsed") ? "Show" : "Hide";
      });

      return div;
    };

    legend.addTo(map);

    // 6) Layers control — always visible now
    var overlays = {};
    var layersControl = L.control.layers(baseMaps, overlays, { collapsed: isMobile }).addTo(map);

    // 7) Load GeoJSON + add overlays
    var geojsonUrl = 'data/novafunmap_12.31.25.geojson';

    fetch(geojsonUrl)
      .then(function (r) {
        if (!r.ok) throw new Error("GeoJSON fetch failed: HTTP " + r.status + " for " + geojsonUrl);
        return r.json();
      })
      .then(function (data) {
        for (var k = 0; k < categories.length; k++) {
          (function (cat) {
            var layer = L.geoJSON(data, {
              filter: cat.filter,
              pointToLayer: function (feature, latlng) {
                return L.marker(latlng, { icon: cat.markerIcon });
              },
              onEachFeature: function (feature, layer) {
                var p = (feature && feature.properties) ? feature.properties : {};
                var name = p.name || "Unnamed";
                var city = p["addr:city"] || "";
                var state = p["addr:state"] || "";
                var website = p.website || "";

                var locationLine = "";
                if (city || state) {
                  locationLine = city + (city && state ? ", " : "") + state + "<br>";
                }

                var websiteLine = "";
                if (website) {
                  websiteLine = '<a href="' + website + '" target="_blank" rel="noopener noreferrer">Website</a>';
                }

                layer.bindPopup("<strong>" + name + "</strong><br>" + locationLine + websiteLine);
              }
            });

            overlays[cat.name] = layer;
            layersControl.addOverlay(layer, cat.name);
          })(categories[k]);
        }

        if (isMobile) {
          setTimeout(function () { map.invalidateSize(); }, 200);
        }
      })
      .catch(function (err) {
        console.error(err);
        try {
          console.error("Tried GeoJSON URL:", new URL(geojsonUrl, window.location.href).href);
        } catch (e) {}
      });
  });
})();
