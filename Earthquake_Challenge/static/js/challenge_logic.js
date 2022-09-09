// Add console.log to check to see if our code is working.
console.log("working");

// We create the tile layers that will be the background of our map:
let streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
});

let satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
});

// Creating the map object with center, zoom level and default layer.
let map = L.map('mapid', {
	center: [40.7, -94.5],
	zoom: 3,
	layers: [streets]
});

// Create a base layer that holds all the maps:
let baseMaps = {
  "Streets": streets,
  "Satellite": satelliteStreets
};

// Adding layers for earthquake and tectonic plate data - & majorQuakes.
let allEarthquakes = new L.LayerGroup();
let tectonicPlates = new L.LayerGroup();
let majorQuakes = new L.LayerGroup();

// 2. Add a reference to the tectonic plates group to the overlays object.
let overlays = {
  "Earthquakes": allEarthquakes,
  "Tectonic Plates": tectonicPlates,
  "Major Earthquakes": majorQuakes
};

// Adding a control to the map that allows user to change which layers are visible.
L.control.layers(baseMaps, overlays).addTo(map);

// Retrieving earthquake GeoJSON data:
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {

  // Function to return style data for each quakes by mag. 
  // (separate functions to calculate the color and radius)
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // Function to determine color of the marker based on the mag.
  function getColor(magnitude) {
    if (magnitude > 5) {
      return "#ea2c2c";
    }
    if (magnitude > 4) {
      return "#ea822c";
    }
    if (magnitude > 3) {
      return "#ee9c00";
    }
    if (magnitude > 2) {
      return "#eecc00";
    }
    if (magnitude > 1) {
      return "#d4ee00";
    }
    return "#98ee00";
  }

  // Function to determine the radius of the hquake marker based on its mag
  // (Earthquakes with a mag of 0 were being plotted with the wrong radius - this adjusts)
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }
    return magnitude * 4;
  }

  // Creating a GeoJSON layer with the retrieved data
  L.geoJson(data, {
    	// Truning each feature into a circleMarker on the map.
    	pointToLayer: function(feature, latlng) {
      		console.log(data);
      		return L.circleMarker(latlng);
        },
    // Setting the style for each circleMarker...
    style: styleInfo,
    // Creating a popup for each circleMarker to display the mag+loc of the quake after the marker has been created and styled.
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }
  }).addTo(allEarthquakes);

  // Then we add the earthquake layer to our map.
  allEarthquakes.addTo(map);
  tectonicPlates.addTo(map);


//**************************** MAJOR QUAKES ****************************
// Adding major earthquakes geoJSON... (mag 4.5 or more)
let majorQuakes = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";

d3.json(majorQuakes).then(function(data) {
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.properties.mag),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

// Picking three colors for viewing... (colored by)
  function getColor(magnitude) {
    if (magnitude > 5) {
      return "#CC0000";
    }
    if (magnitude > 4) {
      return "#00CC00";
    }
    return "#0000CC";
  }

  //  Using a function to determine radius by magnitude
  function getRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }
    return magnitude * 4;
  }

  // Creating a GeoJSON layer with the retrieved data that adds a circle to the map 
  // sets the style of the circle, and displays the magnitude and location of the earthquake
  // after the marker has been created and styled.
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
    return L.circleMarker(latlng);
    },
    style: styleInfo,
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
    }
  }).addTo(majorQuakes);
  });
  // Adding the major earthquakes layer to the map.
  majorQuakes.addTo(map);
});

// Creating a legend control object.
let legend = L.control({
  position: "bottomright"
});

// Adding legend details
legend.onAdd = function() {
  let div = L.DomUtil.create("div", "info legend");

  const magnitudes = [0, 1, 2, 3, 4, 5];
  const colors = [
    "#98ee00",
    "#d4ee00",
    "#eecc00",
    "#ee9c00",
    "#ea822c",
    "#ea2c2c"
  ];

// Looping through our intervals to generate a label with a colored square for each interval.
  for (var i = 0; i < magnitudes.length; i++) {
    console.log(colors[i]);
    div.innerHTML +=
      "<i style='background: " + colors[i] + "'></i> " +
      magnitudes[i] + (magnitudes[i + 1] ? "&ndash;" + magnitudes[i + 1] + "<br>" : "+");
    }
    return div;
};

// Finally, we our legend to the map.
legend.addTo(map);

//****************************TECTONIC PLATE LAYER****************************

// Adding our Tectonic Plate geoJSON data from fraxen GH user...
let tectonicdata = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
// Adding local copy :)
//let tectonicData = "https://raw.githubusercontent.com/miwermi/mapping-earthquakes/main/tectonicPlates.json";

d3.json(tectonicdata).then(function(data) {
  L.geoJson(data,
    {color: "#DD2288",
    weight: 2
    }).addTo(tectonicPlates);

});


    