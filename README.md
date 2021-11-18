# Weather App

The goal of this project is to make use of the OpenWeather API to fetch current and forecasted weather data and display it to the user in a useful way. The project is built with HTML, CSS, and Javascript.

⛅ [Live Preview](https://michaelbenzinger.github.io/weather-app/)

<hr>

![image](https://user-images.githubusercontent.com/85148502/142478891-4f663349-ce8d-40d3-9014-0397e4d405f2.png)

## Challenges Presented

There were a couple of key challenges that I set out to overcome while building this app.

### 1. Responsive Layout

I wanted to be able to display all the information while making the layout of the display responsive for various devices and screen sizes. I made the "today section" responsive by adding a breakpoint so if the screen shrinks to a certain width, the hourly forecast gets bumped down below the current conditions.

![image](https://user-images.githubusercontent.com/85148502/142478124-557460e1-1980-46e1-9816-d4ea2afda07f.png)

I also added a second breakpoint where the "info section" transitions from a 4-column grid to a 2-column grid.

### 2. Forgiving Search Bar

The OpenWeather API is pretty picky about what you ask of it. It can only take a city name or a properly formatted comma-separated list of city name, state code, and/or country code. Because of this, I added the ability for the app to convert the user's search query into a usable search term with the use of a regular expression, some basic logic, and a list of country and US state codes.

![image](https://user-images.githubusercontent.com/85148502/142479208-9a0aafda-4470-4ccf-994b-f3f1fbe37113.png)

The image above is just part of the ```convertInput()``` function, which acts as a validator for the user's search query. It gets a little help from ```getTextArray()``` (shown below), which converts the query into an array you see in the image above as ```textArray```.

![image](https://user-images.githubusercontent.com/85148502/142479429-cd300d54-5350-4391-9e35-6369a7480767.png)

### 3. Display State Name

One problem I saw with many of the student solutions is that they would only show the name of the city, not the state or country. If you searched for "Springfield", for example, you would have no way of knowing which of the dozens of Springfields you were looking at the weather for.

The API didn't serve up the name of the state, but it would serve the country name of the place you searched for. It would also serve up a unique city code. OpenWeather also provided a 4 MB file with the list of all the city codes and their respective city names, states, countries, and coordinates. Knowing that the only information I needed was the city codes' respective state, I used JS to reduce the file to its bare essentials and got the size down to 400 KB. Then, I could use this reduced and minified file to look up the state of the searched location to display it to the user.

![image](https://user-images.githubusercontent.com/85148502/142480126-67555709-857e-4533-8154-cedceee086d6.png)

The image above is part of the minified JSON file I generated to convert the city ID into its state. I got rid of everything but ID (```i```) and state (```s```), and also filtered out all codes from outside the US. This file is used by the function ```getStateFromCityId```, shown below.

![image](https://user-images.githubusercontent.com/85148502/142480489-41c02bbb-e9ac-4cc0-b3c7-7eaacaf78c56.png)
