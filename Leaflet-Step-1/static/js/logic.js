
/********************************************************/
// Store our API endpoint as queryUrl
/********************************************************/
const queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


/********************************************************/
// Initialize variables:
/********************************************************/
let magMarkers = [];


/********************************************************/
// Perform a GET request to the query URL
/********************************************************/
d3.json(queryUrl, function(data) {
    // console.log(data.features);
    // Using the features array sent back in the API data, create a GeoJSON layer and add it to the map
    createFeatures(data.features);
});





/********************************************************/
// Function to update marker sizes:
/********************************************************/
function markerSize(magnitude) {
    return magnitude * 25000;
}




/********************************************************/
// Function to assign colors depending on magnitude:
/********************************************************/
function chooseColor(magnitude) {
    let magnitudeFloat = parseFloat(magnitude);
    switch (true) {
        case magnitudeFloat >= 0 && magnitudeFloat < 1: return 'GreenYellow';
        case magnitudeFloat >= 1 && magnitudeFloat < 2: return 'Yellow';
        case magnitudeFloat >= 2 && magnitudeFloat < 3: return 'Gold';
        case magnitudeFloat >= 3 && magnitudeFloat < 4: return 'Orange';
        case magnitudeFloat >= 4 && magnitudeFloat < 5: return 'OrangeRed';
        case magnitudeFloat >= 5: return 'Red'; 
        default: return 'Black';
    }
}



/********************************************************/
// Function: To parse the feature data and create the map
/********************************************************/
function createFeatures(earthquakeData) {

    /********************************************************/
    // definition of a call back function being assigned to a variable:
    // To create the markers here:
    /********************************************************/
    let processFeature = (feature, layer) => {
        //for every feature, we are going to bind the layer:
        //new Date() is a javascript time object
        layer.bindPopup(`<h3>${feature.properties.title}</h3><hr>
                         <p>Time: ${new Date(feature.properties.time)}</p>`);

        let longitude = feature.geometry.coordinates[1];
        let latitude = feature.geometry.coordinates[0];
        let coords = [longitude, latitude];

        magMarkers.push(
            L.circle(coords, {
                stroke: true,
                color: 'grey',
                weight: 1,
                fillOpacity: 0.8,
                fillColor: chooseColor(feature.properties.mag),
                radius: markerSize(feature.properties.mag)
            })
        );


    };

    

    /********************************************************/
    //to parse the data with geoJSON() function (Leaflet has a function that can consume JSON data):
    //the variable 'earthquakes' becomes the marker layer
    /********************************************************/
    let earthquakes = L.geoJSON(earthquakeData, {
        //onEachFeature is going to map to a call back function (processFeature) that is created above:
        //to process the markers or each feature:
        onEachFeature: processFeature
    }); 

    
    /********************************************************/
    // call the createMap function and pass the marker layer into it:
    // this way we can add it as an overlay map for our map
    /********************************************************/
    createMap(earthquakes);

    
}



/********************************************************/
// Function: To create the map
/********************************************************/
function createMap(earthquakes) {
    
    // Define lightmap and darkmap layers
    var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.light",
            accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
            attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
            maxZoom: 18,
            id: "mapbox.dark",
            accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
            "Light Map": lightmap,
            "Dark Map": darkmap
    };

    // Create a layer of magnitude markers:
    let magnitudeLayer = L.layerGroup(magMarkers);

    //create a layer of markers:
    let overlayMaps = {
            Earthquakes: earthquakes,
            Magnitude: magnitudeLayer
    };

    

    // Create a new map
    var myMap = L.map("map", {
            center: [37.09, -97.71],
            zoom: 5,
            layers: [lightmap, magnitudeLayer]
    });

    
    // Create a layer control containing our baseMaps near top right corner 
    // to allow users to switch between base maps and toggle on/off the earthquake layer
    // Be sure to add an overlay Layer containing the earthquake GeoJSON
    /********************************************************/
    L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
    }).addTo(myMap);


    // Create a legend for the magnitudes:
    /********************************************************/
    let magLegend = L.control({ position: "bottomright"});

    magLegend.onAdd = function() {
        let div = L.DomUtil.create('div', 'info legend');
        let legendItemLabels = [0, 1, 2, 3, 4, 5];
        let colors = ['GreenYellow', 'Yellow', 'Gold',  'Orange', 'OrangeRed', 'Red'];
        
        for (var i = 0; i < legendItemLabels.length; i++) {
            div.innerHTML += 
                '<i style="background:' + colors[i] + '"></i>' +
                 legendItemLabels[i] + (legendItemLabels[i+1] ? '&ndash;' + legendItemLabels[i + 1] + '<br>' : '+');
        }
        
        
        return div; 
    };


    magLegend.addTo(myMap);


}

