var sitekey;
var geocoder = new google.maps.Geocoder();
var limit = 0;
var place = document.getElementById('Place');


// var config = {
//   apiKey: "AIzaSyC6B82IlusPIV2rMJA79A9z6uAvSr-SVEE",
//   authDomain: "friendlychat-56d31.firebaseapp.com",
//   databaseURL: "https://friendlychat-56d31.firebaseio.com",
//   projectId: "friendlychat-56d31",
//   storageBucket: "friendlychat-56d31.appspot.com",
//   messagingSenderId: "379256444845"
// };
var config = {
  apiKey: "AIzaSyDlBcC5OWK63YIjKYTI1PfCy_Zfstm9Xy8",
  authDomain: "andres-meetup.firebaseapp.com",
  databaseURL: "https://andres-meetup.firebaseio.com",
  projectId: "andres-meetup",
  storageBucket: "andres-meetup.appspot.com",
  messagingSenderId: "956032318275"
};
firebase.initializeApp(config);


var database = firebase.database();


var chatroom = {
  initial_name: "",
  initial_message: "",
  current_name: "",
  current_messge: "",
  username: "",
  chatname: "",
  ignore_chat_username: false,

  UpdateChat: function() {
    database.ref(sitekey + '/chat').on("value", function(snapshot) {
      if (snapshot.child("LatestName").exists() && snapshot.child("LatestMessage").exists()) {
        $("#ChatTitle").text(' ' + snapshot.val().Chatname);
        $('#sitekey').text('SITEKEY(Use to share this meet up): ' + sitekey);
        chatroom.chatname = snapshot.val().Chatname;
        chatroom.current_message = snapshot.val().LatestMessage;
        chatroom.current_name = snapshot.val().LatestName;
      }
      if (chatroom.current_message != "") {
        $("#ChatBox").append('<h4>' + chatroom.current_name.toUpperCase() + ': ' + chatroom.current_message + '</h4>');
      }
      chatroom.scrollSmoothToBottom("ChatBox");
    }, function(errorObject) {
      console.log("The read failed: " + errorObject.code);
    });
    database.ref(sitekey + '/chatconnections').on("child_added", function(snapshot) {
      $("#UserList").append('<div class="row" id="' + snapshot.val().userName + '"><span class="glyphicon glyphicon-ok" style="font-size:12px;color:green"></span> ' + snapshot.val().userName + '</div>');
    }, function(errorObject) {
      console.log("The read failed: " + errorObject.code);
    });
    database.ref(sitekey + '/chatconnections').on("child_removed", function(snapshot) {
      $("#" + snapshot.val().userName).remove();
      $("#" + snapshot.val().userName +'_user').remove();      
    });
  },

  SubmitMessage: function() {
    event.preventDefault();
    chatroom.current_message = $("#Message").val().trim();
    $("#Message").val("");
    $("#Message").focus();
    database.ref(sitekey + '/chat').update({
      LatestName: chatroom.username,
      LatestMessage: chatroom.current_message,
      Chatname: chatroom.chatname
    });
  },

  scrollSmoothToBottom: function(id) {
    var div = document.getElementById(id);
    $('#' + id).animate({
      scrollTop: div.scrollHeight - div.clientHeight
    }, 500);
  }
}

function showModal(msg) {
	$("#modal-msg").text(msg);
	$("#main-error").modal({
		keyboard: false
	});
}
function showModal(msg, title) {
	$("#modal-title").text(title);
	$("#modal-msg").text(msg);
	$("#main-error").modal({
		keyboard: false
	});
}

$(document).ready(function() {

  // js for bootstrap tabs
  $('#myTabs a').click(function(e) {
    e.preventDefault()
    $(this).tab('show')
  });

  $("#SubmitMessage").click(chatroom.SubmitMessage);

  $("#SubmitNewMeetUp").on("click", function(event) {
    event.preventDefault();
    var name = $("#NewMeet").val().trim();
    var numberOfUsers = $('#NumberOfUsers').val();
    limit = parseInt(numberOfUsers);
    sitekey = keyGen();
    database.ref(sitekey + '/chat').set({
      NumberOfUsers: numberOfUsers,
      LatestName: "",
      LatestMessage: "",
      Chatname: name
    });

    createSecondForm();

    $('#SubmitLocation').click(function(e) {
      e.preventDefault();
      locationFormHandler();
      // selectAdmin();
    });
  });



  $("#SubmitExistingMeetUp").on("click", function(event) {
    //edge empty input
    event.preventDefault();
    var enteredSiteKey = $('#ExistingMeetUp').val().trim();
    sitekey = $("#ExistingMeetUp").val().trim();
    database.ref(sitekey).on("value", function(snapshot) {
      if (snapshot.exists() && enteredSiteKey !== '') {

        createSecondForm();

        $('#SubmitLocation').click(function(e) {
          e.preventDefault();
          locationFormHandler();
          // selectAdmin();
        });

      } else {
        showModal("Sitekey doesnt exist");
        $('#ExistingMeetUp').val('').focus();

      }
    });

  });

}); // doc.ready

function keyGen() {

  var length = 10;
  var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  var key = '';

  for (let i = 0; i < length; i++) {

    key += chars[Math.floor(Math.random() * chars.length)];

  }

  return key;

}

function createSecondForm() {

  $('#StartUp').empty().append(
    '<div class="row">' +
    '<div class="col-md-3"></div>' +
    '<div class="col-md-6 jumbotron">' +
    '<h2>User Info</h2>' +
    '<div class="form-group">' +
    '<label>Name</label>' +
    '<input class="form-control" id="UserName" type="text" placeholder="Please enter a name" style="margin-bottom:3px">' +
    '</div>' +
    '<div class="form-group">' +
    '<label>Location</label>' +
    '<input type="text" name="Location" id="Location" class="form-control" placeholder="Your Location">' +
    '</div>' +
    '<button class="btn btn-success" id="SubmitLocation" type="submit">Submit</button>' +
    '</div>' +
    '<div class="col-md-3"></div>' +
    '</div>'
  );
}

function locationFormHandler() {
  var name = "";
  var pname = $('#UserName').val().trim();
  // Regular expressions to get rid of < and > for potential SQL injection
  var re = new RegExp('[^<>]+',"g");
  var arrayStrings = pname.match(re);
  arrayStrings.forEach(function(string){
    name += string;
  })

  var location = $('#Location').val().trim();

  chatroom.username = name;

  geocoder.geocode({
    'address': location
  }, function(results, status) {
    if (status == 'OK') {
      let lat = results[0].geometry.location.lat();
      let long = results[0].geometry.location.lng();
      let coordinates = [lat, long];

      var con = database.ref(sitekey + '/connections').push({
        userName: name,
        Location: coordinates
      });

      con.onDisconnect().remove();

      var con2 = database.ref(sitekey + '/chatconnections').push({
        userName: name,
      });

      con2.onDisconnect().remove();

      if (name != '' & location != '') {
        $('#StartUp').remove();
        $('.container').removeClass('hide');
        $('.jumbotron').removeClass('hide');
        chatroom.UpdateChat();
        // selectAdmin();
        createMap();
      }

    } else {
      console.log('error: ' + status);
      $('#Location').focus();
      alert('bad address');
    }
  });
}

 function toRadians(degree){
  return degree*Math.PI/180;
 }

 function toDegree(radian){
  return radian * 180/Math.PI;
 }

// Input array of of arrays [latitude, longitudes]
function midpointMultipleLatLon(listLatLong){
  if (listLatLong.length == 1)
  {
    return listLatLong[0];
  }

  var x = 0;
  var y = 0;
  var z = 0;

  listLatLong.forEach(function(latLong)
  {
    var latitude = toRadians(latLong[0]);
    var longitude = toRadians(latLong[1]);

    x += Math.cos(latitude) * Math.cos(longitude);
    y += Math.cos(latitude) * Math.sin(longitude);
    z += Math.sin(latitude);
  });

  var total = listLatLong.length;

  x = x / total;
  y = y / total;
  z = z / total;

  var centralLongitude = Math.atan2(y, x);
  var centralSquareRoot = Math.sqrt(x * x + y * y);
  var centralLatitude = Math.atan2(z, centralSquareRoot);

  return [toDegree(centralLatitude), toDegree(centralLongitude)];
}

function createMap () {
	var users;
	database.ref(sitekey + '/chat').on('value', function(snapshot) {
		users = parseInt(snapshot.val().NumberOfUsers);
	});

    database.ref(sitekey + '/connections').on("value", function(snapshot) {
      var difference = users - snapshot.numChildren();
      if (difference > 1){
        removeMap();
        $("#waiting").text('Waiting for ' +  (users - snapshot.numChildren()) + ' more people')
      }
      else if(difference === 1){
        removeMap();
        $("#waiting").text('Waiting for ' +  (users - snapshot.numChildren()) + ' more person')
      }
      // var active_users = snapshot.numChildren();
      console.log(snapshot.numChildren() === users, users);
	      if (snapshot.numChildren() === users) {

				var locations = [];
				database.ref(sitekey + "/connections").once("value").then(function(snapshot){
					snapshot.forEach(function(childSnapshot){
						var location = [childSnapshot.val().Location[0],childSnapshot.val().Location[1]];
						locations.push(location);
					});
					var coordinates = midpointMultipleLatLon(locations);
					var lat = coordinates[0];
					var lon = coordinates[1];
					initMap(lat, lon);
				});

	      }

    });
}

function removeMap(){
  $("#Lobby").remove();
  $("#Map").remove();
  $("#List").remove();
  $("#Place").remove();
  $("#Search").append(
          '<div class="row" id="Lobby" style="text-align:center;padding-top:10px">'+
              '<div class="col-xs-6">' + 
                '<div id="UserJoined"></div>'  +             
              '</div>' + 
              '<div class="col-xs-6" style="vertical-align: center">' +
                '<div>' +
                  '<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i><span class="sr-only">Loading...</span>' +
                  '<br>' +
                  '<br>' +
                  '<span id="waiting"></span>' +
                '</div>'  +            
              '</div>' +             
            '</div>'
    );
  database.ref(sitekey + "/connections").once("value").then(function(snapshot){
    snapshot.forEach(function(childSnapshot){
      console.log(childSnapshot.val().userName);
      $("#UserJoined").append('<div class="bg-success" id="' + childSnapshot.val().userName + '_user" style="border-radius:5px;height:35px;vertical-align:center;width:100%;text-align:center"><h3>'+ childSnapshot.val().userName + ' has joined</h3></div>');
    })
  })
}

/***initialize map and business search****/
function initMap(latitude, longitude) {
  $("#HomeTab").addClass("active");
  $("#ChatTab").removeClass("active");
  $("#Search").addClass("active in");
  $("#Chat").removeClass("active in");
  var pyrmont = {lat: latitude, lng: longitude};
  $('#Lobby').remove();
  $('#Search').append(

  	'<div id="Map"></div>' +
  	'<div id="List"></div>' +
  	'<div id="Place"></div>'

  );

  map = new google.maps.Map(document.getElementById('Map'), {
    center: pyrmont,
    zoom: 13
  });

  // userLocation(latitude, longitude);


  infowindow = new google.maps.InfoWindow();
  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch({
    location: pyrmont,
    radius: 1500,
    type: ['restaurant']
  }, displayBusinesses);
}

/***Added marker to map and build business panels***/
function displayBusinesses(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
      console.log(results[i]);

      let placeId = results[i].place_id;

      let panel = $('<div>', {'class': 'panel panel-default'});
      let panelHeading = $('<div>', {'class': 'panel-heading'});
      let panelTitle = $('<h3>', {'class': 'panel-title'});
      let panelBody = $('<div>', {'class': 'panel-body'});

      panel.append(panelHeading, panelBody);
      panelHeading.append(panelTitle);
      panelTitle.append(results[i].name);
      panelBody.append(results[i].vicinity);
      panelBody.append('<span class="glyphicon glyphicon-menu-down pull-right"></span>');

      /**gets additional details and expands .panel-body
      ***unbinds getDetails() after first click then binds
      ***collapseCard()**/
      panelBody.on('click', function() {
        let height = panelBody.outerHeight();
        getDetails(placeId, panelBody);
        panelBody.off('click');
        panelBody.on('click', function() {
          collapseCard(panelBody, height);
        });
      });

      $('#List').append(panel);
    }
  }
}

/***creats markers to be added to map,
****used in displayBusinesses()***/
function createMarker(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}

function userLocation(latitude, longitude) {
  let title = 'User Name';
  let icon = 'assets/images/blue-marker.png';
  let position = { lat: latitude, lng: longitude };
  let marker = new google.maps.Marker({
    position: position,
    map: map,
    title: title,
    icon: icon
  });

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(title);
    infowindow.open(map, this);
  })
}

/***gets additional business info using the placeId,
****appends new details to .panel-body***/
function getDetails(placeId, el) { 
  let placeService = new google.maps.places.PlacesService(place);
  placeService.getDetails({placeId: placeId}, function(place, status) {
    console.log(status);
    console.log(place);

    let phoneNumber = place.formatted_phone_number;
    let hours = place.opening_hours.weekday_text;
    let website = place.website;
    let moreInfo = place.url;

    el.append('<br><label class="first">phone number:</label> ' + phoneNumber);
    el.append('<br><label>website:</label> ' + website);
    el.append('<br><label>google page:</label> ' + moreInfo);

    for(let i = 0; i < hours.length; i++) {
      el.append('<span class="list-item">' + hours[i] + '</span>');
    }
  });
}

/***Expands and collapses panel body after details have been appended*/
function collapseCard(el, height) {
  if(el.hasClass('collapsed')) {
    el.attr('style', '').removeClass('collapsed');
  }else{
    el.attr('style', 'max-height:' + height + 'px').addClass('collapsed');
  }
}