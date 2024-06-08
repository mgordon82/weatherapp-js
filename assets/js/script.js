const openWeatherAPIKey = 'ded87b32a4ec2da34bac71e5c2224ee2';
const cityName = document.getElementById('cityInput').value || '';
const searchCityButton = document.getElementById('searchCityButton');
const errorMsg = document.getElementById('errorMsg');
const weatherLocationsArr = [];

function displayErrorMsg(type, message) {
  errorMsg.textContent = message;
  errorMsg.setAttribute('class', type);
}

searchCityButton.addEventListener('click', function (event) {
  event.preventDefault();
  const cityName = document.getElementById('cityInput').value;

  if (cityName === '') {
    displayErrorMsg('has-text-danger', 'Must enter a city');
  }
  console.log('city', cityName);
  getLatLong(cityName);
});

function getLatLong(city) {
  if (city !== '') {
    fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${openWeatherAPIKey}`
    )
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log(data);
        getCityWeather(data[0].lat, data[0].lon);
      });
  }
}

function getCityWeather(lat, long) {
  if (lat !== null && long !== null) {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=imperial&appid=${openWeatherAPIKey}`
    )
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log(data);
        weatherLocationsArr.push({
          name: data.name,
          lat: data.coord.lat,
          lon: data.coord.lon,
        });
        setWeatherData({
          temp: data.main.temp,
          wind: data.wind.speed,
          humidity: data.main.humidity,
          name: data.name,
          icon: data.weather[0].icon,
          status: data.weather[0].main,
        });
      });
  }
}

function setWeatherData(data) {
  if (data !== null) {
    console.log('weather data', data);
  }
}
