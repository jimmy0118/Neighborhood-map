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
          var address = '';
          var city = '';
          var country = '';

          var clientID = 'S4QE4Z25BER33C3JVBNJIFYZS4YHZ0Y4X1SAENVIQHNNAIV1';
          var clientSecret = 'WJNLUZTKA135VHB15B2IKPYXCOOT2DXQSWDLHFIKMKKSEZRA';

          // Get JSON request of foursquare data
          var fsurl = 'https://api.foursquare.com/v2/venues/search?client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20180323&limit=1&ll=' + position.lat + ',' + position.lng +'&query=' + title;

          $.getJSON(fsurl).done(function(data) {
              var results = data.response.venues[0];
              address = results.location.formattedAddress[0] ? results.location.formattedAddress[0]: 'N/A';
              city = results.location.formattedAddress[1] ? results.location.formattedAddress[1]: 'N/A';
              country = results.location.formattedAddress[2] ? results.location.formattedAddress[2]: 'N/A';
          }).fail(function() {
              window.alert('Something went wrong with foursquare');
          });

          // Create a marker per location, and put into markers array.
          var marker = new google.maps.Marker({
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
          });
          // Push the marker to our array of markers.
          markers.push(marker);
          // Create an onclick event to open an infowindow at each marker.
          bounds.extend(markers[i].position);
          // Create an onclick event to open the large infowindow at each marker.
          marker.addListener('click', function() {
            populateInfoWindow(this, address, city, country, largeInfowindow);
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
function populateInfoWindow(marker, address, city, country, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
      // Clear the infowindow content to give the streetviwew time to load.
      infowindow.setContent('');
      infowindow.marker = marker;
      // Make sure the marker property is cleared if the InfoWindow is closed.
      infowindow.addListener('closeclick', function() {
          infowindow.marker = null;
      });
      // Set the content of infowindow
      windowContent = '<h3>' + marker.title + '</h3>' + '<p>' + address + '</br>' + city + '</br>' + country + '</p>';

      var streetViewService = new google.maps.StreetViewService();
      var radius = 150;

      // Set the content of

      // In case the status is OK, which means the pano was found, compute the
      // position of the streetview image, then calculate the heading, then get a
      // panorama from that and set the options
      function getStreetView(data, status) {
          if (status == google.maps.StreetViewStatus.OK) {
              var nearStreetViewLocation = data.location.latLng;
              var heading = google.maps.geometry.spherical.computeHeading(
                  nearStreetViewLocation, marker.position);
                  infowindow.setContent(windowContent + '</div><div id="pano"></div>');
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
              infowindow.setContent(windowContent + '<div>No Street View Found</div>');
          }
      }
      // Use streetview service to get the closest streetview image within
      // 150 meters of the markers position.
      streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
      // open the infowindow on the correct marker.
      infowindow.open(map, marker);
    }
};
