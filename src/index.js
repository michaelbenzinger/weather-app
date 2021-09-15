import './meyerreset.css';
import './style.css';
let token = config.MY_API_TOKEN;

function convertInput(input) {

}

async function getWeather(city) {
  const temp = document.querySelector('#cwi-temp');
  const condition = document.querySelector('#cwi-condition');
  const feels_like = document.querySelector('#cwi-feels-like');
  temp.innerText = 'Loading Temp';
  condition.innerText = 'Loading Condition';
  feels_like.innerText = 'Loading Feels Like';
  // const data = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${token}`);
  const data = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=Chicago,IL,US&units=imperial&appid=${token}`);
  const json = await data.json();
  temp.innerText = Math.round(json.main.temp) + '°F';
  condition.innerText = json.weather[0].main;
  feels_like.innerText = 'Feels like ' + Math.round(json.main.feels_like) + '°F';
  console.log(json);
}

getWeather();
// getWeather(prompt('Get weather for what city?'));