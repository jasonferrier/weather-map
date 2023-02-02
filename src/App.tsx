import { useCallback, useState, useRef } from "react";
import { Map, MapRef, ViewState } from "react-map-gl";
import "./App.css";
import "mapbox-gl/dist/mapbox-gl.css";

function App() {
  const mapRef = useRef<MapRef>();
  // const [viewState, setViewState]: ViewState = useState({
  const [viewState, setViewState]: any = useState({
    longitude: -109.885769,
    latitude: 38.189371,
    zoom: 10,
  });

  const onMapLoad = useCallback(() => {
    mapRef?.current?.on("moveend", () => {
      console.log("map moved");
    });

    mapRef?.current?.on("mouseup", (stuff) => {
      console.log(`clicked at ${stuff.lngLat.lat}, ${stuff.lngLat.lng}`);
      // console.log(stuff);
    });
  }, []);

  return (
    <div className="App">
      <Map
        id="map-wrapper"
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onLoad={onMapLoad}
        mapStyle="mapbox://styles/mapbox/outdoors-v11"
        mapboxAccessToken="pk.eyJ1IjoiamFzb25mZXJyaWVyIiwiYSI6ImNsZGpjNXhyOTFkbDkzdW8zdjdsZDk4bXAifQ.16O4azQttMMckQyuutOI1w"
      />
    </div>
  );
}

export default App;
