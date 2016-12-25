// Model for the nearBy place markers based on the neighborhood location
var venueMarkers = function(item) {
    this.name = ko.observable(item.venue.name);
    this.location = ko.observable(item.venue.location);
    this.position = ko.computed(function() {
    	var lat = this.location().lat;
        var lng = this.location().lng;
        return new google.maps.LatLng(lat, lng);
  	},this);
    this.category = ko.observable(item.venue.categories[0].name);
    this.address = ko.observable(item.venue.location.formattedAddress);
    this.phone = ko.observable(item.venue.contact.formattedPhone);
    this.rating = ko.observable(item.venue.rating);
    this.url = ko.observable(item.venue.url);
    this.imgSrc = ko.observable('https://irs0.4sqi.net/img/general/300x200' + item.venue.photos.groups[0].items[0].suffix);
};


var mapViewModel = function() {
    var self = this;
    var foursquare;
    var markers = [];
    var map; // declares a global map variable
    var defaultAddress = {
        lat: 45.496814,
        lng: -73.58248
    };
    var neighborhoodMarker = []; // create a blank array to store the makers
    var placeMarkers = []; // create placemarkers array to use in multiple functions to have control over the number of places that show.
    self.neighborhood = ko.observable('');
    self.message = ko.observable('Set neighborhood location');
    self.nearByPlaces = ko.observableArray([]); // nearby places based on the neighborhood location
    // create the infoWindow to be used for the marker is clicked to open
    if (typeof google != "undefined") {
        var infoWindow = new google.maps.InfoWindow({
            maxWidth: 300
        });
    }
    // initial the map object
    initMap();

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
                getNeiborhoodInformation(place);
            }
        });
    }
    // set the locaion, titie and icon for the neighborhood marker
    function createMarkersForNeighborhood(place) {
        var bounds = new google.maps.LatLngBounds();
        // customize the icon image 
        var image = {
            url: 'img/neighborhood.png',
            // This marker is 48 pixels wide by 48 pixels high.
            size: new google.maps.Size(48, 48),
            // The origin for this image is (0, 0).
            origin: new google.maps.Point(0, 0),
            // The anchor for this image is the base of the flagpole at (0, 48).
            anchor: new google.maps.Point(0, 48)
        };
        var marker = new google.maps.Marker({
            map: map,
            id: place.place_id,
            position: place.geometry.location,
            title: place.name,
            icon: image
        });
        neighborhoodMarker.push(marker);
        // if a marker is clicked, open the infowindow
        var innerHTML = '<div>' + marker.title + '</div>';
        google.maps.event.addListener(marker, 'click', function() {
            infoWindow.setContent(innerHTML);
            infoWindow.open(map, this);
        });
    }

    // get the neiborhood location information and create the venue markers based that location
    function getNeiborhoodInformation(place) {
        var lat = place.geometry.location.lat();
        var lng = place.geometry.location.lng();
        var neighborLocation = lat + "," + lng;

        // get json from the foursquare api based on the user set location
        foursquare = 'https://api.foursquare.com/v2/venues/explore?ll=' + neighborLocation + '';
        extra = '&section=coffee&limit=15&sortByDistance=1&time=any&venuePhotos=1&oauth_token=11R24OTEDHVMGTG41PCGFSDICHFA3XKUTJSBQVSFNKYUGR12&v=20161220';
        var foursquareUrl = foursquare + extra;
        $.getJSON(foursquareUrl, function(data) {
            var places = data.response.groups[0].items;
            var bounds = data.response.suggestedBounds;
            //loop the place to push the place item to the array nearByPlaces
            places.forEach(function(item) {
                self.nearByPlaces.push(new venueMarkers(item));
            });
            // loop the array nearByPlaces to set markers for place returned by foursquare
            for (var i = 0, l = self.nearByPlaces().length; i < l; i++) {
                createVenueMarkers(self.nearByPlaces()[i]);
            }
            // fit the map by suggested bounds
            if (bounds !== undefined) {
                mapBounds = new google.maps.LatLngBounds(
                    new google.maps.LatLng(bounds.sw.lat, bounds.sw.lng),
                    new google.maps.LatLng(bounds.ne.lat, bounds.ne.lng));
                map.fitBounds(mapBounds);
            }
        }).fail(function(e) {
            console.log('failed to load foursquare json');
        });
    }
    // create the markers use the info returned by the foursquare API   
    function createVenueMarkers(venue) {
        var name = venue.name();
        var category = venue.category();
        var position = venue.position();
        var address = venue.address();
        var phone = venue.phone();
        var imgSrc = venue.imgSrc();
        var rating = venue.rating();
        var venueURL = venue.url();
      	// customize the icon image 
        var image = {
            url: 'img/coffee.png',
            // This marker is 32 pixels wide by 32 pixels high.
            size: new google.maps.Size(32, 32),
            // The origin for this image is (0, 0).
            origin: new google.maps.Point(0, 0),
            // The anchor for this image is the base of the flagpole at (0, 32).
            anchor: new google.maps.Point(0, 32)
        };
        // nearBy coffee shops marker
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: name,
            icon: image
        });
        markers.push(marker);
        if (phone === undefined) {
            phone = 'Not Available Phone';
        }
        if (venueURL === undefined) {
            venueURL = 'Not Available Website';
        }
        // venue info window HTML element content
        var basicInfo = '<div class="venueInfo"><p class = venueName><img class = foursquareLogo src = "img/foursquare.png" alt = "logo" >' + name + ' ' + '<em id = "rating">' + rating + '</em></p><p class="venueCategory">' + category + '</p><p class="venueAddress">' + address + '</p>';
        var contactInfo = '<p class = venuePhone>' + phone + '</p><p class = venueURL><a href = ' + venueURL + ' target="_blank">' + venueURL + '</a></p><div class = snapshot><img src = ' + imgSrc + '></div></div>';
        var venueContent = basicInfo + contactInfo;
        google.maps.event.addListener(marker, 'click', function() {
            infoWindow.setContent(venueContent);
            infoWindow.open(map, this);
        });
    }

    // remove the markers when the new neighborhood loaction is set
    function removeMarker(){
    	for (place in self.nearByPlaces) {
    		self.nearByPlaces()[place].setMap(null);
    		if (self.nearByPlaces().length > 0) {
    			self.nearByPlaces().pop();
    		}
     	}
    }

    	/**
	 * when the itme on the display list is clicked
	 * the correspoding marker if the item name matched 
	 * with the marker's titleon the map will be focused and opend 
	 */
	self.focusMarker = function(item) {
		var vName = item.name();
		for (var i = 0; i < markers.length; i++) {
			if (markers[i].title === vName) {
				google.maps.event.trigger(markers[i], 'click');
				map.panTo(markers[i].position);
			}
		}
	}
};
/*
when document is ready
use IIFE to invoke the map initial funtion 
and knockout binding to the viewModel
*/
$(function() {
    ko.applyBindings(new mapViewModel());
});