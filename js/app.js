// Model for the nearBy place markers based on the neighborhood location
var venueMarkers = function(item) {
    this.name = ko.observable(item.venue.name);
    this.location = ko.observable(item.venue.location);
    this.position = ko.computed(function() {
        var lat = this.location().lat;
        var lng = this.location().lng;
        return new google.maps.LatLng(lat, lng);
    }, this);
    this.category = ko.observable(item.venue.categories[0].name);
    this.address = ko.observable(item.venue.location.formattedAddress);
    this.phone = ko.observable(item.venue.contact.formattedPhone);
    this.rating = ko.observable(item.venue.rating);
    this.url = ko.observable(item.venue.url);
    this.imgSrc = ko.observable('https://irs0.4sqi.net/img/general/800x600' + item.venue.photos.groups[0].items[0].suffix);
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
    var defaultNeighborhood = '3455 Chemin de la Côte-des-Neiges, Montréal, QC H3H, Canada';
    var neighborhoodMarker = []; // create a blank array to store the makers
    self.neighborhood = ko.observable('');
    self.message = ko.observable('Set new neighborhood location');
    self.fliteredMessage = ko.observable('Fliter by the name');
    self.keyword = ko.observable('');
    self.nearByPlaces = ko.observableArray([]); // nearby places based on the neighborhood location
    // self.filteredList = ko.observable([]);// array of flitered places
    // create the infoWindow to be used for the marker is clicked to open
    if (typeof google !== "undefined") {
        var infoWindow = new google.maps.InfoWindow({
            maxWidth: 300,
            pixelOffset: new google.maps.Size(0, 80)
        });
    }
    // update the neighborhood
    self.neighborhoodChange = ko.computed(function() {
        if (self.neighborhood() !== '') {
            removeNeighborhoodMarker();
            removeMarker();
            self.neighborhood('');
        }
    });
    // initial the map object
    initMap();

    // show the placeList when the infowindow is closed
    google.maps.event.addListener(infoWindow, 'closeclick', function() {
        var center = map.getCenter();
        map.setCenter(center);
        $('.places').css('display', 'block');
    });
    // center the map when the window resize
    google.maps.event.addDomListener(window, "resize", function() {
        var center = map.getCenter();
        google.maps.event.trigger(map, "resize");
        map.setCenter(center);
    });
    // make sure the map bounds get updated on page resize
    window.addEventListener('resize', function(e) {
        $("#map").height($(window).height());
        $("#map").width($(window).width());
    });

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
            mapTypeControl: false,
            disableDefaultUI: true,
            styles: styles
        });

        function mapErrorhandling() {
            setTimeout(function() {
                $('#map').html('We are unable Google Maps. Please refresh your browser and try again.');
            }, 5000);
        }
        setDefaultNeighborhood(defaultNeighborhood);
        // // initial the map using the default location
        function setDefaultNeighborhood(defaultNeighborhood) {
            var request = {
                query: defaultNeighborhood
            };
            service = new google.maps.places.PlacesService(map);
            service.textSearch(request, neighborhoodCallback);
        }

        // callback method 
        function neighborhoodCallback(results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                createMarkersForNeighborhood(results[0]);
                getNeiborhoodInformation(results[0]);
            } else {
                console.log('failed to load the defaultNeighborhood');
            }
        }

        var bounds = new google.maps.LatLngBounds();
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
                $(".places").css({
                    visibility: 'visible',
                });
                createMarkersForNeighborhood(place);
                getNeiborhoodInformation(place);
            }
        });
    }
    // set the locaion, titie and icon for the neighborhood marker
    function createMarkersForNeighborhood(place) {
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
            animation: google.maps.Animation.DROP,
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
            animation: google.maps.Animation.DROP,
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
        var basicInfo = '<div class="venueInfo"><p class = venueName><img class = foursquareLogo src = "img/foursquare.png" alt = "logo" >' + name + ' ' + '<em class = "rating">' + rating + '</em></p><p class="venueCategory">' + category + '</p><p class="venueAddress">' + address + '</p>';
        var contactInfo = '<p class = venuePhone>' + phone + '</p><p class = venueURL><a href = ' + venueURL + ' target="_blank">' + venueURL + '</a></p><div class = snapshot><img src = ' + imgSrc + '></div></div>';
        var venueContent = basicInfo + contactInfo;
        google.maps.event.addListener(marker, 'click', function() {
            infoWindow.setContent(venueContent);
            map.setCenter(marker.position);
            map.panBy(0, -60);
            infoWindow.open(map, this);
        });
    }
    // remove neighborhood marker from the map
    function removeNeighborhoodMarker() {
        for (var i in neighborhoodMarker) {
            neighborhoodMarker[i].setMap(null);
            neighborhoodMarker[i] = null;
        }
        while (neighborhoodMarker.length > 0) {
            neighborhoodMarker.pop();
        }
    }
    // remove the markers when the new neighborhood loaction is set
    function removeMarker() {
        for (place in markers) {
            markers[place].setMap(null);
            markers[place] = null;
        }
        while (markers.length > 0) {
            markers.pop();
            self.nearByPlaces().pop();
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
                    $('.places').css('display', 'none');
                }
            }
        }
        /**
         * incurred when the user click the find button 
         * to search for the matched venue results 
         */
    self.filterKeyword = function() {
        var searchWord = self.keyword().toLowerCase();
        var currentArray = markers;
        var foundFlag = false;
        if (!searchWord) {
            window.alert("No place is founded, please validate your input");
            return;
        } else {
            //Loop through the grouponDeals array and see if the search keyword matches 
            //with any venue name or dealTags in the list, if so push that object to the filteredList 
            //array and place the marker on the map.
            for (marker in markers) {
                if (markers[marker].title.toLowerCase().indexOf(searchWord) !== -1) {
                    currentMarker = markers[marker]
                    google.maps.event.trigger(markers[marker], 'click');
                    foundFlag = true;
                } else {
                    if (markers[marker].title.toLowerCase().indexOf(searchWord) === -1) {
                        markers[marker].setMap(null);
                    }
                    if (foundFlag === true) {
                        self.fliteredMessage("Fliter by the name");
                        $('.places').css('display', 'none');
                    }
                    if (foundFlag === false) {
                        self.keyword('');
                        self.fliteredMessage("Re-enter the validated name");
                        $('.places').css('display', 'blocks');
                    }
                }
            }
        }
    }
};
/*
 * when document is ready
 * use IIFE invoke the map initial funtion 
 * and knockout binding to the viewModel
 */
$(function() {
    ko.applyBindings(new mapViewModel());
});
