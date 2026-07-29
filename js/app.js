// Tenerife Go v2 - App principal segura y modular
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

// Utilidad: sanitizar todo lo que viene de lugares/usuario
const sanitize = (str) => DOMPurify.sanitize(str, { ALLOWED_TAGS: ['b','i','br','span'], ALLOWED_ATTR: [] });

class TenerifeGo {
  constructor() {
    this.map = null;
    this.markers = L.markerClusterGroup({ maxClusterRadius: 60, disableClusteringAtZoom: 16 });
    this.places = [];
    this.supabase = null;
  }

  async init() {
    try {
      await this.initMap();
      await this.loadPlaces();
      await this.initSupabase();
      this.renderMarkers();
      document.getElementById('status').textContent = `${this.places.length} lugares cargados`;
    } catch (err) {
      console.error('[TenerifeGo] init error', err);
      // No suprimir errores como antes - mostrar al usuario
      document.getElementById('status').textContent = 'Error cargando. Reintenta.';
    }
  }

  initMap() {
    this.map = L.map('map', { zoomControl: false }).setView([28.2916, -16.6291], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19
    }).addTo(this.map);
    this.map.addLayer(this.markers);
  }

  async loadPlaces() {
    // Lazy load - no 1.4MB inline
    const res = await fetch('./data/places.json', { cache: 'force-cache' });
    if (!res.ok) throw new Error('places.json failed');
    this.places = await res.json();
  }

  initSupabase() {
    // Solo si tienes @supabase/supabase-js como modulo, si no usa fetch directo
    // Aquí no guardamos isAdmin en localStorage
    // La auth real se hace via supabase.auth.signInWithPassword
    return Promise.resolve();
  }

  renderMarkers() {
    this.markers.clearLayers();
    const frag = document.createDocumentFragment();
    for (const place of this.places.slice(0, 300)) { // virtualizacion inicial
      if (!place.lat || !place.lng) continue;
      const marker = L.marker([place.lat, place.lng], { title: sanitize(place.name?.es || '') });
      // NUNCA innerHTML sin sanitizar
      const popupEl = document.createElement('div');
      const title = document.createElement('h3');
      title.textContent = place.name?.es || 'Lugar'; // textContent = seguro contra XSS
      const desc = document.createElement('p');
      desc.textContent = place.description?.es?.slice(0,120) || '';
      popupEl.appendChild(title);
      popupEl.appendChild(desc);
      marker.bindPopup(popupEl);
      this.markers.addLayer(marker);
    }
  }

  // Ejemplo de favoritos SEGURO con RLS own_*
  async toggleFavorite(placeId, userId) {
    if (!placeId) return;
    // Usa auth.uid() en la policy, no localStorage
    // const { error } = await supabase.from('favorites').insert({ place_id: placeId, user_id: userId });
    // Si error por RLS, es que no es su favorito -> correcto
  }
}

const app = new TenerifeGo();
document.addEventListener('DOMContentLoaded', () => app.init());
