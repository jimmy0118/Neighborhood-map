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

  var largeInfowindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();

  // The following group uses the location array to create an array of markers on initialize.
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
          // Create an onclick event to open the large infowindow at each marker.
          marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
          });
        }
        // Extend the boundaries of the map for each marker
        map.fitBounds(bounds);
}

// Handle map error
function googleError() {
    window.alert('An error occurred with Google Maps!')
}

// This function populates the infowindow when the marker is clicked.
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
      // Clear the infowindow content to give the streetviwew time to load.
      infowindow.setContent('');
      infowindow.marker = marker;
      // Make sure the marker property is cleared if the InfoWindow is closed.
      infowindow.addListener('closeclick', function() {
          infowindow.marker = null;
      });
      var streetViewService = new google.maps.StreetViewService();
      var radius = 200;
      // In case the status is OK, which means the pano was found, compute the
      // position of the streetview image, then calculate the heading, then get a
      // panorama from that and set the options
      function getStreetView(data, status) {
          if (status == google.maps.StreetViewStatus.OK) {
              var nearStreetViewLocation = data.location.latLng;
              var heading = google.maps.geometry.spherical.computeHeading(
                  nearStreetViewLocation, marker.position);
                  infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                  var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                  };
              var panorama = new google.maps.StreetViewPanorama(
                  document.getElementById('pano'), panoramaOptions);
          } else {
              infowindow.setContent('<div>' + marker.title + '</div>' + '<div>No Street View Found</div>');
          }
      }
      // Use streetview service to get the closest streetview image within
      // 50 meters of the markers position.
      streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
      // open the infowindow on the correct marker.
      infowindow.open(map, marker);
    }
};
