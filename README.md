## Neighborhood-Map

This is a single page application featuring a map of your neighborhood or a neighborhood you would like to visit. Knockoutjs is usded to automatically bind the data to the view layer(HTML page). Google Maps Api and FourSquare Api are used as third party library and data source. The webpage will change layout due to mobile device or small width window. 

### Getting started
##### Live demo on Github Page: [Neighborhood-Map](https://joeyzhang1989.github.io/Neighborhood-Map/). 
##### Locally

**1.** Clone this repo:

```
$ git clone https://github.com/joeyzhang1989/Neighborhood-Map.git
````

**2.** Serve the application:


###### Python 2

```bash
$ python -m SimpleHTTPServer 

```
###### Python 3 

```bash
$ python3 -m http.server.   
```
You can use the Python SimpleHTTPServer to serve this webpage game on your local machine.

**3.** Open the application:

```bash
$ open "http://localhost:8000"
```

### Code example

####Part 1: Knockout.js 

```JS
// Model part for the marker
var venueMarkers = function(item) {
};

// VM part for the map render
var mapViewModel = function() {
}

```

####Part 2: Customized the google map style:[Neighborhood-Map](https://snazzymaps.com/style/15/subtle-grayscale,
        attributed to the author Paulo Avila)

```JS
   var styles = [{
            "featureType": "administrative",
            "elementType": "all",
            "stylers": [{
                "saturation": "-100"
            }]
        },
```

##License
This project is a public domain work, dedicated using
[MIT](https://opensource.org/licenses/MIT). Feel free to do
whatever you want with it.

