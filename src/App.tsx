import { useCallback, useState, useRef, ChangeEvent } from "react";
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

  const isValidLngLatValues = (lng: number, lat: number): boolean => {
    if (createLngLat(lng, lat)) {
      return true;
    }
    return false;
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
                <p style={{ color: "#333333" }}>
                  Coordinates:{" "}
                  {coordinatesToLatLng(
                    marker.position.lat,
                    marker.position.lng
                  )}
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
