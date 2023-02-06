import { LngLat } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import "./map.css";

const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
// OpenWeather API Endpoint:
// https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}
const openWeatherAPIKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

export type WeatherMarker = {
  position: Partial<LngLat> | null;
  show: boolean;
};
