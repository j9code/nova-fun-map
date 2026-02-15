// @name Leafletfunmap_query

[out:json][timeout:180];

// --- NoVA counties and independent cities (Virginia) ---
(
  rel(962190);   // Arlington County
  rel(945043);   // Fairfax County
  rel(1149984);  // Prince William County
  rel(944948);   // Loudoun County
  rel(1633326);  // Fauquier County
  rel(206642);   // Falls Church, VA
  rel(206637);   // Alexandria, VA
  rel(206874);   // Fairfax City, VA
  rel(206870);   // Manassas, VA
  rel(206609);   // Manassas Park, VA  
);

// Convert relations to one region
map_to_area ->.region;

// Fun stuff
(
  // leisure-based categories
  nwr["leisure"~"^(miniature_golf|amusement_arcade|trampoline_park|escape_game|bowling_alley|indoor_play|water_park|gaming_lounge)$"](area.region);

  // attraction-based categories
  nwr["attraction"~"^(train|carousel|animal_scooter|slide)$"](area.region);

  // tourism-based categories
  nwr["tourism"="zoo"](area.region);

  // sport-based categories 
  nwr["sport"~"^(climbing_adventure|laser_tag|karting|indoor_skydiving|10pin|roller_skating|ice_skating)"](area.region);
);

// For good GeoJSON output (points for polygons too)
out center tags;

