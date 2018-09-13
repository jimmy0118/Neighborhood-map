// Open the drawer when the menu ison is clicked.
var menu = document.querySelector('#menu');
var main = document.querySelector('main');
var drawer = document.querySelector('#drawer');

menu.addEventListener('click', function(e) {
    drawer.classList.toggle('open');
    e.stopPropagation();
});
main.addEventListener('click', function() {
    drawer.classList.remove('open');
});

// Global Varialbes
var map;
var largeInfowindow;
var bounds;

// Google maps init
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 25.061136, lng: 121.525712},
    zoom:12,
    mapTypeControl: false
  });

  largeInfowindow = new google.maps.InfoWindow();

  bounds = new google.maps.LatLngBounds();

  ko.applyBindings(new ViewModel());
}

// Handle map error
function googleError() {
    window.alert('An error occurred with Google Maps!')
}

// Buliding Location function for KO JS
var Location = function(data) {
    var self = this;

    this.title = data.title;
    this.position = data.location;
    this.address = '',
    this.city = '',
    this.country = '';

    this.searchTitle = data.title.toLowerCase()
    this.visible = ko.observable(true);

    // set variable clientID and clientSecret for using foursquare apis
    var clientID = 'S4QE4Z25BER33C3JVBNJIFYZS4YHZ0Y4X1SAENVIQHNNAIV1';
    var clientSecret = 'WJNLUZTKA135VHB15B2IKPYXCOOT2DXQSWDLHFIKMKKSEZRA';

    // Get JSON request of foursquare data
    var fsurl = 'https://api.foursquare.com/v2/venues/search?client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20180323&limit=1&ll=' + this.position.lat + ',' + this.position.lng +'&query=' + this.title;

    $.getJSON(fsurl).done(function(data) {
        var results = data.response.venues[0];
        self.address = results.location.formattedAddress[0];
        self.city = results.location.formattedAddress[1];
        self.country = results.location.formattedAddress[2];
    }).fail(function() {
        window.alert('Something went wrong with foursquare');
    });

    // Create a marker per location
    this.marker = new google.maps.Marker({
      position: this.position,
      title: this.title,
      animation: google.maps.Animation.DROP,
    });

    // Show markers on the map
    self.showMarkers = ko.computed(function() {
        // Extend the boundaries of the map for each marker and display the marker.
        if (self.visible() === true) {
            self.marker.setMap(map);
            bounds.extend(self.marker.position);
            map.fitBounds(bounds);
        } else {
            self.marker.setMap(null);
        }
    });

    // Create an onclick event to open the large infowindow at each marker.
    this.marker.addListener('click', function() {
      populateInfoWindow(this, self.address, self.city, self.country, largeInfowindow);
      toggleBounce(this);
    });

    // show item info when selected from list.
    this.showLocation = function(location) {
        google.maps.event.trigger(self.marker, 'click');
    };

    // Create bounce effect when item selected
    this.bounce = function(place) {
        google.maps.event.trigger(self.marker, 'click');
    };
};

// Constructing ViewModel
var ViewModel = function() {
    var self = this;

    this.searchText = ko.observable('');
    this.mapList = ko.observableArray([]);

    // Add markers for each location.
    locations.forEach(function(location) {
        self.mapList.push( new Location(location) );
    });

    // locations viewed on map
    this.filteredList = ko.computed(function() {
        return this.mapList().filter(function(location) {
            var matched = location.searchTitle.indexOf(this.searchText().toLowerCase()) !== -1;
            location.marker.setVisible(matched);

            return matched;
        }, this);
    }, this);
};

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

// This function is about adding functionality to animate a map marker when
//either the list item associated with it or the map marker itself is selected.
function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 1400);
  }
}
