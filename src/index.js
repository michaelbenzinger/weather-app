import './meyerreset.css';
import './style.css';
let token = config.MY_API_TOKEN;

async function getWeather(city) {
  const h1 = document.querySelector('h1');
  const h3 = document.querySelector('h3');
  const data = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${token}`);
  const json = await data.json();
  h1.innerText = 'Temp: ' + Math.round(json.main.temp) + '°F';
  h3.innerText = json.name;
  console.log(json);
}

getWeather('Chicago');