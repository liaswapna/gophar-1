/*
  GLOBAL VARIABLES
 */
var origin,
  destination,
  originObject = {
    name: "",
    lat: 0,
    lat: 0
  },
  destinationObject = {
    name: "",
    lat: 0,
    lat: 0
  },
  midLocationObject = {
    lat: 0,
    lng: 0,
  },
  markers = [];
const resultsDisplay = document.querySelector(".results");

// intialize the map
function initMap(lat, lng, zoom) {
  map = new google.maps.Map(document.querySelector('.map'), {
    center: { lat: lat, lng: lng },
    zoom: zoom,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
      mapTypeIds: ['roadmap', 'terrain']
    }
  });
  new google.maps.places.Autocomplete(document.querySelector("#origin"));
  new google.maps.places.Autocomplete(document.querySelector("#destination"));
};
initMap(47.6062, -122.3321, 10);

// function to get DestinationObject
function getDestinationObject() {
  let geocoder = new google.maps.Geocoder();
  geocoder.geocode({ 'address': destination }, function (results, status) {
    if (status == 'OK') {
      destinationObject.name = destination;
      destinationObject.lat = parseFloat(results[0].geometry.location.lat());
      destinationObject.lng = parseFloat(results[0].geometry.location.lng());

      // Calculate the  distance between origin and destination.
      var originLocation = new google.maps.LatLng(originObject.lat, originObject.lng);
      var destinationLocation = new google.maps.LatLng(destinationObject.lat, destinationObject.lng);
      var distance = google.maps.geometry.spherical.computeDistanceBetween(originLocation, destinationLocation);
      distance = distance * 0.000621371;
      $("#distance-display").text(`Distance from ${origin} to ${destination}: ${Math.floor(distance)} miles`);
      initMap(midLocationObject.lat, midLocationObject.lng, 5);
      // calculate the route.
      calcRoute();
    }
  });
}

// function to calculate the route.
function calcRoute() {

  var directionsService = new google.maps.DirectionsService();
  var directionsDisplay = new google.maps.DirectionsRenderer();
  var originLocation = new google.maps.LatLng(originObject.lat, originObject.lng);
  var destinationLocation = new google.maps.LatLng(destinationObject.lat, destinationObject.lng);
  var request = {
    origin: originLocation,
    destination: destinationLocation,
    travelMode: 'DRIVING'
  };
  midLocationObject.lat = (originObject.lat + destinationObject.lat) / 2;
  midLocationObject.lng = (originObject.lng + destinationObject.lng) / 2;
  directionsService.route(request, function (result, status) {
    if (status == 'OK') {
      directionsDisplay.setDirections(result);
    }
  });
  directionsDisplay.setMap(map);
};


function populatePlaces(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    let row;
    results.forEach((place, index) => {
      console.log(place);
      if (index % 3 === 0) {
        row = createRow();
      }
      createCol(row, place);

      addMarker(place.geometry.location.lat(), place.geometry.location.lng());
    });
  }
}

function createRow() {
  const row = document.createElement("div");
  row.classList.add("row");
  resultsDisplay.appendChild(row);
  return row;
}

function createCol(row, place) {
  const col = document.createElement("div");
  col.classList.add("col", "s4");
  row.appendChild(col);

  const card = document.createElement("div");
  card.classList.add("card");
  col.appendChild(card);

  const cardImg = document.createElement("div");
  cardImg.classList.add("card-image");
  card.appendChild(cardImg);

  const img = document.createElement("img");
  img.setAttribute("src", place.photos[0].getUrl());
  img.setAttribute("alt", place.name);
  cardImg.appendChild(img);

  const title = document.createElement("span");
  title.classList.add("card-title");
  const titleText = document.createTextNode(place.name);
  title.appendChild(titleText);
  cardImg.appendChild(title);

  const addBtn = document.createElement("a");
  addBtn.classList.add("btn-floating", "halfway-fab", "waves-effect", "waves-light", "red");
  const plusSign = document.createElement("i");
  plusSign.classList.add("material-icons");
  const plusSignText = document.createTextNode("add");
  plusSign.appendChild(plusSignText);
  addBtn.appendChild(plusSign);
  cardImg.appendChild(addBtn);



  const cardContent = document.createElement("div");
  cardContent.classList.add("card-content");
  card.appendChild(cardContent);

  const cardP = document.createElement("p");
  const cardPText = document.createTextNode(place.vicinity);
  cardP.appendChild(cardPText);
  cardContent.appendChild(cardP);
  addBtn.addEventListener("click", (event) => {
    const item = $("<li>").addClass("collection-item").html(place.name + "<br>");
    const z = $("<sub>").text(place.vicinity);
    item.append(z);
    item.insertBefore("li.collection-item:last");
  });
}

function addMarker(lat, lng) {
  const marker = new google.maps.Marker({
    map: map,
    position: {
      lat: lat,
      lng: lng
    }
  });
  markers.push(marker);
}

/*
    Click events
*/
// Search button click event.
$(".search").on("click", function (event) {
  $(".collection").empty();
  resultsDisplay.innerHTML = "";
  origin = $("#origin").val().trim();
  destination = $("#destination").val().trim();
  if (origin !== "" && destination !== "") {
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': origin }, function (results, status) {
      if (status == 'OK') {
        originObject.name = origin;
        originObject.lat = parseFloat(results[0].geometry.location.lat());
        originObject.lng = parseFloat(results[0].geometry.location.lng());
        getDestinationObject();
        const originItem = $("<li>").addClass("collection-item").text(origin + "\n");
        $(".collection").append(originItem);

        const destinationItem = $("<li>").addClass("collection-item").text(destination + "\n");
        $(".collection").append(destinationItem);
      }
    });

    // Clear the input field.
    $("#origin").val("");
    $("#destination").val("");
  }
});

function deleteMarkers() {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
}

$("#changetype-restaurant").on("click", function () {
  resultsDisplay.innerHTML = "";
  deleteMarkers();
  initMap(midLocationObject.lat, midLocationObject.lng, 5);
  calcRoute();
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch({
    location: midLocationObject,
    radius: 50000,
    type: ["restaurants"]
  }, populatePlaces);
});

$("#changetype-supermarket").on("click", () => {
  resultsDisplay.innerHTML = "";
  deleteMarkers();
  initMap(midLocationObject.lat, midLocationObject.lng, 5);
  calcRoute();
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch({
    location: midLocationObject,
    radius: 50000,
    type: ["supermarket"]
  }, populatePlaces);
});

$("#changetype-gas").on("click", () => {
  resultsDisplay.innerHTML = "";
  deleteMarkers();
  initMap(midLocationObject.lat, midLocationObject.lng, 5);
  calcRoute();
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch({
    location: midLocationObject,
    radius: 50000,
    type: ["gas_station"]
  }, populatePlaces);
});


$("#changetype-lodging").on("click", function () {
  resultsDisplay.innerHTML = "";
  deleteMarkers();
  initMap(midLocationObject.lat, midLocationObject.lng, 5);
  calcRoute();
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch({
    location: midLocationObject,
    radius: 50000,
    type: ["hotel"]
  }, populatePlaces);
});

$("#changetype-campground").on("click", () => {
  resultsDisplay.innerHTML = "";
  deleteMarkers();
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch({
    location: midLocationObject,
    radius: 50000,
    type: ["campground"]
  }, populatePlaces);
});

$("#changetype-bar").on("click", () => {
  resultsDisplay.innerHTML = "";
  deleteMarkers();
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch({
    location: midLocationObject,
    radius: 50000,
    type: ["bar"]
  }, populatePlaces);
});

//  Weather click event.
$("#changetype-weather").on("click", function () {
  var queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${destination}&units=metric&APPID=1b2d7a96da1bf2ad8de91946503ece25`;
  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function (response) {

    let weatherLatLng = { lat: destinationObject.lat, lng: destinationObject.lng };
    let imageUrl = "http://openweathermap.org/img/w/" + response.weather[0].icon + ".png";
    let tempC = response.name + "\n" + String(Math.floor(response.main.temp)) + "\xBA C";
    let markerLabel = { color: '#0D0101', marginTop: '45px', fontWeight: 'bold', fontSize: '14px', text: tempC };
    let markerIcon = {
      url: imageUrl,
      scaledSize: new google.maps.Size(50, 50),
      labelOrigin: new google.maps.Point(80, 33)
    };
    let weatherMarker = new google.maps.Marker({
      position: weatherLatLng,
      icon: markerIcon,
      label: markerLabel
    });
    initMap(destinationObject.lat, destinationObject.lng, 6);
    weatherMarker.setMap(map);

  });
});

// click event to alert about the eartthquake prone area 
$("#changetype-alert").on("click", function () {

  initMap(midLocationObject.lat, midLocationObject.lng, 5);
  // Create a <script> tag and set the USGS URL as the source.
  var script = document.createElement('script');

  script.src = 'https://developers.google.com/maps/documentation/javascript/examples/json/earthquake_GeoJSONP.js';
  document.getElementsByTagName('head')[0].appendChild(script);

  map.data.setStyle(function (feature) {
    var magnitude = feature.getProperty('mag');
    return {
      icon: getCircle(magnitude)
    };
  });
  function getCircle(magnitude) {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: 'red',
      fillOpacity: .5,
      scale: Math.pow(2, magnitude) / 2,
      strokeColor: 'white',
      strokeWeight: .5
    };
  }
  window.eqfeed_callback = function (results) {
    map.data.addGeoJson(results);
  }
  calcRoute();
});

// Click event to get the current location of the user.
$("#changetype-currentLocation").on("click", function () {
  initMap(47.008, -122.000, 6);
  infoWindow = new google.maps.InfoWindow;

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      infoWindow.setPosition(pos);
      infoWindow.setContent('You are here');
      infoWindow.open(map);
      map.setCenter(pos);
    }, function () {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
});
