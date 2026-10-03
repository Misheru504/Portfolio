/**
 * Point d'entrée de la carte HydroCarte dans le portfolio.
 * Remplace le contenu de `initHydroCarte` par ton code HydroCarte
 * (même Vite, même MapLibre : tes modules devraient s'importer tels quels).
 */
import 'maplibre-gl/dist/maplibre-gl.css';
// MapLibre 6 fait ses calculs dans un Web Worker séparé : on demande à Vite
// de le compiler (avec ses dépendances) et de nous donner son URL.
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

export async function initHydroCarte(conteneur: HTMLElement): Promise<void> {
  const maplibregl = await import('maplibre-gl');
  maplibregl.setWorkerUrl(workerUrl);
  conteneur.replaceChildren(); // retire le texte « Chargement… »

  const map = new maplibregl.Map({
    container: conteneur,
    style: 'https://demotiles.maplibre.org/style.json', // fond de démo, à remplacer par ton style
    center: [2.4, 46.6], // France métropolitaine
    zoom: 4.6,
    attributionControl: { compact: true },
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }));

  map.on('load', () => {
    // TODO : ajouter ici tes sources et couches HydroCarte, par exemple :
    // map.addSource('stations', { type: 'geojson', data: urlOuGeoJSON });
    // map.addLayer({ id: 'stations', type: 'circle', source: 'stations', paint: { … } });
  });
}
