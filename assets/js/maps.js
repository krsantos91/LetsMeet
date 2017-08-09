// var apiKey = 'AIzaSyCFZ1CZ31OuUgv7cCm9JBsw96kpa_zgaoE';
// var map;
// var infowindow;
// // var latitude = 33.640870;
// // var longitude = -117.845002;
// var geocoder = new google.maps.Geocoder();
// // var placeId = 'ChIJyX03Uc_Z3IARY5fGoj_0q1g';
// var place = document.getElementById('Place');

// // var geoLocation = {
// //   lat: 0,
// //   long: 0
// // };


// /***convert address to lat/long
// ****then invokes initMap for dev environment
// ****in production will return values or pass values to firebase
// ****/
// function getLatLong() {
//   let address = $('#Address').val();
//    geocoder.geocode({ 'address': address }, function(results, status) {
//       if(status == 'OK') {
//         let lat = results[0].geometry.location.lat();
//         let long = results[0].geometry.location.lng();
//         //console.log(geoLocation);

//         initMap(lat, long);
//       }else{
//         console.log('error: ' + status);
//       }
//    });
// }

// /***initialize map and business search****/
// function initMap(latitude, longitude) {
//   var pyrmont = {lat: latitude, lng: longitude};

//   map = new google.maps.Map(document.getElementById('Map'), {
//     center: pyrmont,
//     zoom: 13
//   });

//   infowindow = new google.maps.InfoWindow();
//   var service = new google.maps.places.PlacesService(map);
//   service.nearbySearch({
//     location: pyrmont,
//     radius: 1500,
//     type: ['restaurant']
//   }, displayBusinesses);
// }

// /***Added marker to map and build business panels***/
// function displayBusinesses(results, status) {
//   if (status === google.maps.places.PlacesServiceStatus.OK) {
//     for (var i = 0; i < results.length; i++) {
//       createMarker(results[i]);
//       console.log(results[i]);

//       let placeId = results[i].place_id;

//       let panel = $('<div>', {'class': 'panel panel-default'});
//       let panelHeading = $('<div>', {'class': 'panel-heading'});
//       let panelTitle = $('<h3>', {'class': 'panel-title'});
//       let panelBody = $('<div>', {'class': 'panel-body'});

//       panel.append(panelHeading, panelBody);
//       panelHeading.append(panelTitle);
//       panelTitle.append(results[i].name);
//       panelBody.append(results[i].vicinity);
//       panelBody.append('<span class="glyphicon glyphicon-menu-down pull-right"></span>');

//       /**gets additional details and expands .panel-body
//       ***unbinds getDetails() after first click then binds
//       ***collapseCard()**/
//       panelBody.on('click', function() {
//         let height = panelBody.outerHeight();
//         getDetails(placeId, panelBody);
//         panelBody.off('click');
//         panelBody.on('click', function() {
//           collapseCard(panelBody, height);
//         });
//       });

//       $('#List').append(panel);
//     }
//   }
// }

// /***creats markers to be added to map,
// ****used in displayBusinesses()***/
// function createMarker(place) {
//   var placeLoc = place.geometry.location;
//   var marker = new google.maps.Marker({
//     map: map,
//     position: place.geometry.location
//   });

//   google.maps.event.addListener(marker, 'click', function() {
//     infowindow.setContent(place.name);
//     infowindow.open(map, this);
//   });
// }

// /***gets additional business info using the placeId,
// ****appends new details to .panel-body***/
// function getDetails(placeId, el) {
//   let placeService = new google.maps.places.PlacesService(place);
//   placeService.getDetails({placeId: placeId}, function(place, status) {
//     console.log(status);
//     console.log(place);

//     let phoneNumber = place.formatted_phone_number;
//     let hours = place.opening_hours.weekday_text;
//     let website = place.website;
//     let moreInfo = place.url;

//     el.append('<br><label class="first">phone number:</label> ' + phoneNumber);
//     el.append('<br><label>website:</label> ' + website);
//     el.append('<br><label>google page:</label> ' + moreInfo);

//     for(let i = 0; i < hours.length; i++) {
//       el.append('<span class="list-item">' + hours[i] + '</span>');
//     }
//   });
// }

// /***Expands and collapses panel body after details have been appended*/
// function collapseCard(el, height) {
//   if(el.hasClass('collapsed')) {
//     el.attr('style', '').removeClass('collapsed');
//   }else{
//     el.attr('style', 'max-height:' + height + 'px').addClass('collapsed');
//   }
// }

//  function toRadians(degree){
//   return degree*Math.PI/180;
//  }

//  function toDegree(radian){
//   return radian * 180/Math.PI;
//  }

// // Input array of of arrays [latitude, longitudes]
// function midpointMultipleLatLon(listLatLong){
//   if (listLatLong.length == 1)
//   {
//     return listLatLong[0];
//   }

//   var x = 0;
//   var y = 0;
//   var z = 0;

//   listLatLong.forEach(function(latLong)
//   {
//     var latitude = toRadians(latLong[0]);
//     var longitude = toRadians(latLong[1]);

//     x += Math.cos(latitude) * Math.cos(longitude);
//     y += Math.cos(latitude) * Math.sin(longitude);
//     z += Math.sin(latitude);
//   });

//   var total = listLatLong.length;

//   x = x / total;
//   y = y / total;
//   z = z / total;

//   var centralLongitude = Math.atan2(y, x);
//   var centralSquareRoot = Math.sqrt(x * x + y * y);
//   var centralLatitude = Math.atan2(z, centralSquareRoot);

//   return [toDegree(centralLatitude), toDegree(centralLongitude)];
// }

// $(document).ready(function() {
//   $('#AddressSubmit').on('click', function(event) {
//     event.preventDefault();
//     getLatLong();
//   });
// });
/**Test git on mac pro**/
