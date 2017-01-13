//detect the mobile device
$(document).ready(function() {
    var isMobile = false;
    var windowSize = $(window).width();
    // device detection
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4)) || windowSize <= 900) {
        isMobile = true;
        if (isMobile === true) {
            $("head").append('<link rel="stylesheet" href="css/mobile.css"/>');
        }
    }
});

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

// google map error handling method
function mapErrorhandling() {
    $('body').html('We are unable Google Maps. Please refresh your browser and try again.');
}

var map; // declares a global map variable
// initial the google map
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
    var defaultAddress = {
        lat: 45.496814,
        lng: -73.58248
    };
    var bounds = new google.maps.LatLngBounds();
    // bind the map with google maps and initial the map
    map = new google.maps.Map(document.getElementById("map"), {
        center: defaultAddress,
        zoom: 15,
        mapTypeControl: false,
        styles: styles
    });
    /*
     * when Google Map API is ready apply
     * knockout binding to the viewModel
     */
    ko.applyBindings(new mapViewModel());
}
//'VM'part of the knockoutjs
var mapViewModel = function() {
    var self = this;
    var foursquare;
    var markers = [];
    var defaultNeighborhood = '3455 Chemin de la Côte-des-Neiges, Montréal, QC H3H, Canada';
    var neighborhoodMarker = []; // create a blank array to store the makers
    self.neighborhood = ko.observable(''); //update the neighborhood location
    self.neighborhoodErrorMessage = ko.observable(''); // show on UI when load default neoghborhood fail
    self.fourSquareErrorMessage = ko.observable(''); // show on UI when load fourSquare fail
    self.message = ko.observable('Set new neighborhood location');
    self.fliteredMessage = ko.observable('Fliter by the name');
    self.keyword = ko.observable('');
    self.nearByPlaces = ko.observableArray([]); // nearby places based on the neighborhood location
    self.toggleSymbol = ko.observable('show list'); //holds value for list togglings
    self.filteredList = ko.observableArray([]); // array of flitered places
    // create the infoWindow to be used for the marker is clicked to open
    if (typeof google !== "undefined") {
        var infoWindow = new google.maps.InfoWindow({
            maxWidth: 300,
            pixelOffset: new google.maps.Size(0, 0)
        });
    }
    //toggles the list view
    this.listToggle = function() {
        if (self.toggleSymbol() === 'hide list') {
            self.toggleSymbol('show list');
        } else {
            self.toggleSymbol('hide list');
        }
    };
    // update the neighborhood
    self.neighborhoodChange = ko.computed(function() {
        if (self.neighborhood() !== '') {
            removeNeighborhoodMarker();
            removeMarker();
            self.neighborhood('');
        }
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

    setDefaultNeighborhood(defaultNeighborhood);
    autocompletion();
    // use google maps auto-completion for location entry
    function autocompletion() {
        // find search box DOM element
        var searchBox = document.getElementById('search-area');
        // use the google maps Autocomplete
        var autocomplete = new google.maps.places.Autocomplete(searchBox);
        autocomplete.bindTo('bounds', map);
        // Listen for the event fired when the user selects a prediction from list
        autocomplete.addListener('place_changed', function() {
            var place = autocomplete.getPlace();
            if (!place.geometry) {
                // User entered the name of a Place that was not suggested and
                // pressed the Enter key, or the Place Details request failed.
                window.alert('No details available for input:' + place.name);
                self.message('Re-set your location');
            } else {
                // for selected place, display the icon, name and location
                // update the information when the marker is clicked
                createMarkersForNeighborhood(place);
                getNeiborhoodInformation(place);
            }
        });
    }
    // initial the map using the default location
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
            self.neighborhoodErrorMessage('Fail to load the default Neighborhood, please refresh');
            console.log('Failed to load the defaultNeighborhood');
        }
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
        var innerHTML = '<div class="neighborhoodTitle">' + marker.title + '</div>';
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
            self.filteredList(self.nearByPlaces());
            // loop the array nearByPlaces to set markers for place returned by foursquare
            for (var i = 0, l = self.nearByPlaces().length; i < l; i++) {
                createVenueMarkers(self.nearByPlaces()[i]);
            }
            // fit the map by suggested bounds
            if (bounds !== undefined) {
                mapBounds = new google.maps.LatLngBounds(
                    new google.maps.LatLng(bounds.sw.lat, bounds.sw.lng),
                    new google.maps.LatLng(bounds.ne.lat, bounds.ne.lng));
                //map display responsively when the broswer window resized
                // google.maps.event.addDomListener(window, 'resize', function() {
                map.fitBounds(mapBounds); // `mapBounds` is a `LatLngBounds` object
                // });
            }
        }).fail(function(e) {
            self.fourSquareErrorMessage('Failed to load foursquare json,please refresh')
            console.log('Failed to load foursquare json');
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
            markerAnimated(marker);
            infoWindow.setContent(venueContent);
            map.setCenter(marker.position);
            map.panBy(0, -250);
            infoWindow.open(map, this);
        });
        // center the map and remove the animation when the infowindow is closed
        google.maps.event.addListener(infoWindow, 'closeclick', function() {
            var center = map.getCenter();
            map.setCenter(center);
        });
    }
    // when the marker is clicked add bounce animation
    function markerAnimated(marker) {
        if (marker.getAnimation() !== null) {
            marker.setAnimation(null);
        } else {
            map.setCenter(marker.position);
            marker.setAnimation(google.maps.Animation.BOUNCE);
            stopAnimation(marker);
        }
    }
    // set timeout for the clicked animation
    function stopAnimation(marker) {
        setTimeout(function() {
            marker.setAnimation(null);
        }, 2100);
    }
    // remove neighborhood marker from the map
    function removeNeighborhoodMarker() {
        for (var i = 0, l = neighborhoodMarker.length; i < l; i++) {
            neighborhoodMarker[i].setMap(null);
            neighborhoodMarker[i] = null;
        }
        while (neighborhoodMarker.length > 0) {
            neighborhoodMarker.pop();
        }
    }
    // remove the venueMarkers when the new neighborhood loaction is set
    function removeMarker() {
        for (var i = 0, l = markers.length; i < l; i++) {
            markers[i].setMap(null);
            markers[i] = null;
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
            }
        }
    };
    /**
     * incurred when the user click the find button
     * to search for the matched venue results
     */
    self.filterKeyword = function() {
        var searchWord = self.keyword().toLowerCase();
        var foundFlag = false;
        if (!searchWord) {
            window.alert('No place is founded, please validate your input');
            return;
        } else {
            //clear the array
            self.filteredList([]);
            //Loop through the markers array and see if the search keyword matches
            //with any venue name, if so push that object to the filteredList
            //array and place the marker on the map
            for (var place = 0, l = self.nearByPlaces().length; place < l; place++) {
                if (self.nearByPlaces()[place].name().toLowerCase().indexOf(searchWord) !== -1) {
                    self.filteredList.push(self.nearByPlaces()[place]);
                    markers[place].setMap(map);
                    markerAnimated(markers[place]);
                    foundFlag = true;
                } else {
                    if (self.nearByPlaces()[place].name().toLowerCase().indexOf(searchWord) === -1) {
                        markers[place].setMap(null);
                        self.keyword('');
                        self.fliteredMessage('Re-enter the validated name');
                    }
                    if (foundFlag) {
                        self.fliteredMessage('Fliter by the name');
                    }
                }
            }
        }
    };
    // clear the fliterList and reset the list with the original list
    self.clearFilter = function() {
        self.filteredList(self.nearByPlaces());
        self.fliteredMessage('Fliter by the name');
        place
        for (var marker = 0, l = markers.length; marker < l; marker++) {
            markers[marker].setMap(map);
        }
    };
};