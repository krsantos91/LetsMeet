var sitekey;
var geocoder = new google.maps.Geocoder();
var limit = 0;
var place = document.getElementById('Place');
var active_suggestion = false;

// Initialize Firebase
var config = {
  apiKey: "AIzaSyBswMwyD7IWpaSv2NuQD5uscHK4YeEjM8s",
  authDomain: "ks-firebase-app1.firebaseapp.com",
  databaseURL: "https://ks-firebase-app1.firebaseio.com",
  projectId: "ks-firebase-app1",
  storageBucket: "ks-firebase-app1.appspot.com",
  messagingSenderId: "1024949813364"
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

  UpdateChat: function() {
    database.ref(sitekey + '/chat').on("value", function(snapshot) {
      if (snapshot.child("LatestName").exists() && snapshot.child("LatestMessage").exists()) {
        $("#ChatTitle").text(' ' + snapshot.val().Chatname);
        $('#sitekey').html('SITEKEY (Use to share this meet up): <span>' + sitekey + '</span>');
        chatroom.chatname = snapshot.val().Chatname;
        chatroom.current_message = snapshot.val().LatestMessage;
        chatroom.current_name = snapshot.val().LatestName;
        limit = parseInt(snapshot.val().NumberOfUsers);
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
      var re = new RegExp('[^<>]+',"g");
      var message = '';
      var pmessage = $("#Message").val().trim();
      var arrayStrings = pmessage.match(re);
      arrayStrings.forEach(function(string){
        message += string;
      })
    chatroom.current_message = message;
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
    console.log(numberOfUsers)
    if ( name !== '' && numberOfUsers !== '') {
      database.ref(sitekey + '/chat').set({
        NumberOfUsers: numberOfUsers,
        LatestName: "",
        LatestMessage: "",
        Chatname: name
      });

      createSecondForm();
    }

    $('#SubmitLocation').click(function(e) {
      e.preventDefault();
      locationFormHandler();
    });
  });

  $("#SubmitExistingMeetUp").on("click", function(event) {
    //edge empty input
    event.preventDefault();
    var enteredSiteKey = $('#ExistingMeetUp').val().trim();
    sitekey = $("#ExistingMeetUp").val().trim();
    database.ref(sitekey).once("value").then(function(snapshot){
      if (snapshot.exists() && enteredSiteKey !== '') {
        console.log(parseInt(snapshot.val().chat.NumberOfUsers),Object.keys(snapshot.val().connections).length);
        if(parseInt(snapshot.val().chat.NumberOfUsers) === Object.keys(snapshot.val().connections).length){
          showModal("This meet is currently full.")
        } else{
          createSecondForm();
          $('#SubmitLocation').click(function(e) {
            e.preventDefault();
            locationFormHandler();
          });
        };
      } else {
        showModal("Sitekey doesnt exist");
        $('#ExistingMeetUp').val('').focus();
      };
    });
  });

  $(document).on("click",'#Place', function(event){
    $("#MeetLocation").val($(event.currentTarget).attr("data-name"));
    $("#MeetAddress").val($(event.currentTarget).attr("data-address"));
    $("#MeetDate").focus();


  });

  $(document).on("click","#SubmitSuggestion", function(){
    var current_Location = $("#MeetLocation").val().trim();
    var current_Address = $("#MeetAddress").val().trim();
    var current_Date = $("#MeetDate").val();
    var current_Time = $("#MeetTime").val();

    if (current_Location === "" || current_Address === "" || current_Date === "" || current_Time === ""){
      showModal("All input fields must be completed")
    } 
    else {
      if (active_suggestion === false){
        database.ref(sitekey + '/suggestion').update({
          Name: chatroom.username,
          Location: current_Location,
          Address: current_Address,
          myDate: current_Date,
          Time: current_Time,
          Action: "new" 
        });
      } 
      else {
        showModal("Please respond to the current suggestion first");
      };
    };
  });

  $(document).on("click", "#SuggestionNo", function(){    
    database.ref(sitekey + '/suggestion').update({
      Name: "",
      Location: "",
      Address: "",
      myDate: "",
      Time: "" ,
      Action: "reject"   
    });
    database.ref(sitekey + '/acceptmeetup').set("");
  });

  $(document).on("click","#SuggestionYes", function(){
    $("#SuggestionYes").remove();
    $("#SuggestionNo").text("Cancel");
    database.ref(sitekey + '/acceptmeetup').push(true);
  })

}); // doc.ready

function suggestion(){
  database.ref(sitekey+ '/suggestion').set({
    Name : "",
    Location: "",
    Address: "",
    myDate: "",
    Time: "",
    Action: "initial"  
  });
  database.ref(sitekey+ '/acceptmeetup').set("");
  database.ref(sitekey + '/suggestion').on("value", function(snapshot){
    if (snapshot.val().Action === "initial"){
      active_suggestion = false;
    }
    else if (snapshot.val().Action === "reject"){
      active_suggestion = false;      
      $("#Meetup").empty();
      $("#HomeTab").addClass("active");
      $("#ChatTab").removeClass("active");
      $("#MeetupTab").removeClass("active");  
      $("#Search").addClass("active in");
      $("#Chat").removeClass("active in");
      $("#Meetup").removeClass("active in");      
      showModal("The current meetup was declined");
    }
    else if (snapshot.val().Action === "new"){
      active_suggestion = true;
      $("#HomeTab").removeClass("active");
      $("#ChatTab").removeClass("active");
      $("#MeetupTab").addClass("active");  
      $("#Search").removeClass("active in");
      $("#Chat").removeClass("active in");
      $("#Meetup").addClass("active in"); 
      let container = $('<div>', {'class':'jumbotron text-center'});
      let header = $('<h3>');
      header.text(snapshot.val().Name + ' suggested:');
      let print_location = $('<h5>');
      let print_address = $('<h5>');
      let print_date = $('<h5>');
      let print_time = $('<h5>');
      let print_accepted = $('<h6>');
      print_location.text('Location: ' + snapshot.val().Location);
      print_address.text('Addresss: ' + snapshot.val().Address);
      print_date.text('Date: ' + snapshot.val().myDate);
      print_time.text('Time: ' + snapshot.val().Time);
      print_accepted.html('<span id="NumberAccepted">0</span> /' + limit +' have accepted this meetup')
      container.append(header).append(print_location).append(print_address).append(print_date).append(print_time).append(print_accepted);
      $("#Meetup").append(container);
      $("#Meetup").append('<button id="SuggestionYes" class="btn btn-success">Accept</button>');
      $("#Meetup").append('<button id="SuggestionNo" class="btn btn-danger">Decline</button>');
    };   
  });
  database.ref(sitekey + '/acceptmeetup').on("value", function(snapshot){
    $("#NumberAccepted").text(snapshot.numChildren());
    if (limit !== 0 && limit === snapshot.numChildren()){
      active_suggestion = false;
      showModal("Meetup Finalized!", "Success");
      $("#Meetup").empty();
      $("#HomeTab").addClass("active");
      $("#ChatTab").removeClass("active");
      $("#MeetupTab").removeClass("active");  
      $("#Search").addClass("active in");
      $("#Chat").removeClass("active in");
      $("#Meetup").removeClass("active in"); 
      $("#Suggestion").remove();
      $("#List").remove(); 
      database.ref(sitekey + '/suggestion').once("value").then(function(snap){
        let container = $('<div>', {'class':'jumbotron text-center','id':'Finalized'});
        let header = $('<h4>');
        header.text('Your Meeting is set for:');
        let print_location = $('<h3>');
        let print_address = $('<h3>');
        let print_date = $('<h3>');
        let print_time = $('<h3>');
        print_location.text('Location: ' + snap.val().Location);
        print_address.text('Addresss: ' + snap.val().Address);
        print_date.text('Date: ' + snap.val().myDate);
        print_time.text('Time: ' + snap.val().Time);
        container.append(header).append(print_location).append(print_address).append(print_date).append(print_time);
        $("#Search").append(container); 
      });
    };
  });
}

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
    '<div class="row second-form">' +
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
        suggestion();
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

// Input array of objects {lat, long, username}
function midpointMultipleLatLon(listLatLong){
  if (listLatLong.length == 1)
  {
    return [listLatLong[0].lat, listLatLong[0].long];
  }

  var x = 0;
  var y = 0;
  var z = 0;

  listLatLong.forEach(function(latLong)
  {
    var latitude = toRadians(latLong.lat);
    var longitude = toRadians(latLong.long);

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
      //console.log(snapshot.numChildren() === users, users);
        if (snapshot.numChildren() === users) {

        var locations = [];
        database.ref(sitekey + "/connections").once("value").then(function(snapshot){
          snapshot.forEach(function(childSnapshot){
            var location = {lat: childSnapshot.val().Location[0], long: childSnapshot.val().Location[1], name: childSnapshot.val().userName };
            locations.push(location);
          });
          var coordinates = midpointMultipleLatLon(locations);
          var lat = coordinates[0];
          var lon = coordinates[1];
          initMap(lat, lon);
          console.log(locations);
          for (let location in locations) {
            userLocation(locations[location].lat, locations[location].long, locations[location].name);
          }

         });
        }

    });
}

function removeMap(){
  $("#Finalized").remove();
  $("#Suggestion").remove();
  $("#Meetup").empty();
  $("#Lobby").remove();
  $("#Map").remove();
  $("#List").remove();
  $("#Place").remove();
  $("Suggestion").remove();
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
  });
  database.ref(sitekey+ '/suggestion').set({
    Name : "",
    Location: "",
    Address: "",
    myDate: "",
    Time: "",
    Action: "initial"  
  });
  database.ref(sitekey + '/acceptmeetup').set("");
}

/***initialize map and business search****/
function initMap(latitude, longitude) {
  $("#HomeTab").addClass("active");
  $("#ChatTab").removeClass("active");
  $("#MeetupTab").removeClass("active");  
  $("#Search").addClass("active in");
  $("#Chat").removeClass("active in");
  $("#Meetup").removeClass("active in");  
  var pyrmont = {lat: latitude, lng: longitude};
  $('#Lobby').remove();
  $('#Search').append(

    '<div id="Map"></div>' +
    '<div id="Suggestion" style="padding-bottom:30px">'+
      '<div class="row">' +
        '<div class="col-sm-6">' + 
          '<div class="form-group">' +
            '<label for="MeetLocation">Location</label>' +                           
              '<input class="form-control" id="MeetLocation" type="text">' +
          '</div>' +
          '<div class="form-group">' +
            '<label for="MeetAddress">Address</label>' +                           
              '<input class="form-control" id="MeetAddress" type="text">' +
          '</div>' +          
        '</div>' +
        '<div class="col-sm-6">' + 
          '<div class="form-group">' +
            '<label for="MeetDate">Date</label>' +                           
              '<input class="form-control" id="MeetDate" type="date">' +
          '</div>' +          
          '<div class="form-group">' +
            '<label for="MeetTime">Time</label>' +                           
              '<input class="form-control" id="MeetTime" type="time">' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="row">' +
        '<div class="col-xs-12">' +
          '<button class="btn btn-primary" id="SubmitSuggestion">Suggest</button>' +   
        '</div>' +
      '</div>' + 
    '</div>' +
    '<div id="List"></div>' +
    '<div id="Place"></div>'

  );

  map = new google.maps.Map(document.getElementById('Map'), {
    center: pyrmont,
    zoom: 13
  });

  //userLocation(latitude, longitude);

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
      //console.log(results[i]);

      let placeId = results[i].place_id;

      let container = $('<div>',{'class':'col-sm-6'});
      let panel = $('<div>', {'class': 'panel panel-default'});
      let panelHeading = $('<div>', {'class': 'panel-heading'});
      let panelBody = $('<div>', {'class': 'panel-body'});

      panel.append(panelHeading, panelBody);
      // panelHeading.append(panelTitle);
      panelHeading.append(
        '<div class="row">'+ 
          '<div class="col-xs-9">' + 
            '<h3 class="panel-title">' + results[i].name + '</h3>' +
          '</div>' +
          '<div class="col-xs-3">' + 
            '<button class="btn btn-success" id="Place" data-name="' + results[i].name + '" data-address="' + results[i].vicinity + '">Select</button>' +
          '</div>' +
        '</div>');
      panelBody.append(results[i].vicinity);
      panelBody.append('<span class="glyphicon glyphicon-menu-down pull-right"></span>');
      container.append(panel);

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

      $('#List').append(container);
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

function userLocation(latitude, longitude, userName) {
  let title = userName;
  let icon = 'assets/images/man.png';
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
    //console.log(status);
    //console.log(place);

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