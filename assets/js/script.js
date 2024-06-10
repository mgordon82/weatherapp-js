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
          init();
        }
      });
  }
}
function duplicateCity(cityName) {
  return savedCities?.some((city) => city.name === cityName);
}

function getCityWeather(lat, long) {
  if (lat && long) {
    const currentWeatherFetch = fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=imperial&appid=${openWeatherAPIKey}`
    ).then((response) => {
      if (!response.ok) {
        console.log('There was an error');
      }
      return response.json().then((data) => ({ data }));
    });

    const forecastWeatherFetch = fetch(
      `https://api.openweathermap.org/data/2.5/forecast/?lat=${lat}&lon=${long}&units=imperial&appid=${openWeatherAPIKey}`
    ).then((response) => {
      if (!response.ok) {
        console.log('There was an error');
      }
      return response.json().then((data) => ({ data }));
    });
    Promise.all([currentWeatherFetch, forecastWeatherFetch])
      .then(([currentWeatherResponse, forecastWeatherResponse]) => {
        const currentWeather = currentWeatherResponse.data;
        const forecastData = forecastWeatherResponse.data.list;
        const forecastArr = [];
        for (let i = 0; i < forecastData.length; i += 8) {
          const item = {
            date: dayjs(forecastData[i].dt * 1000).format('MM/DD/YYYY'),
            icon: forecastData[i].weather[0].icon,
            temp: forecastData[i].main.temp,
            wind: forecastData[i].wind.speed,
            humidity: forecastData[i].main.humidity,
          };
          forecastArr.push(item);
        }
        setWeatherData({
          temp: currentWeather.main.temp,
          wind: currentWeather.wind.speed,
          humidity: currentWeather.main.humidity,
          name: currentWeather.name,
          icon: currentWeather.weather[0].icon,
          status: currentWeather.weather[0].main,
          forecast: forecastArr,
        });
      })
      .catch((error) => {
        console.error('There was an error fetching', error);
      });
  }
}

function setWeatherData(data) {
  const localWeatherData = document.getElementById('localWeatherData');
  const localWeatherForecast = document.getElementById('localWeatherForecast');
  localWeatherForecast.innerHTML = '';
  const forecastData = data.forecast;
  localWeatherData.innerHTML = `
    <h2 class="is-size-4">${data.name} (${dayjs().format('MM/DD/YYYY')})</h2>
    
    <div class="columns is-align-items-center">
        <div class="column is-one-quarter is-flex is-align-items-center">
            <img src="https://openweathermap.org/img/wn/${data.icon}.png" />
            <span>${data.status}</span>
        </div>
        <div class="column is-one-quarter">
            <p>Temp: ${data.temp}ºF</p>
        </div>
        <div class="column is-one-quarter">
            <p>Wind: ${data.wind} MPH</p>
        </div>
        <div class="column is-one-quarter">
            <p>Humidity: ${data.humidity}%</p>
        </div>        
    </div>
  `;
  for (let i = 0; i < forecastData.length; i++) {
    const item = forecastData[i];
    const div = document.createElement('div');
    div.setAttribute('class', 'column');
    div.innerHTML = `
    <section
      class="box has-background-primary-40 has-text-primary-55-invert"
    >
      <h3 class="has-text-weight-bold">${item.date}</h3>
      <img src="https://openweathermap.org/img/wn/${item.icon}.png" />
      <p>Temp: ${item.temp}ºF</p>
      <p>Wind: ${item.wind} MPH</p>
      <p>Humidity: ${item.humidity}%</p>
    </section>
  `;
    localWeatherForecast.append(div);
  }
}

// handles dynamic city button clicks
function handleCityButton(event) {
  const city = event.target.textContent;
  getLatLong(city);
}

// builds out the list of searched cities
function setCities() {
  const savedLocations = document.getElementById('savedLocations');
  savedLocations.innerHTML = '';
  for (let i = 0; i < savedCities.length; i++) {
    const li = document.createElement('li');
    const button = document.createElement('button');
    const id = `${savedCities[i].name.replace(/\s+/g, '')}Button`;
    button.setAttribute('id', id);
    button.setAttribute(
      'class',
      'button is-info is-inverted is-fullwidth my-4'
    );
    button.textContent = savedCities[i].name;
    button.addEventListener('click', handleCityButton);
    li.appendChild(button);
    savedLocations.appendChild(li);
  }
}

function init() {
  errorMsg.textContent = '';
  document.getElementById('cityInput').value = '';
  setCities();
}

// initializes the page and as a preference, sets Minneapolis as local city
init();
getLatLong('minneapolis');
