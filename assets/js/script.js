const openWeatherAPIKey = 'ded87b32a4ec2da34bac71e5c2224ee2';
const searchCityButton = document.getElementById('searchCityButton');
const savedCities = JSON.parse(localStorage.getItem('cities') || '[]');
let errorMsg = document.getElementById('errorMsg');

// function that will display an error message if city is not filled in
function displayErrorMsg(type, message) {
  errorMsg.textContent = message;
  errorMsg.setAttribute('class', type);
}

searchCityButton.addEventListener('click', function (event) {
  event.preventDefault();
  let cityName = document.getElementById('cityInput').value;

  if (cityName === '') {
    displayErrorMsg('has-text-danger', 'Must enter a city');
  }
  getLatLong(cityName);
  console.log('did we make it here');
  cityName = '';
  init();
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
        const localCity = data[0];
        console.log('local city data', localCity);
        getCityWeather(localCity.lat, localCity.lon);
        if (!duplicateCity(localCity?.name)) {
          savedCities.push({
            name: localCity.name,
            lat: localCity.lat,
            lon: localCity.lon,
          });
          localStorage.setItem('cities', JSON.stringify(savedCities));
        } else {
          console.log('city is already in favorite list');
        }
      });
  }
}
function duplicateCity(cityName) {
  return savedCities?.some((city) => city.name === cityName);
}

function getCityWeather(lat, long) {
  if (lat && long) {
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=imperial&appid=${openWeatherAPIKey}`
    )
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        console.log('local weather', data);
        setWeatherData({
          temp: data.main.temp,
          wind: data.wind.speed,
          humidity: data.main.humidity,
          name: data.name,
          icon: data.weather[0].icon,
          status: data.weather[0].main,
        });
      });
    init();
    console.log('make it?', savedCities);
  }
}

function setWeatherData(data) {
  console.log('weather data', data);
  const localWeatherData = document.getElementById('localWeatherData');
  localWeatherData.innerHTML = `
    <h2 class="is-size-4">${data.name} (6/7/2024)</h2>
    <div class="columns">
        <div class="column is-one-quarter">
            <p>Temp: ${data.temp}ºF</p>
            <p>Wind: ${data.wind} MPH</p>
            <p>Humidity: ${data.humidity}%</p>
        </div>
        <div class="column">
            <h3>Weather for Today</h3>
            <p>
                Today will be a mix of sun and clouds. There may be a passing
                shower or light sprinkle, but overall there should not be a
                big hinderance to the day.
            </p>
        </div>
    </div>
  `;
}

function setCities() {
  const savedLocations = document.getElementById('savedLocations');
  savedLocations.innerHTML = '';
  for (let i = 0; i < savedCities.length; i++) {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.setAttribute('id', `${savedCities[i].name}Button`);
    button.setAttribute(
      'class',
      'button is-info is-inverted is-fullwidth my-4'
    );
    button.textContent = savedCities[i].name;
    li.appendChild(button);
    savedLocations.appendChild(li);
  }
}

function init() {
  errorMsg.textContent = '';
  cityName = '';
  setCities();
}

init();
