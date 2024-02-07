import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { Draw, Modify, Snap } from 'ol/interaction.js';
import { OSM, Vector as VectorSource } from 'ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import { get, transform } from 'ol/proj.js';

const marks = JSON.parse(localStorage.getItem('marks'));

const raster = new TileLayer({
	source: new OSM(),
});

const source = new VectorSource();
const vector = new VectorLayer({
	source: source,
	style: {
		'fill-color': 'rgba(255, 255, 255, 0.2)',
		'stroke-color': '#ffcc33',
		'stroke-width': 2,
		'circle-radius': 7,
		'circle-fill-color': '#ffcc33',
	},
});

const map = new Map({
	layers: [raster, vector],
	target: 'map',
	view: new View({
		center: transform([122.586795, 7.782065], 'EPSG:4326', 'EPSG:3857'),
		zoom: 11,
		minZoom: 11,
		maxZoom: 20,
	}),
});

const modify = new Modify({ source: source });
map.addInteraction(modify);

let draw, snap; // global so we can remove them later

function addInteractions() {
	draw = new Draw({
		source: source,
		type: 'Polygon',
	});
	map.addInteraction(draw);
	snap = new Snap({ source: source });
	map.addInteraction(snap);
}

addInteractions();

draw.on('drawend', function (evt) {
	let coordinates = evt.feature.getGeometry().getCoordinates()[0];
	marks.push(coordinates);
	localStorage.setItem('marks', JSON.stringify(marks));
});

DrawMarks(marks);

console.log(marks);

function DrawMarks(marks) {
	marks.forEach(mark => {
		var feature = new ol.Feature({
			geometry: new ol.geom.Polygon([mark]),
		});
		feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
		var vectorSource = new ol.source.Vector({
			features: [feature],
		});
		var vectorLayer = new ol.layer.Vector({
			source: vectorSource,
		});
		map.addLayer(vectorLayer);
	});
}
