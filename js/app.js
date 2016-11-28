
var map;// declares a global map variable
var defaultAddress = {lat:  45.496814, lng: -73.58248};
var mapViewModel = function() {
	var self = this;
	//initial the google maps object
	function initMap() {
	/*
	This is google maps customized styles "Subtle Grayscale " 
	obtained from the https://snazzymaps.com/style/15/subtle-grayscale,
	attributed to the author Paulo Avila
	*/
	var styles = [
	    {
	        "featureType": "administrative",
	        "elementType": "all",
	        "stylers": [
	            {
	                "saturation": "-100"
	            }
	        ]
	    },
	    {
	        "featureType": "administrative.province",
	        "elementType": "all",
	        "stylers": [
	            {
	                "visibility": "off"
	            }
	        ]
	    },
	    {
	        "featureType": "landscape",
	        "elementType": "all",
	        "stylers": [
	            {
	                "saturation": -100
	            },
	            {
	                "lightness": 65
	            },
	            {
	                "visibility": "on"
	            }
	        ]
	    },
	    {
	        "featureType": "poi",
	        "elementType": "all",
	        "stylers": [
	            {
	                "saturation": -100
	            },
	            {
	                "lightness": "50"
	            },
	            {
	                "visibility": "simplified"
	            }
	        ]
	    },
	    {
	        "featureType": "road",
	        "elementType": "all",
	        "stylers": [
	            {
	                "saturation": "-100"
	            }
	        ]
	    },
	    {
	        "featureType": "road.highway",
	        "elementType": "all",
	        "stylers": [
	            {
	                "visibility": "simplified"
	            }
	        ]
	    },
	    {
	        "featureType": "road.arterial",
	        "elementType": "all",
	        "stylers": [
	            {
	                "lightness": "30"
	            }
	        ]
	    },
	    {
	        "featureType": "road.local",
	        "elementType": "all",
	        "stylers": [
	            {
	                "lightness": "40"
	            }
	        ]
	    },
	    {
	        "featureType": "transit",
	        "elementType": "all",
	        "stylers": [
	            {
	                "saturation": -100
	            },
	            {
	                "visibility": "simplified"
	            }
	        ]
	    },
	    {
	        "featureType": "water",
	        "elementType": "geometry",
	        "stylers": [
	            {
	                "hue": "#ffff00"
	            },
	            {
	                "lightness": -25
	            },
	            {
	                "saturation": -97
	            }
	        ]
	    },
	    {
	        "featureType": "water",
	        "elementType": "labels",
	        "stylers": [
	            {
	                "lightness": -25
	            },
	            {
	                "saturation": -100
	            }
	        ]
	    }
	    ];
	    map = new google.maps.Map(document.getElementById("map"),{
	      center: defaultAddress,
	      zoom: 14,
	      animation: google.maps.Animation.DROP,
	      mapTypeControl: false,
	      disableDefaultUI: true,
	      styles: styles
	    });
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
