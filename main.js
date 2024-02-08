import styles from "./styles.json";

let isAdding = false;

let data = JSON.parse(localStorage.getItem("data"));

function getMap() {
  const map = new Microsoft.Maps.Map("#map", {
    credentials:
      "Av5AefOeIqwi0bkOehI7bdTzeD5kLNaU7BDoAaCnPkW0aOgWZFR-UOvgkuKUJ-GW",
    center: new Microsoft.Maps.Location(7.782065, 122.586795),
    mapTypeId: Microsoft.Maps.MapTypeId.aerial,
    labelOverlay: Microsoft.Maps.LabelOverlay.hidden,
    zoom: 16,
    minZoom: 15,
    maxZoom: 20,
    disableStreetside: true,
    allowHidingLabelsOfRoad: true,
    enableHighDpi: true,
    willReadFrequently: true,
    showDashboard: false,
    showCopyright: false,
    showScalebar: false,
  });

  // var polygon1 = new Microsoft.Maps.Polygon(data, styles.default);

  // Microsoft.Maps.Events.addHandler(polygon1, "mouseover", function (e) {
  //   e.target.setOptions(styles.hover);
  // });

  // Microsoft.Maps.Events.addHandler(polygon1, "mouseout", function (e) {
  //   e.target.setOptions(styles.default);
  // });

  // map.entities.push(polygon1);

  let locations = [];
  let isClicked = false;
  var polygon;
  Microsoft.Maps.Events.addHandler(map, "click", function (e) {
    if (isAdding) {
      locations.push(e.location);
      if (!isClicked) {
        isClicked = true;
        polygon = new Microsoft.Maps.Polygon(locations, styles.new);
        map.entities.push(polygon);
        Microsoft.Maps.Events.addHandler(polygon, "dblclick", function (e) {
          console.log(e.target);
          e.target.setOptions(styles.hover);
        });
      }
    }
  });
  Microsoft.Maps.Events.addHandler(map, "mousemove", function (e) {
    if (isAdding) {
      if (locations.length > 0) {
        locations.push(e.location);
        polygon.setRings(locations);
        locations.pop();
      }
    }
  });
  Microsoft.Maps.Events.addHandler(map, "rightclick", function (e) {
    polygon.setRings(locations);
    isAdding = false;
  });
}

document.getElementById("add").addEventListener("click", (e) => {
  if (isAdding) {
    isAdding = false;
    e.target.innerHTML = "Add";
  } else {
    isAdding = true;
    e.target.innerHTML = "Edit";
  }
});

window.onload = getMap;
