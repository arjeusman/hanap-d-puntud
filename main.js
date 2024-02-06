import './style.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { transform } from 'ol/proj.js';



const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    // center: [7.782065, 122.586795],
    center: transform([122.586795, 7.782065], 'EPSG:4326', 'EPSG:3857'),
    zoom: 12,
    maxZoom: 20,
    minZoom: 12
  })
});
