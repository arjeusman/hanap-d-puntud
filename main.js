let isAdding = true;

let locations = [];

let map;

function GetMap() {
	map = new Microsoft.Maps.Map('#map', {
		credentials: 'Av5AefOeIqwi0bkOehI7bdTzeD5kLNaU7BDoAaCnPkW0aOgWZFR-UOvgkuKUJ-GW',
		center: new Microsoft.Maps.Location(7.782065, 122.586795),
		mapTypeId: Microsoft.Maps.MapTypeId.aerial,
		labelOverlay: Microsoft.Maps.LabelOverlay.hidden,
		zoom: 15,
		minZoom: 15,
		maxZoom: 20,
		disableStreetside: true,
		allowHidingLabelsOfRoad: true,
		// enableHighDpi: true,
		willReadFrequently: true,
		showDashboard: false,
		showCopyright: false,
		showScalebar: false,
	});

	if (isAdding) {
		var polygon = new Microsoft.Maps.Polygon(locations, {
			fillColor: 'rgba(255, 255, 0, 0.1)',
			strokeColor: '#40A2E3',
			strokeThickness: 3,
		});
		Microsoft.Maps.Events.addHandler(map, 'click', function (e) {
			locations.push(e.location);
			polygon.setRings(locations);
			map.entities.push(polygon);
		});
		Microsoft.Maps.Events.addHandler(map, 'rightclick', function (e) {
			console.log(e);
		});
	}
}

console.log(map);
