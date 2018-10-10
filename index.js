"use strict";
    // ========================================= Main ================================================================
$(document).ready(function(){

        // geolocation to get the users position
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude
            const lng = position.coords.longitude
            console.log(lat,lng);
            makeMapsAjaxCall(lat,lng);
        },
        function(error) {
            const lat = 44.977753
            const lng = -93.265011
            console.log(error);
            makeMapsAjaxCall(lat,lng);
            }
        );
    });


    // ======================================== Functions and variables ===========================================================

    // Google Map Intialization
    let map = null;
    let myMarker;
    let myLatlng;

    // Array to store the splitted autocorrect result
    let cityArray = []

    // clear on focus
    $("#user-input").on("focus", function clearFields(){
        this.value = ""
    })

    // Search button
    $('#search-button').on("click", function handleSearchClick(e){

       //Ensure sure form doesnt submit and reset the page
        e.preventDefault()

        let autocompleteCity = $("#user-input").val();

        // used to store the autocomplete result
        autocompleteCity = $("#user-input").val()
        cityArray = autocompleteCity.split(",");

        // used to format the city name for the api query
        const searchCity = cityArray[0].replace(' ', '+');
        console.log(searchCity)

        //Make Ajax Call
        makeTicketFlyAjaxCall(searchCity)

    });// End of the handleSearchClick

    // Google place API autocomplete
    function handleSearch(){

        // store the search input id
        const input = document.getElementById('user-input')

        // connect the autocomplete api with the search input field
        let autocomplete = new google.maps.places.Autocomplete(input);

    }// End of handleSearch 


    //TicketFly api call
    function makeTicketFlyAjaxCall(city) {
        let number = 50;
        const queryURL = `https://www.ticketfly.com/api/events/upcoming.json?orgId=1&q=${city}&maxResults=${number}&fieldGroup=light&fields=id,startDate,venue.name,venue.address1,headliners,showType,venue.lat,venue.lng`
        $.ajax({
            url: queryURL,
            method: "GET",
            dataType: 'jsonp',
            cors: true,
            secure: true,
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        }).then(function(response) {
            console.log(response);
            $('#results').empty();

            let availableEvent = response.events.length;
            console.log(availableEvent)

            // condition for rendering the 
            if (availableEvent === 0 ){
                console.log("I'm here")
                $("#noSearchResults").css("display", "block")
                let noSearch= 
                `<div id="noSearchResult">
                    <p>No events found for "${cityArray[0]}" </p>
                </div>`
                $("#noSearchResults").append(noSearch)

            }else{

                for (let i=0;i<response.events.length;i++){

                    let name = response.events[i].name
                    let ticketPrice = response.events[i].ticketPrice;
                    let venueAddress = response.events[i].venue.address1;
                    let venueName = response.events[i].venue.name;
                    let venueLat = response.events[i].venue.lat;
                    let venueCleanLat = +venueLat;
                    let venueLong = response.events[i].venue.lng;
                    let venueCleanLong = +venueLong;
                    let startDate = response.events[i]. startDate;
                    let ticketPurchaseLink= response.events[i].ticketPurchaseUrl;
                    let image = response.events[i].headliners[0].image
                    
                    // condition for rendering image 
                    if (image === null){

                        //  console.log("Not Available");
                        image = "http://www.aal-europe.eu/wp-content/uploads/2013/12/events_medium.jpg";

                    }else{

                        image = response.events[i].headliners[0].image.jumbo.path
                        // console.log(image);
                    }
                    
                        // card to be appended
                        let eventCard =`<div class="mdl-card demo-card-event mdl-shadow--2dp mdl-cell mdl-cell--4-col">
                        <div class="mdl-card__title mdl-card--expand" style="background: url('${image}') center / cover;">
                            <h1 tabindex="0" class="mdl-card__title-text">${name}</h1>
                        </div> 
                        <div tabindex="0" class="mdl-card__supporting-text">
                            <div class="support-text">${venueName}</div>
                            <div class="support-text">${startDate}</div>
                        </div>
                        <div class="mdl-card__actions mdl-card--border">
                            <a data-toggle="modal" data-target="#myModal" data-lat="${venueCleanLat}" data-long="${venueCleanLong}"  data-venueName = "${venueName}" data-venueAddress = "${venueAddress}"class="button mdl-button mdl-js-button mdl-js-ripple-effect ">Map</a>
                            <a tabindex="0" href="${ticketPurchaseLink}" target="_blank" class="mdl-button mdl-js-button mdl-js-ripple-effect">Tickets</a>
                        </div>
                        </div>`
                    
                        // clear the noSearchResult
                        $("#noSearchResults").css("display", "none")

                        // append eventCard to results
                        $("#results").append(eventCard);

                }// End for the for loop
            }// End of the else condition
        });// End of the TicketFly Api promise
    }// End of function enclosing the ticketfly api query and promise

    

    // Google maps api call
    function makeMapsAjaxCall(lat,lng){
        const apiKey= 'AIzaSyA1oE-m_GG9r2xxBtwtQ0ZNMercB9pBhPU'
        const queryURL = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`

        $.ajax({
            url: queryURL,
            method: "GET",

        }).then(function(response) {
            const currentCity = response.results[0].address_components.find(function(element) {
                return element.types.includes('locality')
            }).long_name

            const cleanCity =currentCity.trim().replace(' ', '+');

            console.log(cleanCity);

            cityArray = []
            cityArray.push(cleanCity)

            // make
            makeTicketFlyAjaxCall(cleanCity);
        })
    }

    // Google map and autocomplete
    function initializeGMap(lat, lng) {

        // Google Autocomplete
        // store the search input id
        const input = document.getElementById('user-input')

        // connect the autocomplete api with the search input field
        let autocomplete = new google.maps.places.Autocomplete(input);


        // Google Map API
        myLatlng = new google.maps.LatLng(lat, lng);
    
        let myOptions = {
          zoom: 12,
          zoomControl: true,
          center: myLatlng,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
    
        map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    
        myMarker = new google.maps.Marker({
          position: myLatlng
        });
        myMarker.setMap(map);
      }

    // Re-init map before show modal
  $('#myModal').on('show.bs.modal', function(event) {
    let button = $(event.relatedTarget);
    console.log( button.data('venueaddress'))
    $("#myModalLabel").text(button.data('venuename'))
    $("#myModalAddress").text(button.data('venueaddress'))
    initializeGMap(button.data('lat'), button.data('long'));
    $("#location-map").css("width", "100%");
    $("#map_canvas").css("width", "100%");
  });

  // Trigger map resize event after modal shown
  $('#myModal').on('shown.bs.modal', function() {
    google.maps.event.trigger(map, "resize");
    map.setCenter(myLatlng);
  });
