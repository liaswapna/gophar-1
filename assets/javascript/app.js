// initialize Firebase
const config = {
  apiKey: "AIzaSyCultN8T--YCGVIWMWbxCB98KvkgFOsaFg",
  authDomain: "gopharit-8.firebaseapp.com",
  databaseURL: "https://gopharit-8.firebaseio.com",
  projectId: "gopharit-8",
  storageBucket: "gopharit-8.appspot.com",
  messagingSenderId: "992298887902"
};
firebase.initializeApp(config);

const db = firebase.database();

const geolocationRef = db.ref("/geolocation");
let geolocationRefKeys = 0;

const mapDisplay = document.querySelector(".map");
const originInputField = document.querySelector("#autocomplete-input-a");
const destinationInputField = document.querySelector("#autocomplete-input-b");
const searchButton = document.querySelector(".go-button > a");
const resultsDisplay = document.querySelector(".article-backdrop");

let map;
let geocoder;
let service;

let origin = {
  name: "",
  lat: "",
  lng: ""
};

let destination = {
  name: "",
  lat: "",
  lng: ""
};

let midpoint = {
  lat: "",
  lng: ""
};


function addGeolocation(location, name, lat, lng) {
  geolocationRef.child(location).set({
    name: name,
    lat: lat,
    lng: lng
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
}

function initMap() {
  // map
  map = new google.maps.Map(mapDisplay, {
    zoom: 7,
    center: {
      lat: 47.6062,
      lng: -122.3321
    }
  });
}

function findPlaces() {
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch({
    location: midpoint,
    radius: 50000,
    type: ['point_of_interest']
  }, populatePlaces);
}

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
}


searchButton.addEventListener("click", (event) => {
  // prevent page refresh
  event.preventDefault();

  // create geocoder object
  geocoder = new google.maps.Geocoder();

  // get origin
  origin.name = originInputField.value;

  // get origin's lat & lng
  geocoder.geocode({
    "address": origin.name
  }, (results, status) => {
    if (status == google.maps.GeocoderStatus.OK) {
      // get origin's coordinates
      origin.lat = results[0].geometry.location.lat();
      origin.lng = results[0].geometry.location.lng();

      // add to db
      addGeolocation("origin", origin.name, origin.lat, origin.lng);

      // create marker for origin
      addMarker(origin.lat, origin.lng);
    }
  });

  // get destination
  destination.name = destinationInputField.value;

  // get destination's lat & lng
  geocoder.geocode({
    "address": destination.name
  }, (results, status) => {
    if (status == google.maps.GeocoderStatus.OK) {
      // get destination's coordinates
      destination.lat = results[0].geometry.location.lat();
      destination.lng = results[0].geometry.location.lng();

      // add to db
      addGeolocation("destination", destination.name, destination.lat, destination.lng);

      // create marker for destination
      addMarker(destination.lat, destination.lng);
    }
  });
});

geolocationRef.on("child_added", childSnapshot => {
  const childKey = childSnapshot.key;
  const childData =  childSnapshot.val();

  if (childKey === "origin") {
    origin = childData;
    geolocationRefKeys++;
  } else if (childKey === "destination") {
    destination = childData;
    geolocationRefKeys++;
  }

  if (geolocationRefKeys === 2) {
    midpoint.lat = (origin.lat + destination.lat) / 2;
    midpoint.lng = (origin.lng + destination.lng) / 2;
    map.setCenter(midpoint);
    findPlaces();
  }
});

initMap();
