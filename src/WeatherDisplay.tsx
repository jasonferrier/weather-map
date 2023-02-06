import { useEffect, useState } from "react";

// OpenWeather API Endpoint:
// https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}
const openWeatherAPIKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

// TODO: ¿¿ Should I use this package: https://www.npmjs.com/package/openweathermap-ts ??
// NOTE FROM OPENWEATHER API DOCUMENTATION:
//    If you do not see some of the parameters in your API response it means that these
//    weather phenomena are just not happened for the time of measurement for the city
//    or location chosen. Only really measured or calculated data is displayed in API response.
type weatherDataType = {
  coord: {
    lon: number; // City geo location, longitude
    lat: number; // City geo location, latitude
  };
  weather: {
    id: number; // Weather condition id
    main: string; // Group of weather parameters (Rain, Snow, Extreme etc.)
    description: string; // Weather condition within the group. You can get the output in your language. [Learn more](https://openweathermap.org/current#multi)
    icon: string;
  }[];
  base: string; // **Internal parameter**
  main: {
    temp: number; // Temperature. Unit Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit.
    feels_like: number; // Temperature. This temperature parameter accounts for the human perception of weather. Unit Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit.
    temp_min: number; // Minimum temperature at the moment. This is minimal currently observed temperature (within large megalopolises and urban areas). Unit Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit.
    temp_max: number; // Maximum temperature at the moment. This is maximal currently observed temperature (within large megalopolises and urban areas). Unit Default: Kelvin, Metric: Celsius, Imperial: Fahrenheit.
    pressure: number; // Atmospheric pressure (on the sea level, if there is no sea_level or grnd_level data), hPa
    humidity: number; // Humidity, %
    sea_level: number; // Atmospheric pressure on the sea level, hPa
    grnd_level: number; // Atmospheric pressure on the ground level, hPa
  };
  visibility: number; // Visibility, meter. The maximum value of the visibility is 10km
  wind: {
    speed: number; // Wind speed. Unit Default: meter/sec, Metric: meter/sec, Imperial: miles/hour.
    deg: number; // Wind direction, degrees (meteorological)
    gust: number; // Wind gust. Unit Default: meter/sec, Metric: meter/sec, Imperial: miles/hour
  };
  clouds: {
    all: number; // Cloudiness, %
  };
  rain: {
    "1h": number; // Rain volume for the last 1 hour, mm
    "3h": number; // Rain volume for the last 3 hours, mm
  };
  snow: {
    "1h": number; // Snow volume for the last 1 hour, mm
    "3h": number; // Snow volume for the last 3 hours, mm
  };
  dt: number; // Time of data calculation, unix, UTC
  sys: {
    type: number; // **Internal parameter**
    id: number; // **Internal parameter**
    message: string; // **Internal parameter**
    country: string; // Country code (GB, JP etc.)
    sunrise: number; // Sunrise time, unix, UTC
    sunset: number; // Sunset time, unix, UTC
  };
  timezone: number; // Shift in seconds from UTC
  id: number; // City ID. Please note that built-in geocoder functionality has been deprecated.
  name: string; // City name. Please note that built-in geocoder functionality has been deprecated. Learn more
  cod: number; // **Internal parameter**
};

type WeatherDisplayProps = {
  latitude: string;
  longitude: string;
};

const WeatherDisplay: React.FC<WeatherDisplayProps> = (props) => {
  const { latitude, longitude } = props;
  const [weatherData, setWeatherData] =
    useState<Partial<weatherDataType> | null>(null);
  const [weatherIcon, setWeatherIcon] = useState<string | undefined>();

  // TODO: BUG 🐛 This is firing off TWO API calls.
  useEffect(() => {
    getWeatherAtLocation(longitude, latitude);
    [];
  }, []);

  const getWeatherAtLocation = (lng: string, lat: string) => {
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${openWeatherAPIKey}&units=imperial`;
    fetch(weatherApiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response;
      })
      .then((response) => response.json())
      .then((weatherData: weatherDataType) => {
        setWeatherData(weatherData);

        const icon = weatherData.weather[0]?.icon || null;
        if (icon) {
          // setWeatherIcon(`http://openweathermap.org/img/wn/${icon}@2x.png`); // "Retina"
          setWeatherIcon(`http://openweathermap.org/img/wn/${icon}.png`);
        } else {
          // setWeatherIcon("./public/question-mark@2x.png"); // "Retina"
          setWeatherIcon("./public/question-mark.png");
        }
      });
  };

  return (
    <div className="weather-wrapper">
      {!weatherData && (
        <div className="loading">
          <div className="lds-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p>Loading weather data</p>
        </div>
      )}
      {weatherData && (
        <>
          <img src={weatherIcon} />
          {weatherData.weather && weatherData.weather[0].description && (
            <p className="description">{weatherData.weather[0].description}</p>
          )}
          {weatherData?.main?.temp && (
            <div className="temperature">
              <p>
                Actual{" "}
                <span className="data">
                  {weatherData.main.temp.toFixed(1)} ˚F
                </span>
              </p>
              {weatherData.main.feels_like && (
                <p>
                  Feels like{" "}
                  <span className="data">
                    {weatherData.main.feels_like.toFixed(1)} ˚F
                  </span>
                </p>
              )}
              {weatherData.main.humidity && (
                <p>
                  Humidity{" "}
                  <span className="data">
                    {weatherData.main.humidity.toFixed(0)}%
                  </span>
                </p>
              )}
            </div>
          )}
          {weatherData?.clouds?.all && (
            <p className="clouds">
              Cloudiness{" "}
              <span className="data">{weatherData?.clouds?.all}%</span>
            </p>
          )}
          {weatherData?.wind?.speed && (
            <p className="wind">
              Wind Speed:{" "}
              <span className="data">
                {weatherData?.wind?.speed.toFixed(0)} mph
              </span>
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default WeatherDisplay;
