// .ready() prevents page from rendering before jQuery is downloaded
$(document).ready(function() {

    // *********************************************
    // A. Variables
    let cityName;
    let queryURLforCurrentWeather;
    let queryURLforUVIndex;
    let queryURLforForecast;
    let returnedCurrentData;
    let returnedForecastData;
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
    
    // 01. Initiate application
    function init() {
        $('#forecast-panel').css('visibility', 'hidden');
        console.log('Application initiated!');
    };

    // 02. Event Listener for search button
    $('#submit-button').on('click', function() {
        console.log('Submit button clicked!');

        $('#forecast-panel').css('visibility', 'visible');
        cityName = $('#location-input').val();
        console.log(`User requested forecast for`, cityName);
       

        seekLocation(cityName);
        createRow(cityName);

        $('#location-input').val('');
    });

    // 03. Creating row in history list
    function createRow(historyCityName) {
        let newCity = $('<li>').addClass('list-group-item list-group-item-action').text(historyCityName);
        historyList.append(newCity);
        console.log(historyCityName + ` was added to the history list.`);  
    };
  
    // 04. Searching for location in API and gathering current data 
    function seekLocation(locationName) {
        cityName = locationName;
        queryURLforCurrentWeather = 'http://api.openweathermap.org/data/2.5/weather?q=' + locationName + '&appid=5a8f172622a946ab1036f252f6d9db73&units=imperial'
        $.ajax({
            type: 'GET',
            url: queryURLforCurrentWeather,
            dataType: 'json',            
        }).then (function(currentWeatherData) {
            returnedCurrentData = currentWeatherData;
            
            console.log(`Current data for ${locationName} retrieved from Open Weather Map API.`);

            console.log(currentWeatherData);

            latitude = currentWeatherData.coord.lat;
            longitude = currentWeatherData.coord.lon;
            console.log(`Latitude is ${latitude}; Longitude is ${longitude}`);

            populateCurrentWeather(currentWeatherData);
            seekUVIndex(latitude, longitude);
            seekForecast(cityName);
        });
     };

    // 05. Adding retrieved data for current weather
    function populateCurrentWeather(returnedCurrentData) {
        // Populate current city name
        $('#recent-locations').text('Recent Locations');
        currentLocation = $('#location-name').text(cityName);
       
       // Populate date
        currentDate = $('#current-date').text(new Date().toLocaleDateString());
        
        // Populate conditions
        currentConditions = $('#present-conditions').text(returnedCurrentData.weather[0].description);
        currentWeatherIcon = $('#weather-depiction').attr('src', 'http://openweathermap.org/img/w/' + returnedCurrentData.weather[0].icon + '.png');
        currentTemperature = $('#present-temperature').text(`Temperature: ${returnedCurrentData.main.temp} °F`);
        currentHumidity = $('#present-humidity').text(`Humidity: ${returnedCurrentData.main.humidity}%`);
        currentWindSpeed = $('#present-wind-speed').text(`Wind Speed: ${returnedCurrentData.wind.speed} mph`);      
    };

    // 06. Obtaining and adding data for current UV Index
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

    // 07. Gathering forecast data 
    function seekForecast(placeName) {
        queryURLforForecast = 'http://api.openweathermap.org/data/2.5/forecast?q=' + placeName + '&appid=5a8f172622a946ab1036f252f6d9db73&units=imperial'
        $.ajax({
            type: 'GET',
            url: queryURLforForecast,
            dataType: 'json',            
        }).then (function(forecastData) {
            returnedForecastData = forecastData;
            
            console.log(`Forecast data for ${placeName} retrieved.`);

            console.log(returnedForecastData);

            buildForecast(returnedForecastData);
        });
    };
    
    // 07. Assembling 5-day forecast
    function buildForecast(returnedForecastData) {        
        // Ensure forecast panel clear of any previous data
        $('#predicted-conditions').empty();

        for (let i = 0; i < returnedForecastData.list.length; i++) {
            
            // Seek forecast for next 5 days at noon; build and populate elements
            if (returnedForecastData.list[i].dt_txt.indexOf('12:00:00') !== -1) {
                let dayBlock = $('<div>').addClass('card inline-block future').css('margin-left', '15px');
                let forecastDate = $('<h6>').addClass('card-title').text(new Date(returnedForecastData.list[i].dt_txt).toLocaleDateString());
                let forecastIcon = $('<img>').attr('src', 'http://openweathermap.org/img/w/' + returnedForecastData.list[i].weather[0].icon + '.png');
                let forecastTemperature = $('<p>').addClass('card-text').text(`Temperature: ${returnedForecastData.list[i].main.temp} °F`);
                let forecastHumidity = $('<p>').addClass('card-text').text(`Humidity: ${returnedForecastData.list[i].main.humidity}%`);
            
                dayBlock.append(forecastDate, forecastIcon, forecastTemperature, forecastHumidity);
                $('#predicted-conditions').append(dayBlock);
            }            
        }
    };

    // // 08. Removing values from forecast panel to prepare for different location
    // function clearValues() {
    //     currentLocation.val('');
    //     currentDate.val('');
    //     currentConditions.val('');
    //     currentWeatherIcon.val('');
    //     currentTemperature.val('');
    //     currentHumidity.val('');
    //     currentWindSpeed.val('');
    //     currentUVIndex.val('');     
    // };

    // 09. Seeking current conditions from city in search history
    $('#search-history').on('click', 'li', function() {
        seekLocation ($(this).text());
        console.log(`Revisiting ${$(this).text()} from history list.`);
    });


    // *********************************************
    // C. Initial process
    init();
});
