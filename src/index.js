import './meyerreset.css';
import './style.css';

const cityList = require('../new.city.list.min.json');
const token = config.MY_API_TOKEN;

const input = (() => {

  let location;

  const getLocation = () => {
    return location;
  }

  const setLocation = (text) => {
    location = text;
    return location;
  }

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
    const array = text.match(/(?<=(^|,|, *))\w[\w\s-]+/g);
    return array;
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
    getLocation,
    setLocation,
  };
})();

const display = (() => {
  const hourlyForecast = document.querySelector('#hourly-forecast');
  const dailyForecast = document.querySelector('#daily-section');
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

    // Initialize daily forecast
    for (let i = 0; i < 7; i++) {
      const day = document.createElement('div');
      day.dataset.dayIndex = i + 1;
      day.classList.add('df-day');
      const dayName = document.createElement('h3');
      dayName.classList.add('df-name');
      dayName.innerText = 'Monday';
      day.append(dayName);
      const dayImg = document.createElement('div');
      dayImg.classList.add('df-img');
      dayImg.innerText = '☀️';
      day.append(dayImg);
      const dayPercent = document.createElement('h3');
      dayPercent.classList.add('df-percent');
      dayPercent.innerText = '25%';
      day.append(dayPercent);
      const dayHigh = document.createElement('h3');
      dayHigh.classList.add('df-high');
      dayHigh.innerText = '80°';
      day.append(dayHigh);
      const dayLow = document.createElement('h3');
      dayLow.classList.add('df-low');
      dayLow.innerText = '80°';
      day.append(dayLow);

      dailyForecast.append(day);
    }

    // Add Enter Key listener to search box
    document.querySelector('#search').addEventListener('keydown', e => {
      if (e.key == 'Enter') {
        api.getDataFromInput(e.target.value).then(data => {
          display.update(data);
        });
      }
    });

    document.querySelector('#unit').addEventListener('click', e => {
      e.target.innerText = units.toggleUnit();
      api.getDataFromInput(input.getLocation()).then(data => {
        display.update(data);
      });
    });
  };

  const update = (data) => {
    const currentDate = new Date();
    const timezoneOffset = currentDate.getTimezoneOffset()/60 + data[0].timezone/60/60;

    // current weather data
    const dayNight = getDayNight(data[0], data[0].dt)
    let location = data[0].name + ', ';
    if (data[2] == null) location += data[0].sys.country;
    else location += data[2];
    document.querySelector('#cw-location').innerText = location;
    document.querySelector('#cw-emoji').innerText = getEmoji(data[0].weather[0], dayNight.dayNight);
    if (units.getUnit() == 'Imperial') {
      document.querySelector('#cwi-temp').innerText = Math.round(data[0].main.temp) + '°F';
    } else {
      document.querySelector('#cwi-temp').innerText = Math.round(data[0].main.temp) + '°C';
    }
    document.querySelector('#cwi-condition').innerText = data[0].weather[0].
      description.replace(/(\w)(\w*)/g, function(g0,g1,g2) {
        return g1.toUpperCase() + g2.toLowerCase();
      });
    document.querySelector('#cwi-feels-like').innerText = 'Feels like ' + 
      Math.round(data[0].main.feels_like) + '°';
    const asOfTime = new Date(currentDate.setHours(currentDate.getHours() + timezoneOffset));
    document.querySelector('#cwi-as-of').innerText = 'As of ' + toAmPm(asOfTime, true);
    document.querySelector('#today-section-container').style = 
      `background-image: linear-gradient(${color.getColor(data[0].weather[0], dayNight)});`;
    document.querySelector('.app-footer').style = 
    `background-image: linear-gradient(${color.getColor(data[0].weather[0], dayNight)});`;
    

    // hourly forecast
    const hourlyData = data[1].hourly;
    hourlyForecast.childNodes.forEach(hour => {
      const hourChildNodes = hour.childNodes;
      const hourIndex = hour.dataset.hourIndex;
      let date = new Date(hourlyData[hourIndex].dt*1000);
      const hourDayNight = getDayNight(data[0], hourlyData[hourIndex].dt).dayNight;
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
    if (units.getUnit() == 'Imperial') {
      document.querySelector('#info-wind').innerText =
        Math.round(data[0].wind.speed) + ' mph ' + windDirection;
    } else {
      document.querySelector('#info-wind').innerText =
      Math.round(data[0].wind.speed) + ' m/s ' + windDirection;
    }

    // daily forecast
    const dailyData = data[1].daily;
    const dayArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    dailyForecast.childNodes.forEach(day => {
      const dayChildNodes = day.childNodes;
      const dayIndex = day.dataset.dayIndex;
      const dayOfWeek = dayArray[new Date(dailyData[dayIndex].dt*1000).getDay()];
      dayChildNodes[0].innerText = dayOfWeek;
      dayChildNodes[1].innerText = getEmoji(dailyData[dayIndex].weather[0], 'day');
      dayChildNodes[2].innerText = (Math.round((dailyData[dayIndex].pop) * 100)) + '%';
      if (dailyData[dayIndex].pop == 0) {
        console.log(dailyData[dayIndex].pop);
        dayChildNodes[2].style.color = '#777';
      } else {
        dayChildNodes[2].style.color = 'inherit';
      }
      dayChildNodes[3].innerText = Math.round(dailyData[dayIndex].temp.max) + '°';
      dayChildNodes[4].innerText = Math.round(dailyData[dayIndex].temp.min) + '°';
    });

    display.removeLoadAnimation();
  };

  const error = (message) => {
    const errorTooltip = document.createElement('div');
    errorTooltip.classList.add('error-tooltip');
    errorTooltip.innerText = message;
    document.querySelector('#search').parentElement.appendChild(errorTooltip);
    setTimeout(() => {
      errorTooltip.remove();
    }, 3000);
  };

  const makeLoadAnimation = () => {
    const loading = document.createElement('div');
    loading.classList.add('loading');
    const loadingSpinner = document.createElement('div');
    loadingSpinner.classList.add('loading-spinner');
    loadingSpinner.classList.add('lds-ripple');
    loadingSpinner.appendChild(document.createElement('div'));
    loadingSpinner.appendChild(document.createElement('div'));
    loading.appendChild(loadingSpinner);
    document.querySelector('body').appendChild(loading);
  }

  const removeLoadAnimation = () => {
    document.querySelector('.loading').remove();
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
      let minutes = timeInput.getMinutes();
      if (minutes < 10) minutes = '0' + minutes;
      convertedTime += ":" + minutes;
    }

    if (hours < 12) {
      return convertedTime + 'AM';
    } else {
      return convertedTime + 'PM';
    }
  };

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
    let dnData = {
      dayNight: null,
      sunsetSunrise: null,
    };
    if (Math.abs(date-sunrise) <= 1800) {
      dnData.sunsetSunrise = 'sunrise';
    } else if (Math.abs(date-sunset) <= 1800) {
      dnData.sunsetSunrise = 'sunset';
    }
    if (date < sunrise || date > sunset) {
      dnData.dayNight = 'night';
    } else {
      dnData.dayNight = 'day';
    }
    return dnData;
  }

  return {
    initialize,
    update,
    error,
    makeLoadAnimation,
    removeLoadAnimation,
  };
})();

const api = (() => {
  const getDataFromInput = async (text) => {
    display.makeLoadAnimation();
    try {
      const converted = input.convertInput(text);

      const currentWeather = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${converted}&units=${units.getUnit().toLowerCase()}&appid=${token}`);
      const currentWeatherJson = await currentWeather.json();
  
      if (currentWeatherJson.cod == '404') {
        throw `Couldn't get weather data for ${converted}`;
      }

      const lat = currentWeatherJson.coord.lat;
      const lon = currentWeatherJson.coord.lon;
      const oneCall = await fetch(`http://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely&units=${units.getUnit().toLowerCase()}&appid=${token}`);
      const oneCallJson = await oneCall.json();
  
      const state = getStateFromCityId(currentWeatherJson.id);

      input.setLocation(converted);
  
      return [currentWeatherJson, oneCallJson, state];
    }
    catch (error) {
      display.error(error);
      display.removeLoadAnimation();
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

const color = (() => {
  const colors = {
    day:     '110deg, rgb(19, 92, 226), rgb(0, 171, 201)',
    cloudy:  '110deg, rgb(71, 102, 160), rgb(106, 124, 145)',
    stormy:  '110deg, rgb(71, 115, 141), rgb(62, 76, 121)',
    night:   '110deg, rgb(29, 52, 97), rgb(30, 61, 126)',
    sunset:  '110deg, rgb(156, 37, 192), rgb(204, 103, 57)',
    sunrise: '110deg, rgb(81, 154, 197), rgb(182, 117, 219)',
  }
  const getColor = (weather, dayNight) => {
    const cloudyConditions = 
      ['Drizzle', 'Snow', 'Mist', 'Smoke', 'Haze', 'Dust', 'Fog', 'Sand', 'Ash',
      'Squall', 'Tornado', 'Clouds'];
    const stormyConditions = ['Thunderstorm', 'Rain'];
    
    if (dayNight.sunsetSunrise) {
      return colors[dayNight.sunsetSunrise];
    } else if (stormyConditions.includes(weather.main)) {
      return colors.stormy;
    } else if (cloudyConditions.includes(weather.main)) {
      return colors.cloudy;
    } else {
      return colors[dayNight.dayNight];
    }
  }
  return {
    colors,
    getColor,
  }
})();

const units = (() => {
  let unit = 'Imperial';

  const toggleUnit = () => {
    if (unit == 'Metric') {
      unit = 'Imperial';
      console.log('setting unit to imp');
    } else {
      unit = 'Metric';
      console.log('setting unit to met');
    }
    return unit;
  }

  const getUnit = () => {
    return unit;
  }

  return {
    getUnit,
    toggleUnit,
  }
})();

display.initialize();

api.getDataFromInput('Chicago, IL').then(data => {
  display.update(data);
  console.log(data);
});