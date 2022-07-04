/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
// [START maps_boundaries_choropleth]
let map;
let featureLayer;
var populationData = {};
var ridesData={};
let infoWindow;
var http_function_url="https://us-east1-rick-gmp-dds.cloudfunctions.net/bq-zipcode-function";
const MAP_ID="YOUR_MAP_ID";
const styleDefault = {
    strokeColor: "#810FCB",
    strokeOpacity: 1.0,
    strokeWeight: 2.0,
    fillColor: "orange",
    fillOpacity: 0.5, // Polygons must be visible to receive click events.
  };
  // Style for the clicked Administrative Area Level 2 polygon.
  //@ts-ignore
const styleClicked = {
    ...styleDefault,
    fillColor: "red",
    fillOpacity: 0.5,
  };
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
      center: {lat: 40.75335534636303, lng: -73.97321568846345},
      zoom: 11,
      // In the cloud console, configure this Map ID with a style that enables the
      // "Administrative Area Level 1" feature layer.
      mapId: MAP_ID,
    });
    //@ts-ignore
  featureLayer = map.getFeatureLayer("POSTAL_CODE");
  
  featureLayer.addListener("click", handlePlaceClick);
  infoWindow = new google.maps.InfoWindow({});
     // wire up the button
  const selectBox = document.getElementById("census-variable");
  
  google.maps.event.addDomListener(selectBox, "change", () => {
    loadCensusData(selectBox.options[selectBox.selectedIndex].value);
  });
  // state polygons only need to be loaded once, do them now
  
    // [START maps_boundaries_choropleth_style_function]
    
  applyStyleToSelected();
    // [END maps_boundaries_choropleth_style_function]
  }
  

  //start with get data function
  /**
 * Loads the census data from a simulated API call to the US Census API.
 *
 * @param {string} variable
 */
function loadCensusData(variable) {
    // load the requested variable from the census API (using local copies)
    //alert("https://us-east1-rick-geo-enterprise.cloudfunctions.net/bq-zipcode-function?name="+variable)
    populationData={};
    ridesData={};
    //featureLayer.style.clear;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", http_function_url+"?name="+variable );
    xhr.onload = function () {
      const censusData = JSON.parse(xhr.responseText);
      //censusData.shift(); // the first row contains column names
      if(variable=='population') {  
      censusData.forEach((row) => {
        const censusVariable = parseInt(row["population"]);
        const zipcode = row["zipcode"];
        populationData[zipcode]=censusVariable;
      });
     }else if(variable=='citibike'){
        censusData.forEach((row) => {
            const bikeVariable = parseInt(row["rides"]);
            const zipcode = row["zipcode"];
            ridesData[zipcode]=bikeVariable;
          });
     }
      //alert(populationData["10001"]);
      let fillColor;
      featureLayer.style = (placeFeature) => {
       if(variable=='population') {
         const population = populationData[placeFeature.feature.displayName];
        // Specify colors using any of the following:
        // * Named ('green')
        // * Hexadecimal ('#FF0000')
        // * RGB ('rgb(0, 0, 255)')
        // * HSL ('hsl(60, 100%, 50%)')
         if (population < 50000) {
          fillColor = "pink";
         } else if (population < 100000) {
           fillColor = "green";
         } else if (population < 200000) {
          fillColor = "blue";
         } else if (population < 300000) {
          fillColor = "yellow";
         }else if (population < 500000) {
            fillColor = "red";
         }else if (population < 1000000) {
            fillColor = "black";
         }
        return {
          strokeColor: "#810FCB",
          strokeOpacity: 1.0,
          strokeWeight: 1.0,
          fillColor,
          fillOpacity: 0.5,
        };
        }
        else if(variable=='citibike') {
         let fillColor;
         const rides = ridesData[placeFeature.feature.displayName];
         if (rides < 5000) {
            fillColor = "pink";
           } else if (rides < 10000) {
             fillColor = "green";
           } else if (rides < 50000) {
            fillColor = "blue";
           } else if (rides < 100000) {
            fillColor = "yellow";
           }else if (rides < 500000) {
              fillColor = "red";
           }
          return {
            strokeColor: "#810FCB",
            strokeOpacity: 1.0,
            strokeWeight: 1.0,
            fillColor,
            fillOpacity: 0.5,
          };
        }
      };      
    }
    xhr.onerror = function() {
        alert('Error ');
    }
  
    xhr.send();
  }
  
  function handlePlaceClick(event) {
    let feature = event.features[0];
  
    console.log(event);
    if (!feature.placeId) return;
  
    // Apply the style to the feature layer.
    applyStyleToSelected(feature.placeId);
  
    // Add the info window.
    let content =
      '<span style="font-size:small">Display name: ' +
      feature.displayName +
      "<br/> Place ID: " +
      feature.placeId +
      "<br/> Feature type: " +
      feature.featureType +
      "</span>";
  
    updateInfoWindow(content, event.latLng);
  }
  
  // Helper function to create an info window.
function updateInfoWindow(content, center) {
    infoWindow.setContent(content);
    infoWindow.setPosition(center);
    infoWindow.open({
      map,
      shouldFocus: false,
    });
  }

  function applyStyleToSelected(placeid) {
    // Apply styles to the feature layer.
    featureLayer.style = (options) => {
      // Style fill and stroke for a polygon.
      if (placeid && options.feature.placeId == placeid) {
        return styleClicked;
      }
      // Style only the stroke for the entire feature type.
      return styleDefault;
    };
  }

  // Stroke and fill with minimum opacity value.
//@ts-ignore
    
  window.initMap = initMap;
  // [END maps_boundaries_choropleth]