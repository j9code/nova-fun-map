## Project: NoVa Fun Map
Mapping amusements, attractions, and family-friendly fun across Northern Virginia using OpenStreetMap data, Overpass API, and Leaflet. Many thanks to M. Wildon for sharing the <a href="https://github.com/watmildon/microcosm">microcosm<a/> template for fetching the data. 

### Current Contribution Status: 
When I started this project, the defined Northern Virginia footprint contained 102 mapped “fun” points of interest (45 nodes and 57 ways). Since then, I’ve grown the dataset to 139 features (85 nodes and 54 ways), a net increase of 37 features—about 36% growth. I added many of the new POIs and reviewed, corrected, and standardized tagging on existing features where needed. I’ve edited 111 of the 139 current features (about 80%).

<a href="https://j9code.github.io/nova-fun-map">NoVa Fun Map</a>

![PlayNoVA map screenshot](images/PlayNoVA.png)




*Work in Progress*
### Overview
This project demonstrates how to create and share an interactive map using OpenStreetMap data, with documented data sourcing, tagging decisions, and cartographic choices.  
It brings together:
- OpenStreetMap tagging
- Overpass API queries
- Layer configuration

### Data Sources
- **OpenStreetMap (OSM)** — community-maintained geographic data  
- **Overpass API** — used to extract amusement features by tag  

### Categories Mapped
The project currently focuses on:
- **Independents** (locally owned amusements)
- **Chains** (regional or national brands)
- **Specialty amusements** (e.g., animal scooters, miniature railways, carousels)

Each category has its own Overpass query and Leaflet layer.

### Relation IDs for Locations
The project uses **OpenStreetMap relation IDs** to define the Northern Virginia region, rather than a custom bounding box. This ensures the map aligns with officially recognized county and city boundaries and avoids accidental inclusion of nodes, ways, or relations in other States including Maryland, West Virginia, and the District of Columbia.

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

These boundaries are referenced directly in the Overpass queries using their relation IDs.
See `docs/admin-areas.md` for details.

### How to Use This Repository
- In progress.

### Files
- `/data/` – OSM Overpass query results
- `/methods` – step-by-step documentation

## License
OSM‑derived data in this repository is © OpenStreetMap contributors and is available under the ODbL license.
All original content in this repository is released under the MIT License.
