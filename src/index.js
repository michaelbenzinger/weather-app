import './meyerreset.css';
import './style.css';

const cityList = require('../new.city.list.min.json');
const token = config.MY_API_TOKEN;

const input = (() => {

  const convertInput = (text) => {
    const textArray = getTextArray(text);

    if (textArray.length == 1) {
      return textArray[0];
    }
    else if (textArray.length == 2) {
      // Convert second argument to US if it's a form of United States
      if (isUnitedStates(textArray[1])) {
        textArray[1] = 'US';
      }
      if (getPairFromInput(STATES, textArray[1])) {
        // State matches, search in US
        return `${textArray[0]},${getPairFromInput(STATES,textArray[1])[0]},US`;
      } else if (getPairFromInput(COUNTRIES, textArray[1])) {
        return `${textArray[0]},${getPairFromInput(COUNTRIES, textArray[1])[0]}`;
      } else {
        // 2nd term isn't recognized as state or country
        throw "Can't recognize second argument, try again";
      }
    }
    else if (textArray.length == 3) {
      if (getPairFromInput(COUNTRIES, textArray[2])) {
        if (isUnitedStates(textArray[2])) {
          if (getPairFromInput(STATES, textArray[1])) {
            // Country is US and state matches, search normally
            return `${textArray[0]},${getPairFromInput(STATES, textArray[1])[0]},US`;
          } else {
            // Country is US but state doesn't match
            throw "Can't recognize second argument, try again";
          }
        } else {
          // Country matches but isn't the US. Just search city and country
          return `${textArray[0]},${getPairFromInput(COUNTRIES, textArray[2])[0]}`;
        }
      } else {
        // Country isn't recognized
        throw "Can't recognize second argument, try again";
      }
    }
    else {
      throw "Please shorten query to 3 arguments or less";
    }
  };

  // Converts the user text to an array of its comma-separated phrases
  const getTextArray = (text) => {
    return text.match(/(?<=(^|,|, *))\w[\w\s-]+/g);
  };

  // If text is a key or value in object, returns pair as an array
  const getPairFromInput = (object, text) => {
    const foundKey = Object.keys(object).find(key => key === text || object[key] === text);
    if (foundKey) {
      return [foundKey, object[foundKey]];
    }
    return null;
  };

  const isUnitedStates = (text) => {
    const usNames = ['US', 'USA', 'United States', 'United States of America'];
    return usNames.includes(text);
  }

  return {
    convertInput,
    getPairFromInput,
  };
})();

const display = (() => {
  const hourlyForecast = document.querySelector('#hourly-forecast');
  const windArray = ['N','NE','E','SE','S','SW','W','NW','N'];

  const initialize = () => {
    // Initialize hourly forecast
    for (let i = 0; i < 24; i++) {
      const hour = document.createElement('div');
      hour.dataset.hourIndex = i;
      hour.classList.add('hf-hour');
      const hourImage = document.createElement('div');
      hourImage.classList.add('hf-img');
      hourImage.innerText = '☀️';
      hour.append(hourImage);
      const hourTemp = document.createElement('h4');
      hourTemp.classList.add('hf-temp');
      hourTemp.innerText = '50°';
      hour.append(hourTemp);
      const hourTime = document.createElement('h5');
      hourTime.classList.add('hf-time');
      hourTime.innerText = i + 'PM';
      hour.append(hourTime);

      hourlyForecast.append(hour);
    }
  }
  const update = (data) => {

    const currentDate = new Date();
    const timezoneOffset = currentDate.getTimezoneOffset()/60 + data[0].timezone/60/60;

    // current weather data
    const dayNight = getDayNight(data[0], data[0].dt);
    let location = data[0].name + ', ';
    if (data[2] == null) location += data[0].sys.country;
    else location += data[2];
    document.querySelector('#cw-location').innerText = location;
    document.querySelector('#cw-emoji').innerText = getEmoji(data[0].weather[0], dayNight);
    document.querySelector('#cwi-temp').innerText = Math.round(data[0].main.temp) + '°';
    document.querySelector('#cwi-condition').innerText = data[0].weather[0].
      description.replace(/(\w)(\w*)/g, function(g0,g1,g2) {
        return g1.toUpperCase() + g2.toLowerCase();
      });
    document.querySelector('#cwi-feels-like').innerText = 'Feels like ' + 
      Math.round(data[0].main.feels_like) + '°';
    const asOfTime = new Date(currentDate.setHours(currentDate.getHours() + timezoneOffset));
    document.querySelector('#cwi-as-of').innerText = 'As of ' + toAmPm(asOfTime, true);

    // hourly forecast
    const hourlyData = data[1].hourly;
    hourlyForecast.childNodes.forEach(hour => {
      const hourChildNodes = hour.childNodes;
      const hourIndex = hour.dataset.hourIndex;
      let date = new Date(hourlyData[hourIndex].dt*1000);
      const hourDayNight = getDayNight(data[0], hourlyData[hourIndex].dt);
      hourChildNodes[0].innerText = getEmoji(hourlyData[hourIndex].weather[0], hourDayNight);
      hourChildNodes[1].innerText = Math.round(hourlyData[hourIndex].temp) + '°';
      const hourTime = new Date(date.setHours(date.getHours() + timezoneOffset));
      hourChildNodes[2].innerText = toAmPm(hourTime, false);
    });

    // current weather info
    document.querySelector('#info-humidity').innerText = data[0].main.humidity + '%';
    document.querySelector('#info-pressure').innerText = data[0].main.pressure + ' hPa';
    document.querySelector('#info-visibility').innerText =
      (Math.round(data[0].visibility/1609.34)) + ' mi';
    let windDirection = windArray[Math.round((data[0].wind.deg)/45)];
    if (Math.round(data[0].wind.speed) == 0) windDirection = '';
    document.querySelector('#info-wind').innerText =
      Math.round(data[0].wind.speed) + ' mph ' + windDirection;
  }

  const toAmPm = (timeInput, minutes) => {
    let hours = timeInput.getHours();
    let convertedTime = hours;
    if (hours == 0) {
      convertedTime = 12;
    } else if (hours > 12) {
      convertedTime = hours - 12;
    }

    if (minutes) {
      convertedTime += ":" + timeInput.getMinutes();
    }

    if (hours < 12) {
      return convertedTime + 'AM';
    } else {
      return convertedTime + 'PM';
    }
  }

  const getEmoji = (weather, dayNight) => {
    const emojis = {
      'Thunderstorm': '⛈️',
      'Drizzle': '🌧️',
      'Rain': '🌧️',
      'Snow': '🌨️',
      'Mist': '🌫️',
      'Smoke': '🌫️',
      'Haze': '🌫️',
      'Dust': '🌫️',
      'Fog': '🌫️',
      'Sand': '🌫️',
      'Ash': '🌫️',
      'Squall': '🌫️',
      'Tornado': '🌪️',
      'sun': '☀️',
      'moon': '🌙',
      'few clouds': '🌤️',
      'scattered clouds': '⛅',
      'broken clouds': '🌥️',
      'overcast clouds': '☁️'
    }
    let weatherMain = weather.main;
    if (weatherMain == 'Clouds') {
      weatherMain = weather.description;
    }
    else if (weatherMain == 'Clear') {
      if (dayNight == 'day') {
        weatherMain = 'sun';
      } else {
        weatherMain = 'moon';
      } 
    }

    return emojis[weatherMain];
  }

  const getDayNight = (current, date) => {
    const sunrise = current.sys.sunrise;
    const sunset = current.sys.sunset;
    if (date - sunrise > 86400) {
      date -= 86400;
    }
    if (date < sunrise || date > sunset) {
      return 'night';
    } else {
      return 'day';
    }
  }

  return {
    initialize,
    update,
  };
})();

const api = (() => {
  const getDataFromInput = async (text) => {
    try {
      const converted = input.convertInput(text);

      const currentWeather = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${converted}&units=imperial&appid=${token}`);
      const currentWeatherJson = await currentWeather.json();
  
      if (currentWeatherJson.cod == '404') {
        throw `Couldn't get weather data for ${converted}`;
      }

      const lat = currentWeatherJson.coord.lat;
      const lon = currentWeatherJson.coord.lon;
      const oneCall = await fetch(`http://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely&units=imperial&appid=${token}`);
      const oneCallJson = await oneCall.json();
  
      const state = getStateFromCityId(currentWeatherJson.id);
  
      return [currentWeatherJson, oneCallJson, state];
    }
    catch (error) {
      console.error(error);
    }
  }

  const getStateFromCityId = (id) => {
    const found = cityList.find(city => city.i == id);
    if (found) {
      return found.s;
    }
    return null;
  }

  return {
    getDataFromInput,
  };
})();

display.initialize();

api.getDataFromInput('Monza').then(data => {
  display.update(data);
  console.log(data);
});