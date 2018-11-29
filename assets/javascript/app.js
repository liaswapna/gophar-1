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
    };

// intialize the map
function initMap(lat,lng,zoom){
    map = new google.maps.Map(document.querySelector('.map'), {
      center: {lat: lat, lng: lng},
      zoom: zoom,
      mapTypeControl: true,
        mapTypeControlOptions: {
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          mapTypeIds: ['roadmap', 'terrain']
        }
    });
};
initMap(47,-122.78,10);

// function to get DestinationObject
function getDestinationObject(){
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode( { 'address': destination}, function(results, status) {
      if (status == 'OK') {
        destinationObject.name = destination;
        destinationObject.lat = parseFloat(results[0].geometry.location.lat());
        destinationObject.lng = parseFloat(results[0].geometry.location.lng());
        initMap(midLocationObject.lat,midLocationObject.lng,5);
        // calculate the route.
        calcRoute();
      }
    });
}

// function to calculate the route.
function calcRoute() {

    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var originLocation = new google.maps.LatLng(originObject.lat,originObject.lng);
    var destinationLocation = new google.maps.LatLng(destinationObject.lat,destinationObject.lng);
    var request = {
      origin: originLocation,
      destination: destinationLocation,
      travelMode: 'DRIVING'
    };
    midLocationObject.lat = (originObject.lat+destinationObject.lat)/2;
    midLocationObject.lng = (originObject.lng+destinationObject.lng)/2;
    directionsService.route(request, function(result, status) {
      if (status == 'OK') {
        directionsDisplay.setDirections(result);
      }
    });
  
    // var mapOptions = {
    //   zoom:7,
    //   center: originLocation
    // }
  
    // var map = new google.maps.Map(document.getElementById('map'), mapOptions);
    directionsDisplay.setMap(map);
};
  

/*
    Click events
*/ 
// Search button click event.
$(".search").on("click",function(event){
    origin = $("#origin").val().trim();
    destination = $("#destination").val().trim();
    // origin = "sacramento";
    // destination = "san diego";
    if(origin !== "" && destination !== ""){
        $(".checkButton").css("display","block");

        let geocoder = new google.maps.Geocoder();
        geocoder.geocode( { 'address': origin}, function(results, status) {
        if (status == 'OK') {
            originObject.name = origin;
            originObject.lat = parseFloat(results[0].geometry.location.lat());
            originObject.lng = parseFloat(results[0].geometry.location.lng());
            getDestinationObject();
        }
        });
        
        // Clear the input field.
        $("#origin-input").val("");
        $("#destination-input").val("");
    }
});