# Weather App

The goal of this project is to make use of the OpenWeather API to fetch current and forecasted weather data and display it to the user in a useful way. The project is built with HTML, CSS, and Javascript.

⛅ [Live Preview](https://michaelbenzinger.github.io/weather-app/)

## Challenges Presented

There were a couple of key challenges that I set out to overcome while building this app.

### 1. Responsive Layout

I wanted to be able to display all the information while making the layout of the display responsive for various devices and screen sizes. I made the "today section" responsive by adding a breakpoint so if the screen shrinks to a certain width, the hourly forecast gets bumped down below the current conditions.

I also added a second breakpoint where the "info section" transitions from a 4-column grid to a 2-column grid.

### 2. Forgiving Search Bar

The OpenWeather API is pretty picky about what you ask of it. It can only take a city name or a properly formatted comma-separated list of city name, state code, and/or country code. Because of this, I added the ability for the app to convert the user's search query into a usable search term with the use of a regular expression, some basic logic, and a list of country and US state codes.

### 3. Display State Name

One problem I saw with many of the student solutions is that they would only show the name of the city, not the state or country. If you searched for "Springfield", for example, you would have no way of knowing which of the dozens of Springfields you were looking at the weather for.

The API didn't serve up the name of the state, but it would serve the country name of the place you searched for. It would also serve up a unique city code. OpenWeather also provided a 4 MB file with the list of all the city codes and their respective city names, states, countries, and coordinates. Knowing that the only information I needed was the city codes' respective state, I used JS to reduce the file to its bare essentials and got the size down to 400 KB. Then, I could use this reduced and minified file to look up the state of the searched location to display it to the user.
