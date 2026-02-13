// PlayNoVA — map.js (ES5 safe)

(function () {
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
/*
    var cartoDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '
