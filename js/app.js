// Global Varialbes
var map;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 25.061136, lng: 121.525712},
    zoom:13,
    mapTypeControl: false
  });
}
