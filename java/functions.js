// validateZip - makes sure location is valid and adds a title with city and state
function validateZip(zip,city_state)
{
	if (zip == "")
	{
		var alert = "location not recognized";
		var url = "https://maps.googleapis.com/maps/api/geocode/json?address="+city_state+"&sensor=true";
		var location = city_state.replace(/ /g,"%2B");		// replace spaces in cities/states with %2B for url entry.
		var entry = city_state;
	}
	if (city_state == "")
	{
		var alert = "invalid US zipcode";
		var url = "https://maps.googleapis.com/maps/api/geocode/json?address="+zip+"&sensor=true";
		var location = zip;
		var entry = zip;
	}

    $.getJSON(url, function(data) {

    	// make sure JSON data is not empty
    	if(data.status !== "ZERO_RESULTS")
    	{
    		var components = data.results[0].address_components;

    		// get coordinates to pass into weather API.  The API isn't very good with zip codes and doesn't recognize US states
    		var lat = data.results[0].geometry.location.lat;
    		var lng = data.results[0].geometry.location.lng;

	    	var city = null;
	    	var state = null;
	    	var citystate = null;

	    	for(var i = 0; i < components.length; i++)
		   	{
		   		var comp = components[i];
		   		if(comp.types.indexOf('locality') !== -1)
		   		{
		   			city = comp.long_name;
		   		}
		   		else if(comp.types.indexOf('administrative_area_level_1') !== -1)
		   		{
		   			state = comp.short_name;
		   		}
		   	}
		   	if(city === null || state === null)
		   	{
				$("#city_state").html(alert);
				return false;
		   	}
		   	else
		   	{
		   		var citystate = city+", "+state;
	    		$("#city_state").html("<h3>"+citystate+"</h3>");
	    		$.mobile.changePage( "#page2", { transition: "slideup", changeHash: false });
	    		getNews(location);
	    		getWeather(lat,lng);
	    		newEntry(entry);
		  	}
    	}
    	else
    	{
    		$("#city_state").html(alert);
    		return false;
    	}
    });
}

// getNews - takes in a location and displays local news
function getNews(location)
{
    var url = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20rss%20where%20url%20%3D%20%27http%3A%2F%2Fnews.google.com%2Fnews%3Fgeo%3D"+location+"%26output%3Drss%27&format=json&diagnostics=true&callback=";

    $.getJSON(url, function(data) {
    	
    	// make sure the location returns data i.e. is a valid US location
    	if (data.query.results === null) 
	   	{
	    	$("#news_stories").html("no news available for this location!");
	    	return false;
	    }
    	var items = data.query.results.item;
    	var title = null;
    	var link = null;

    	for(var i = 0; i < 4; i++)
	   	{
	   		var item = items[i];
	   		title = item.title;
	   		link = item.link;

	   		// append current story to the variable to be shown in the div
	   		var append = "<a href='"+link+"'>"+title+"</a>";
	   		$('#news_stories').append(append+'<br><br>');
	   	}
    });
}

function getWeather(lat,lng)
{
	newLat = lat.toFixed(3);
	newLng = lng.toFixed(3);
	console.log(newLat+", "+newLng);
	var apikey = "18b983141eac8002e859adbfc4de9fb5";
	var url = "http://api.openweathermap.org/data/2.5/weather?lat="+newLat+"&lon="+newLng+"&units=imperial&APPID="+apikey;

	$.getJSON(url, function(data) {

		console.log(data);
		if (data.cod === '404') 
	   	{
	    	$("#weather").html("no weather available for this location!");
	    	return false;
	    }

    	var temp = data.main.temp;
    	var temp_max = data.main.temp_max;
    	var temp_min = data.main.temp_min;
    	var desc = data.weather[0].description;
    	var weather = "<b>Tempurature</b>: "+temp+", <b>Low</b>: "+temp_min+", <b>High</b>: "+temp_max+"<br><b>Conditions</b>: "+desc+"<br>";
    	$("#weather").html(weather);
    });
}

// function initSelect - populates the 'past_searches' select box from localStorage
function initSelect()
{
	// clears out previous data from select box prior to population.  Only includes the default line 'previous searches'
	$('#past_searches').html("<option style='display:none;' value='' selected>previous searches...</option>");
	var search_obj = localStorage.getItem("allSearches");
    obj_parsed = JSON.parse(search_obj);

    latest = obj_parsed.length - 1;
    temp = obj_parsed.length - 5;
    if(temp < 0) {var earliest = 0} else {var earliest = temp}
     
    while(earliest <= latest)
    {
        $('#past_searches').prepend($('<option/>', { 
            value: obj_parsed[earliest].searchy,
            text : obj_parsed[earliest].searchy 
        }));
        earliest++;
    }
}

function newEntry(location)
{
	var existingSearches = JSON.parse(localStorage.getItem("allSearches"));
    if(existingSearches == null) {existingSearches = []}

    // copy text from user
    var inputted = location;
    // make it into an object
    var search = {
        "searchy": inputted
    };

    // remove any previously existing instance of the searched item - makes for better UI
    var i = existingSearches.length;
	while (i--) {
		var current = existingSearches[i].searchy;
	    if(current == inputted)
        {
        	var removedObject = existingSearches.splice(i,1);
		    removedObject = null;
        }
	}

    // add the object to localStorage, push it into the existingSearches array
    localStorage.setItem("search", JSON.stringify(search));
    existingSearches.push(search);
    localStorage.setItem("allSearches", JSON.stringify(existingSearches));  // set the allSearches item

    initSelect();
}

// stackoverflow.com/questions/8780346/how-to-hide-keyboard-in-jquerymobile-page-in-a-phonegap-app
var hideKeyboard = function() {
    document.activeElement.blur();
    $("input").blur();
};

function clear()   // reset location, weather, and stories divs prior to populating new selection
{
	$('#news_stories').html("");
    $('#city_state').html("");
    $('#weather').html("");
    $('#zipVal').html("");
    $('#cityVal').html("");
    $('#stateVal').html("");
}

function collapse()   // collapse and clear input fields when returning to page1
{
	$("#second").collapsible( "option", "collapsed", true );
      $("#first").collapsible( "option", "collapsed", true );
      $('#past_searches').val('').selectmenu('refresh', true);
      $('#state').val('').selectmenu('refresh', true);
      $('#zip').val('');
      $('#city').val('');
      $('#zipVal').val('');
      $('#cityVal').val('');
}