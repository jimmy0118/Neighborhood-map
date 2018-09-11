// Global Varialbes
var map;

var markers = [];
// Google maps init
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 25.061136, lng: 121.525712},
    zoom:10,
    mapTypeControl: false
  });

  var bounds = new google.maps.LatLngBounds();

  for (var i = 0; i < locations.length; i++) {
          // Get the position from the location array.
          var position = locations[i].location;
          var title = locations[i].title;
          // Create a marker per location, and put into markers array.
          var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
          });
          // Push the marker to our array of markers.
          markers.push(marker);
          // Create an onclick event to open an infowindow at each marker.
          bounds.extend(markers[i].position);
        }
        // Extend the boundaries of the map for each marker
        map.fitBounds(bounds);
}

// Handle map error
function googleError() {
    window.alert('An error occurred with Google Maps!')
}
