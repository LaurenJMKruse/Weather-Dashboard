// .ready() prevents page from rendering before jQuery is downloaded
$(document).ready(function() {

    // *********************************************
    // A. Variables
    let cityName;
    let queryURLforWeather;
    let queryURLforUVIndex;
    let returnedData;
    let currentLocation;
    let currentDate;
    let latitude;
    let longitude;
    let currentConditions;
    let currentWeatherIcon;
    let currentTemperature;
    let currentHumidity;
    let currentWindSpeed;
    let currentUVIndex;
    let currentUVIpTag = $('#present-UV-index');
    let historyList = $('#search-history');
    

    // *********************************************
    // B. Functions
    
    // 02. Initiate application
    function init() {
        $('#forecast-panel').css('visibility', 'hidden');
        console.log('Application initiated!');
    };

    // 01. Event Listener for search button
    $('#submit-button').on('click', function() {
        console.log('Submit button clicked!');

        $('#forecast-panel').css('visibility', 'visible');
        cityName = $('#location-input').val();
        console.log(`User requested forecast for`, cityName);
       

        seekLocation(cityName);
        createRow(cityName);

        $('#location-input').val('');
    });

    // 02. Creating row in history list
    function createRow(placeName) {
        let newCity = $('<li>').addClass('list-group-item list-group-item-action').text(placeName);
        historyList.append(newCity);
        console.log(placeName + ` was added to the history list.`);  
    };
  
    // 03. Searching for location in API and gathering data 
    function seekLocation(locationName) {
        cityName = locationName;
        queryURLforWeather = 'http://api.openweathermap.org/data/2.5/weather?q=' + locationName + '&appid=5a8f172622a946ab1036f252f6d9db73&units=imperial'
        $.ajax({
            type: 'GET',
            url: queryURLforWeather,
            dataType: 'json',            
        }).then (function(openWeatherMapData) {
            returnedData = openWeatherMapData;
            
            console.log(`Data for ${locationName} retrieved from Open Weather Map API.`);

            console.log(openWeatherMapData);

            latitude = openWeatherMapData.coord.lat;
            longitude = openWeatherMapData.coord.lon;
            console.log(`Latitude is ${latitude}; Longitude is ${longitude}`);

            populateCurrentWeather(openWeatherMapData);
            seekUVIndex(latitude, longitude);
        });
    };

    // 04. Adding retrieved data for current weather
    function populateCurrentWeather(returnedData) {
        // Populate current city name
        $('#recent-locations').text('Recent Locations');
        currentLocation = $('#location-name').text(cityName);
       
       // Populate date
        currentDate = $('#current-date').text(new Date().toLocaleDateString());
        
        // Populate conditions
        currentConditions = $('#present-conditions').text(returnedData.weather[0].description);
        currentWeatherIcon = $('#weather-depiction').attr('src', 'http://openweathermap.org/img/w/' + returnedData.weather[0].icon + '.png');
        currentTemperature = $('#present-temperature').text(`Temperature: ${returnedData.main.temp} °F`);
        currentHumidity = $('#present-humidity').text(`Humidity: ${returnedData.main.humidity}%`);
        currentWindSpeed = $('#present-wind-speed').text(`Wind Speed: ${returnedData.wind.speed} mph`);      
    };

    // 05. Removing values from forecast panel to prepare for different location
    function clearValues() {
        currentLocation.val('');
        currentDate.val('');
        currentConditions.val('');
        currentWeatherIcon.val('');
        currentTemperature.val('');
        currentHumidity.val('');
        currentWindSpeed.val('');
        currentUVIndex.val('');     
    };

    // 05. Obtaining and adding data for current UV Index
    function seekUVIndex(latd, long) {
        queryURLforUVIndex = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + latd + '&lon=' + long  + '&appid=5a8f172622a946ab1036f252f6d9db73&units=imperial';
        
        $.ajax({
            type: 'GET',
            url: queryURLforUVIndex,
            dataType: 'json'
        }).then (function(incomingData) {
                       
            console.log(`Data for latitude ${latd} and longitude ${long} retrieved from Open Weather Map One-Call API.`);

            console.log(incomingData);

            currentUVIndex = incomingData.current.uvi;
            console.log(`The current UVI is ${currentUVIndex}.`);
        
            currentUVIpTag.text(`UV Index: ${currentUVIndex}`);

            if (currentUVIndex <= 2) {
                currentUVIpTag.css( {'background-color':'green', 'color':'white'});
            } else if (currentUVIndex <= 5) {
                currentUVIpTag.css( {'background-color':'yellow', 'color':'black'} );
            } else if (currentUVIndex <= 7) {
                currentUVIpTag.css('background-color', 'orange');
            } else if (currentUVIndex <= 10) {
                currentUVIpTag.css('background-color', 'red');
            } else {
                currentUVIpTag.css( {'background-color':'purple', 'color':'white'} );
            }
        });
    };

    // 06. Adding sought location to local storage


    // 07. Seeking current conditions from city in search history
    $('#search-history').on('click', 'li', function() {
        seekLocation ($(this).text());
        console.log(`Revisiting ${$(this).text()} from history list.`);
        //currentLocation = $('#location-name').text(cityName);

    });

    // Initial process
    init();


});
