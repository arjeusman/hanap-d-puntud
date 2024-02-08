import axios from "axios";
import styles from "./styles.json";

let isAdding = false;

let data = JSON.parse(localStorage.getItem("data"));

let locations = [];
let isClicked = false;
let polygon;

let map;

function loadCementery(data, map) {
  map.entities.clear();
  data.forEach((c) => {
    let polygon = new Microsoft.Maps.Polygon(
      JSON.parse(c.trace),
      styles.default
    );
    Microsoft.Maps.Events.addHandler(polygon, "mouseover", function (e) {
      e.target.setOptions(styles.hover);
    });
    Microsoft.Maps.Events.addHandler(polygon, "mouseout", function (e) {
      e.target.setOptions(styles.default);
    });
    map.entities.push(polygon);
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
          e.target.setOptions(styles.hover);
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
      html: `
      <form method="post" name="save" class="text-start">
        <label for="cementery_name" class="form-label">Cementery Name</label>
        <input id="cementery_name" name="cementery_name" class="form-control my-1"/>
        <label for="cementery_description" class="form-label">Description</label>
        <textarea id="cementery_description" name="cementery_description" class="form-control my-1" style="height: 100px; max-height: 100px"></textarea>
        <label for="cementery_address" class="form-label">Complete Address</label>
        <input id="cementery_address" name="cementery_address" class="form-control my-1"/>
      </form>
    `,
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
          .post("http://localhost/hanap-d-puntud/server/index.php", {
            name: save.cementery_name.value,
            address: save.cementery_address.value,
            description: save.cementery_description.value,
            trace: JSON.stringify(data),
          })
          .then(function (response) {
            // let result = JSON.parse(response.data);
            console.log(response.data);
            locations = [];
            isAdding = false;
            isClicked = false;
            map.entities.pop();
            polygon.setRings(locations);
            updateCommandButton();
            showMessage("success", response.data.message);
            loadCementery(response.data.data, map);
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
