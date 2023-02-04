import { useCallback, useState, useRef } from "react";
import Map, {
  FullscreenControl,
  LngLat,
  MapRef,
  Marker,
  NavigationControl,
  Popup,
  ViewState,
} from "react-map-gl";
import "./App.css";
import "mapbox-gl/dist/mapbox-gl.css";

type Marker = {
  position: Partial<LngLat> | null;
  show: boolean;
};

function App() {
  const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  // OpenWeather API Endpoint:
  // https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}
  const openWeatherAPIKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  const mapRef = useRef<MapRef | null>(null);
  const [viewState, setViewState] = useState<ViewState>({
    longitude: -109.885769,
    latitude: 38.189371,
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

  const onMapLoad = useCallback(() => {
    mapRef.current?.on("moveend", () => {
      console.log("map moved");
    });

    mapRef.current?.on("mousedown", (event) => {
      setShowPopup(false);
      setMarker({ ...marker, show: false });
    });
    mapRef.current?.on("click", (event) => {
      console.log(`clicked at ${event.lngLat.lat}, ${event.lngLat.lng}`);
      setMarker({
        position: {
          lat: event.lngLat.lat,
          lng: event.lngLat.lng,
        },
        show: true,
      });
      setShowPopup(true);
    });
  }, []);

  return (
    <div className="App">
      <div className="location-wrapper">
        <div className="location-input">
          <label htmlFor="coordinates">Coordinates:</label>
          {/* TODO: Set value to "event.lngLat.lat, event.lngLat.lng" */}
          <input autoFocus type="text" id="coordinates" name="coordinates" />
        </div>
        <div className="map-location">LIVE COORDINATES GO HERE</div>
      </div>
      <Map
        {...viewState}
        id="map-wrapper"
        ref={mapRef}
        onMove={(evt) => setViewState(evt.viewState)}
        onLoad={onMapLoad}
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
                  console.log("popup close");
                }}
                onOpen={() => console.log("popup open")}
              >
                <p style={{ color: "#333333" }}>
                  Coordinates: {marker.position.lat}, {marker.position.lng}
                </p>
              </Popup>
            )}
          </>
        )}
      </Map>
    </div>
  );
}

export default App;
