$(document).on('ready', function() {
	// insert previously saved localstorage into select box.  Make sure localStorage is not undefined or null
	if(typeof localStorage !== 'undefined' && localStorage.getItem("allSearches") !== null)  // List of all entries
	{
        initSelect();
	}

	// populate the state select box from java/states.js
	$.each(usStates, function (index, value) {
            $('#state').append($('<option/>', { 
                value: value.abbr,
                text : value.abbr 
            }));
        }); 

	// clear values and collapse div's when returning to page1
	$('#back').click(function() {
      collapse();
      $.mobile.changePage( "#page1", { transition: "slideup", changeHash: false });
    });

    $('#zipp').submit(function() {

    	// reset divs
    	clear();

    	// validate zip code and get city and state for heading
    	var zip = $('#zip').val();
    	if($.trim(zip) == '')
    	{
    		$("#zipVal").text("please enter a zipcode");
    		return false;
    	}

    	// make a blank varilable for city_state
    	var city_state ="";
    	validateZip(zip,city_state);
    	hideKeyboard();
    	return false; 			// since we dont actually want to submit or refresh page

    }); // click submit_zip closing

    $('#submit_city').click(function() {

    	// reset location, weather, and stories divs prior to populating new selection
    	clear();

    	var city = $('#city').val();
    	var state = $('#state').val();

    	if($.trim(city) == '')
    	{
    		$("#cityVal").text("please enter a US city");
    		return false;
    	}
    	if($.trim(state) == '')
    	{
    		$("#stateVal").text("please choose a state");
    		return false;
    	}

    	var zip = "";
    	var city_state = city+","+state;

    	validateZip(zip,city_state);

    }); // click submit_zip closing

    $('#geolocate').click(function() {

    	// reset stories div prior to populating new selection
    	clear();

    	var lat = null;
	    var lng = null;
	    navigator.geolocation.getCurrentPosition(function(position) {
	    	var lat = position.coords.latitude;
	    	var lng = position.coords.longitude;
		   	var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng="+lat+","+lng+"&sensor=true";
	    	$.getJSON(url, function(data) {
		   		var components = data.results[0].address_components;
		   		var zip = null;
	    		
		   		for(var i = 0; i < components.length; i++)
		    	{
		    		var comp = components[i];
		    		if(comp.types.indexOf('postal_code') !== -1)
		    		{
		    			zip = comp.short_name;
		    			var city_state ="";
		    			validateZip(zip,city_state);
		    		}
		    	}
			});
    	});
    });

    $("#past_searches").change(function() {
      var search = $("#past_searches").val();
      $('#zip').val('');
      $('#city').val('');
      $('#state').val('');
      clear();
      if($.isNumeric(search))
      {
      	var zip = search;
      	var city_state = "";
      }
      else
      {
      	var zip = "";
      	var city_state = search;
      }
      validateZip(zip,city_state);
    });
});