import { useCallback, useState, useRef, ChangeEvent, useEffect } from "react";
import Map, {
  FullscreenControl,
  LngLat,
  MapRef,
  Marker,
  NavigationControl,
  Popup,
  ViewState,
} from "react-map-gl";
import mapboxgl from "mapbox-gl";
import "./App.css";
import "mapbox-gl/dist/mapbox-gl.css";

const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
// OpenWeather API Endpoint:
// https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}
const openWeatherAPIKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

type Marker = {
  position: Partial<LngLat> | null;
  show: boolean;
};

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

  // TODO: This is firing off TWO API calls.
  useEffect(() => {
    getWeatherAtLocation(longitude, latitude);
    // console.log(`querying OpenWeather API @ ${latitude}, ${longitude}`);
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
        // console.log(weatherData);
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
      {!weatherData && <p>Loading weather data…</p>}
      {weatherData && (
        <>
          <p>Weather for this location is currently</p>
          <table>
            <tbody>
              <tr>
                {/* <td className="icon@2x"> */}
                <td className="icon">
                  <img src={weatherIcon} />
                </td>
                <td>Temp (˚F)</td>
                <td>{weatherData?.main?.temp || "no data"}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

function App() {
  const mapRef = useRef<MapRef | null>(null);

  const [viewState, setViewState] = useState<ViewState>({
    // FEATURE: Use browser geolocation to center map? Fallback coordinates if can not retrieve or no permissions.
    longitude: -109.8857,
    latitude: 38.1893,
    zoom: 10,
    bearing: 0,
    pitch: 0,
    padding: {
      bottom: 0,
      top: 0,
      left: 0,
      right: 0,
    },
  });

  const [showPopup, setShowPopup] = useState<boolean>(false);

  const [marker, setMarker] = useState<Marker>({
    position: null,
    show: false,
  });

  const [locationInputValue, setLocationInputValue] = useState<string>("");

  const inputToLngLat = (value: string): LngLat | null => {
    // console.log(value);
    const lat: number = Number(value.split(",")[0].trim());
    const lng: number = Number(value.split(",")[1]?.trim());
    // console.log(`Is valid LatLng? ${isValidLngLatValues(lng, lat)}`);

    return createLngLat(lng, lat);
  };

  const coordinatesToLatLng = (lat: number, lng: number): string => {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  const createLngLat = (lng: number, lat: number): LngLat | null => {
    try {
      return new mapboxgl.LngLat(lng, lat);
    } catch (error) {
      return null;
    }
  };

  const handleLocationInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    // update input state
    setLocationInputValue(e.target.value);

    // Check if valid "latitude, longitude" || "latitude,longitude"
    // Create LngLat from input || null if invalid
    const lngLatValue = inputToLngLat(e.target.value);

    // If user input a valid coordinate, pan map and display marker
    if (lngLatValue) {
      console.log("Valid coordinate. Displaying marker.");
      mapRef.current?.panTo(lngLatValue);
      setMarker({ position: lngLatValue, show: true });
    } else {
      // Remove marker since input is not a valid coordinate
      // console.log("Invalid LatLng. Display text input warning.");
      setMarker({ ...marker, show: false });
    }

    // TODO: Once the user finishes typing and hits the enter button (pending adding to DOM)
    //  setMarker new position and display, show popup, perform weather API query.
  };

  const onMapLoad = useCallback(() => {
    mapRef.current?.on("moveend", () => {
      // TODO: Fix when user closes popup with X and then pans the map, the popup reappears
      // Re-show popup when user is done panning the map
      setShowPopup(true);
    });

    mapRef.current?.on("mousedown", (event) => {
      // Hide the popup while the user is panning the map
      setShowPopup(false);
    });

    mapRef.current?.on("click", (event) => {
      const lat: number = event.lngLat.lat;
      const lng: number = event.lngLat.lng;
      const location: string = coordinatesToLatLng(lat, lng);
      console.log(`Clicked at ${location}`);
      setLocationInputValue(location);
      setMarker({
        position: {
          lat: lat,
          lng: lng,
        },
        show: true,
      });
      setShowPopup(true);
    });
  }, []);

  // TODO: Fix HTML, add styles, reposition/fix map controls & map size.
  return (
    <div className="App">
      <div className="location-wrapper">
        <div className="location-input">
          <label htmlFor="coordinates">Location:</label>
          {/* Ensure that this input is a controlled component that, when changed, remove the marker & popup until Enter or (new) submit Button is pressed */}
          <input
            autoFocus
            type="text"
            id="coordinates"
            name="coordinates"
            value={locationInputValue}
            onChange={handleLocationInputChange}
            placeholder={coordinatesToLatLng(
              viewState.latitude,
              viewState.longitude
            )}
          />
          <span
            className="warning"
            style={{
              display: inputToLngLat(locationInputValue) ? "none" : "inline",
            }}
          >
            Please enter a valid decimal coordinate as "latitude, longitude".
          </span>
        </div>
        <div className="map-location">
          Current map center: {viewState.latitude.toFixed(4)},{" "}
          {viewState.longitude.toFixed(4)} | Zoom: {viewState.zoom.toFixed(3)}
        </div>
      </div>
      <Map
        {...viewState}
        id="map-wrapper"
        ref={mapRef}
        onMove={(evt) => setViewState(evt.viewState)}
        onLoad={onMapLoad}
        pitchWithRotate={false}
        mapStyle="mapbox://styles/mapbox/outdoors-v11"
        mapboxAccessToken={mapboxAccessToken}
      >
        <FullscreenControl />
        <NavigationControl />
        {marker.show && marker.position?.lng && marker.position?.lat && (
          <>
            <Marker
              longitude={marker.position.lng}
              latitude={marker.position.lat}
              color="magenta"
            />
            {showPopup && (
              <Popup
                className="popup-container"
                longitude={marker.position.lng}
                latitude={marker.position.lat}
                anchor="top"
                focusAfterOpen={false}
                offset={5}
                onClose={() => {
                  setShowPopup(false);
                  // console.log("popup close");
                }}
                // onOpen={() => console.log("popup open")}
              >
                {/* TODO: Solve the re-rendering issue firing off another API call when map is panned and popup is reshown. */}
                <WeatherDisplay
                  latitude={marker.position.lat.toFixed(4)}
                  longitude={marker.position.lng.toFixed(4)}
                />
              </Popup>
            )}
          </>
        )}
      </Map>
    </div>
  );
}

export default App;
