/**
 * @license
 * Copyright 2022 Google LLC. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
// [START maps_boundaries_choropleth]
let map;
let featureLayer;
var populationData = {};
function initMap() {
      map = new google.maps.Map(document.getElementById("map"), {
      center: {lat: 40.75335534636303, lng: -73.97321568846345},
      zoom: 14,
      // In the cloud console, configure this Map ID with a style that enables the
      // "Administrative Area Level 1" feature layer.
      mapId: "4b345b7e5b9aee67",
    });
    //@ts-ignore
    featureLayer = map.getFeatureLayer(
      google.maps.FeatureType.POSTAL_CODE
    );
    
     // wire up the button
  const selectBox = document.getElementById("census-variable");

  google.maps.event.addDomListener(selectBox, "change", () => {
    loadCensusData(selectBox.options[selectBox.selectedIndex].value);
  });
  // state polygons only need to be loaded once, do them now
  
    // [START maps_boundaries_choropleth_style_function]
    
    
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
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "https://us-east1-rick-geo-enterprise.cloudfunctions.net/bq-zipcode-function?name="+variable );
    xhr.onload = function () {
      const censusData = JSON.parse(xhr.responseText);
      //censusData.shift(); // the first row contains column names
      censusData.forEach((row) => {
        const censusVariable = parseInt(row["population"]);
        const zipcode = row["zipcode"];
        populationData[zipcode]=censusVariable;
      });
      //alert(populationData["10001"]);
      featureLayer.style = (placeFeature) => {
        const population = populationData[placeFeature.feature.displayName];
        let fillColor;
    
        // Specify colors using any of the following:
        // * Named ('green')
        // * Hexadecimal ('#FF0000')
        // * RGB ('rgb(0, 0, 255)')
        // * HSL ('hsl(60, 100%, 50%)')
        if (population < 2000000) {
          fillColor = "pink";
        } else if (population < 50000) {
          fillColor = "green";
        } else if (population < 100000) {
          fillColor = "blue";
        } else if (population < 300000) {
          fillColor = "yellow";
        }else if (population < 500000) {
            fillColor = "red";
        }
        return {
          fillColor,
          fillOpacity: 0.5,
        };
      };      
    }
    xhr.onerror = function() {
        alert('Error ');
    }
  
    xhr.send();
  }
  
  window.initMap = initMap;
  // [END maps_boundaries_choropleth]