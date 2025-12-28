# nova-fun-map
Mapping amusements, attractions, and family-friendly fun across Northern Virginia using OpenStreetMap data, Overpass API, and uMap.

## Overview
**nova-fun-map** is a public, reproducible mapping project that identifies and visualizes amusement-related features in Northern Virginia.  
It brings together:
- OpenStreetMap tagging
- Overpass API queries
- uMap layer configuration

The goal is to create a clear, audience-friendly map that highlights where people can find arcades, mini-golf, carousels, animal scooters, and other amusements across NoVA.

## Data Sources
- **OpenStreetMap (OSM)** — community-maintained geographic data  
- **Overpass API** — used to extract amusement features by tag  
- **uMap** — for interactive web mapping  

## Categories Mapped
The project currently focuses on:
- **Independents** (locally owned amusements)
- **Chains** (regional or national brands)
- **Specialty amusements** (e.g., animal scooters, miniature railways, carousels)

Each category has its own Overpass query and uMap layer.

## Administrative Boundaries
The project uses **OpenStreetMap administrative areas** to define the Northern Virginia region, rather than a custom bounding box. This ensures the map aligns with officially recognized county and city boundaries and avoids accidental inclusion of DC or Maryland nodes, ways, or relations.

The following OSM admin areas are used:

- **Loudoun County**
- **Fairfax County**
- **Prince William County**
- **Arlington County**
- **City of Alexandria**
- **City of Fairfax**
- **City of Falls Church**
- **City of Manassas**
- **City of Manassas Park**

These boundaries are referenced directly in the Overpass queries using their OSM relation IDs.  
See `docs/admin-areas.md` for details.


## How to Use This Repository
- In progress.


## License
OSM‑derived data in this repository is © OpenStreetMap contributors and is available under the ODbL license.
All original content in this repository is released under the MIT License.
