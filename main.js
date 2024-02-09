import axios from "axios";
import styles from "./styles.json";

let locations = [];
let isAdding = false;
let isClicked = false;

let polygon;
let infobox;

let map;
const server = "http://localhost/hanap-d-puntod/server";
let panel = document.getElementById('panel')

function showPanel(data) {
  panel.classList.remove('hide')
  panel.classList.add('show')
  let template = `
    <div class="card rounded-0 shadow-lg">
      <div class="card-header">
        <h1 class="card-title fs-4 fw-bolder m-0 text-black">${(data.name) ? data.name : 'Unnamed'}</h1>
        <small class="d-block border-bottom py-2 text-dark"><i class='bi-geo-alt-fill'></i> ${(data.address) ? data.address : 'No address avialable.'}</small>
      </div>
      <div class="card-body">
        <p>${(data.description) ? data.description : 'No description available.'}</p>
      </div>
    </div>
  `;
  panel.innerHTML = template
}

function hidePanel() {
  panel.classList.remove('show')
  panel.classList.add('hide')
}

function loadCementery(map) {
  map.entities.clear();
  axios
    .get(`${server}/index.php`)
    .then((response) => {
      response.data.records.forEach((c) => {
        let polygon = new Microsoft.Maps.Polygon(
          JSON.parse(c.trace),
          styles.default
        );
        Microsoft.Maps.Events.addHandler(polygon, "click", function (e) {
          showPanel(c)
          e.target.setOptions(styles.active);
          Microsoft.Maps.loadModule("Microsoft.Maps.SpatialMath", function () {
            map.setView({
              zoom: 17,
              center: Microsoft.Maps.SpatialMath.Geometry.centroid(e.target)
            })
          });
        });
        Microsoft.Maps.Events.addHandler(polygon, "dblclick", function (e) {
          getEditForm(c);
        });
        Microsoft.Maps.Events.addHandler(polygon, "mouseover", function (e) {
          e.target.setOptions(styles.hover);
          Microsoft.Maps.loadModule("Microsoft.Maps.SpatialMath", function () {
            (c.name && c.address) && infobox.setOptions({
              description: `
                <div style="min-width: 300px">
                  ${c.address && `<h1 class='fs-5 fw-bolder m-0 text-dark'>${c.name}</h1>`}
                  ${c.address && `
                    <span class='d-block text-truncate py-1 border-bottom'>
                      <i class='bi-geo-alt-fill'></i> ${c.address}
                    </span>`}
                  <span class='d-block'>${((c.description) ? c.description : 'No description available.')}</span>
                </div>`,
              location: Microsoft.Maps.SpatialMath.Geometry.centroid(e.target),
              visible: true
            });
          });
        });
        Microsoft.Maps.Events.addHandler(polygon, "mouseout", function (e) {
          e.target.setOptions(styles.default);
          infobox.setOptions({
            visible: false,
          });
        });
        map.entities.push(polygon);
      });
    })
    .catch((error) => {
      console.log(error);
    });
}

function getMap() {
  map = new Microsoft.Maps.Map("#map", {
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

  infobox = new Microsoft.Maps.Infobox(map.getCenter(), { visible: false });
  infobox.setOptions({
    maxHeight: 400,
    maxWidth: 400,
    showCloseButton: false,
  });
  infobox.setMap(map);

  loadCementery(map);

  document.addEventListener("keydown", (e) => {
    if (
      (e.key == "z" && e.ctrlKey && isAdding) ||
      (e.key == "Delete" && e.ctrlKey && isAdding)
    ) {
      if (locations.length > 1) {
        locations.pop();
        polygon.setRings(locations);
      } else {
        showTooltip("warning", "Unable to remove points minimum of one.");
      }
    }
    if (e.key == "Delete" && e.ctrlKey && !isAdding) {
      locations = [];
      isAdding = false;
      isClicked = false;
      map.entities.pop();
      polygon.setRings(locations);
      updateCommandButton();
      showMessage("success", "Map trace was deleted.");
    }
  });

  Microsoft.Maps.Events.addHandler(map, "click", function (e) {
    hidePanel()
    if (isAdding) {
      locations.push(e.location);
      if (!isClicked) {
        isClicked = true;
        polygon = new Microsoft.Maps.Polygon(locations, styles.new);
        map.entities.push(polygon);
        Microsoft.Maps.Events.addHandler(polygon, "dblclick", function (e) {
          e.target.setOptions(styles.hover);
          getSaveForm(polygon.getRings());
        });
        Microsoft.Maps.Events.addHandler(polygon, "mouseover", function (e) {
          e.target.setOptions(styles.unsave);
          Microsoft.Maps.loadModule("Microsoft.Maps.SpatialMath", function () {
            infobox.setOptions({
              title: "Unsaved trace.",
              description: "Double click to save this map trace.",
              location: Microsoft.Maps.SpatialMath.Geometry.centroid(e.target),
              visible: true,
            });
          });
        });
        Microsoft.Maps.Events.addHandler(polygon, "mouseout", function (e) {
          e.target.setOptions(styles.new);
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
    if (isAdding) {
      polygon.setRings(locations);
      if (locations.length > 2) {
        isAdding = false;
        getSaveForm(polygon.getRings());
      } else {
        showMessage("warning", "You must add 3 or more points.");
      }
    }
    updateCommandButton();
  });
}

function getSaveForm(data) {
  swal
    .fire({
      icon: "success",
      iconHtml: "<i class='bi-geo-alt-fill'></i>",
      html: `<form method="post" name="save" class="text-start">
              <label for="cementery_name">Cementery Name</label>
              <input id="cementery_name" name="cementery_name" class="form-control my-1"/>
              <label for="cementery_description">Description</label>
              <textarea id="cementery_description" name="cementery_description" class="form-control my-1" style="height: 100px; max-height: 100px"></textarea>
              <label for="cementery_address">Complete Address</label>
              <input id="cementery_address" name="cementery_address" class="form-control my-1"/>
            </form>`,
      width: 400,
      allowOutsideClick: false,
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: "<i class='bi-check-lg'></i> Save",
      cancelButtonText: "<i class='bi-x-lg'></i> Cancel",
      customClass: {
        cancelButton: "btn btn-danger bg-gradient",
        confirmButton: "btn btn-success bg-gradient",
      },
    })
    .then((response) => {
      if (response.isConfirmed) {
        axios
          .post(`${server}/cementery-add.php`, {
            name: save.cementery_name.value,
            address: save.cementery_address.value,
            description: save.cementery_description.value,
            trace: JSON.stringify(data),
          })
          .then(function (response) {
            locations = [];
            isAdding = false;
            isClicked = false;
            map.entities.pop();
            polygon.setRings(locations);
            updateCommandButton();
            showMessage("success", response.data.message);
            loadCementery(map);
          })
          .catch(function (error) {
            console.log(error);
            showMessage("error", "Failed to save record.");
          });
      } else {
        showMessage("warning", "Action was cancelled.");
      }
    });
}

function getEditForm(data) {
  swal
    .fire({
      icon: "success",
      iconHtml: "<i class='bi-geo-alt-fill'></i>",
      html: `<form method="post" name="edit" class="text-start">
              <input hidden value="${data.id}" name="cementery_id"/>
              <label for="cementery_name"><i class='bi-info-circle-fill'></i> Cementery Name</label>
              <input value="${data.name}" id="cementery_name" name="cementery_name" class="form-control my-2"/>
              <label for="cementery_description"><i class='bi-info-circle-fill'></i> Description</label>
              <textarea id="cementery_description" name="cementery_description" class="form-control my-2" style="height: 100px; max-height: 100px">${data.description}</textarea>
              <label for="cementery_address"><i class='bi-geo-alt-fill'></i> Complete Address</label>
              <input value="${data.address}" id="cementery_address" name="cementery_address" class="form-control my-2"/>
            </form>`,
      width: 400,
      allowOutsideClick: false,
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: "<i class='bi-pencil-square'></i> Save",
      cancelButtonText: "<i class='bi-x-lg'></i> Cancel",
      customClass: {
        cancelButton: "btn btn-danger bg-gradient",
        confirmButton: "btn btn-success bg-gradient",
      },
    })
    .then((response) => {
      if (response.isConfirmed) {
        axios
          .post(`${server}/cementery-edit.php`, {
            id: edit.cementery_id.value,
            name: edit.cementery_name.value,
            address: edit.cementery_address.value,
            description: edit.cementery_description.value,
          })
          .then(function (response) {
            showMessage("success", response.data.message);
            loadCementery(map);
          })
          .catch(function (error) {
            console.log(error);
            showMessage("error", "Failed to save record.");
          });
      } else {
        showMessage("warning", "Action was cancelled.");
      }
    });
}

function showMessage(icon, message) {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: false,
  });
  Toast.fire({
    icon: icon,
    title: message,
  });
}

function showTooltip(icon, message) {
  const Toast = Swal.mixin({
    toast: true,
    position: "bottom-start",
    showConfirmButton: false,
    timer: 5000,
    timerProgressBar: false,
  });
  Toast.fire({
    icon: icon,
    title: message,
  });
}

let commandButton = document.getElementById("add");
commandButton.addEventListener("click", (e) => {
  isAdding = true;
  commandButton.innerHTML = "<i class='bi-plus-'></i> Edit";
  commandButton.classList.add("d-none");
  showTooltip(
    "info",
    "Click on the map to add points and right click to save."
  );
});

function updateCommandButton() {
  if (isAdding) {
    commandButton.classList.add("d-none");
  } else {
    commandButton.classList.remove("d-none");
  }
  if (locations.length > 0) {
    commandButton.classList.add("btn-primary");
    commandButton.classList.remove("btn-success");
    commandButton.innerHTML = "<i class='bi-pencil-square'></i> Edit";
  } else {
    commandButton.classList.remove("btn-primary");
    commandButton.classList.add("btn-success");
    commandButton.innerHTML = "<i class='bi-plus-lg'></i> Add";
  }
}

window.onload = getMap;
