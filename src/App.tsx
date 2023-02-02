import { useCallback, useState, useRef } from "react";
import { LngLat, Map, MapRef, Marker, ViewState } from "react-map-gl";
import "./App.css";
import "mapbox-gl/dist/mapbox-gl.css";

type Marker = {
  position: Partial<LngLat> | null;
  show: boolean;
};

function App() {
  const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  const openWeatherAPIKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  const mapRef = useRef<MapRef>();
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

  const [marker, setMarker] = useState<Marker>({
    position: null,
    show: false,
  });

  const onMapLoad = useCallback(() => {
    mapRef.current?.on("moveend", () => {
      console.log("map moved");
    });

    mapRef.current?.on("mouseup", (stuff) => {
      console.log(`clicked at ${stuff.lngLat.lat}, ${stuff.lngLat.lng}`);
      setMarker({
        position: {
          lat: stuff.lngLat.lat,
          lng: stuff.lngLat.lng,
        },
        show: true,
      });
    });
  }, []);

  return (
    <div className="App">
      <Map
        {...viewState}
        id="map-wrapper"
        ref={mapRef}
        onViewPortChange={(viewport: ViewState) => setViewState(viewport)}
        onMove={(evt) => setViewState(evt.viewState)}
        onLoad={onMapLoad}
        mapStyle="mapbox://styles/mapbox/outdoors-v11"
        mapboxAccessToken={mapboxAccessToken}
      >
        {marker.show && marker.position?.lng && marker.position?.lat ? (
          <Marker
            longitude={marker.position.lng}
            latitude={marker.position.lat}
            color="red"
          />
        ) : null}
      </Map>
    </div>
  );
}

export default App;
