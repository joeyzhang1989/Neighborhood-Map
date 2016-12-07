var mapViewModel = function() {
    var self = this;
    var map; // declares a global map variable
    var defaultAddress = {
        lat: 45.496814,
        lng: -73.58248
    };
    var neighborhoodMarker = []; // create a blank array to store the makers
    var placeMarkers = []; // create placemarkers array to use in multiple functions to have control over the number of places that show.
    self.neighborhood = ko.observable('');
    self.message = ko.observable('Set neighborhood location');
    self.placeMarkers = ko.observableArray();

    function initMap() {
        /*
        This is google maps customized styles "Subtle Grayscale " 
        obtained from the https://snazzymaps.com/style/15/subtle-grayscale,
        attributed to the author Paulo Avila
        */
        var styles = [{
            "featureType": "administrative",
            "elementType": "all",
            "stylers": [{
                "saturation": "-100"
            }]
        }, {
            "featureType": "administrative.province",
            "elementType": "all",
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "landscape",
            "elementType": "all",
            "stylers": [{
                "saturation": -100
            }, {
                "lightness": 65
            }, {
                "visibility": "on"
            }]
        }, {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [{
                "saturation": -100
            }, {
                "lightness": "50"
            }, {
                "visibility": "simplified"
            }]
        }, {
            "featureType": "road",
            "elementType": "all",
            "stylers": [{
                "saturation": "-100"
            }]
        }, {
            "featureType": "road.highway",
            "elementType": "all",
            "stylers": [{
                "visibility": "simplified"
            }]
        }, {
            "featureType": "road.arterial",
            "elementType": "all",
            "stylers": [{
                "lightness": "30"
            }]
        }, {
            "featureType": "road.local",
            "elementType": "all",
            "stylers": [{
                "lightness": "40"
            }]
        }, {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [{
                "saturation": -100
            }, {
                "visibility": "simplified"
            }]
        }, {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [{
                "hue": "#ffff00"
            }, {
                "lightness": -25
            }, {
                "saturation": -97
            }]
        }, {
            "featureType": "water",
            "elementType": "labels",
            "stylers": [{
                "lightness": -25
            }, {
                "saturation": -100
            }]
        }];
        // bind the map with google maps and initial the map
        map = new google.maps.Map(document.getElementById("map"), {
            center: defaultAddress,
            zoom: 13,
            animation: google.maps.Animation.DROP,
            mapTypeControl: false,
            disableDefaultUI: true,
            styles: styles
        });
        // find search box DOM element
        var searchBox = document.getElementById('search-area');
        //use the google maps Autocomplete
        var autocomplete = new google.maps.places.Autocomplete(searchBox);
        autocomplete.bindTo('bounds', map);
        // Listen for the event fired when the user selects a prediction from list
        autocomplete.addListener('place_changed', function() {
            var place = autocomplete.getPlace();
            if (!place.geometry) {
                // User entered the name of a Place that was not suggested and
                // pressed the Enter key, or the Place Details request failed.
                window.alert("No details available for input: '" + place.name + "'");
                self.message('re-set your location');
            } else {
                // for selected place, display the icon, name and location
                // update the information when the marker is clicked
                createMarkersForNeighborhood(place);
            }
        });
    }
    // set the locaion, titie and icon for the neighborhood marker
    function createMarkersForNeighborhood(place) {
        var bounds = new google.maps.LatLngBounds();
        // customize the icon image 
        var image = {
            url: 'img/neighborhood.png',
            // This marker is 20 pixels wide by 32 pixels high.
            size: new google.maps.Size(48, 48),
            // The origin for this image is (0, 0).
            origin: new google.maps.Point(0, 0),
            // The anchor for this image is the base of the flagpole at (0, 32).
            anchor: new google.maps.Point(0, 48)
        };
        //defined the clicked area of the icon
        var shape = {
            coords: [1, 1, 1, 20, 18, 20, 18, 1],
            type: 'poly'
        };
        neighborhoodMarker.length = 0; // clear the array to store the only place
        // neighborhood marker
        var marker = new google.maps.Marker({
            map: map,
            id: place.place_id,
            shape: shape,
            position: place.geometry.location,
            title: place.name,
            icon: image
        });
        neighborhoodMarker.push(marker);
        // create a single infowindow for the neighborhood marker
        var neighborhoodInfoWindow = new google.maps.InfoWindow();
        var innerHtml;
        // if a marker is clicked, opne the infowindow
        marker.addListener('click', function() {
            if (neighborhoodInfoWindow.marker == this) {
                console.log("This infowindow already is on this marker!");
            } else {
                innerHtml += '<div>' + marker.title + '</div>'
                neighborhoodInfoWindow.setContent('innerHtml');
                neighborhoodInfoWindow.open(map, marker);
            }
        });
        //cleared marker property if the neighborhoodInfoWindow is closed.
        neighborhoodInfoWindow.addListener('closeclick', function() {
            neighborhoodInfoWindow.marker = null;
        });
         if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(13); // Why 17? Because it looks good.
        }
    }
    // initial the map object
    initMap();
};

/*
when document is ready
use IIFE to invoke the map initial funtion 
and knockout binding to the viewModel
*/
$(function() {
    ko.applyBindings(new mapViewModel());
});