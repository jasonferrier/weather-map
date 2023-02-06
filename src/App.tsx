import { useCallback, useState, useRef, useEffect } from "react";
import Map, {
  LngLat,
  MapRef,
  Marker,
  NavigationControl,
  Popup,
  ViewState,
} from "react-map-gl";
import {
  createLngLat,
  latLngToLocationString,
  locationTextToLngLat,
} from "./utils";
import type { WeatherMarker as MarkerType } from "./Map";
import "./App.css";
import "./map.css"; // TODO: Remove this once Map component is created
import "mapbox-gl/dist/mapbox-gl.css"; // TODO: Remove this once Map component is created
import Header from "./Header";
// import Map from "./Map";
import WeatherDisplay from "./WeatherDisplay";

const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

function App() {
  // Prevent the map from reloading when the user interacts with the map
  const mapRef = useRef<MapRef | null>(null);

  const [viewState, setViewState] = useState<ViewState>({
    // FEATURE: Use browser geolocation to center map? Fallback coordinates if can not retrieve or no permissions.
    longitude: -105.045,
    latitude: 38.839,
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

  const [locationInputValue, setLocationInputValue] = useState<string>("");
  const [showPopup, setShowPopup] = useState<boolean>(false);

  const [weatherMarker, setWeatherMarker] = useState<MarkerType>({
    position: null,
    show: false,
  });

  const [displayTerrainLayer, setDisplayTerrainLayer] =
    useState<boolean>(false);
  const handleToggleDisplayContours = () => {
    setDisplayTerrainLayer(!displayTerrainLayer);
  };

  useEffect(() => {
    if (displayTerrainLayer) {
      mapRef.current
        ?.getMap()
        .setLayoutProperty("contours", "visibility", "visible");
    } else {
      mapRef.current
        ?.getMap()
        .setLayoutProperty("contours", "visibility", "none");
    }
  }, [displayTerrainLayer]);

  const onMapLoad = useCallback(() => {
    // Add topo lines to map
    mapRef.current
      ?.getMap()
      .addSource("contours", {
        type: "vector",
        url: "mapbox://mapbox.mapbox-terrain-v2",
      })

      .addLayer({
        id: "contours",
        type: "line",
        source: "contours",
        "source-layer": "contour",
        layout: {
          "line-join": "round",
          "line-cap": "round",
          visibility: "none", // Initially do not display the contours
        },
        paint: {
          "line-color": "#ff69b4",
          "line-width": 1,
        },
        // Only display contours above 3048m // 10,000ft
        filter: [">=", ["get", "ele"], 3048],
      });
    mapRef.current?.on("moveend", () => {
      // TODO: FEATURE: If marker location is outside the map bounds, remove marker and popup

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
      addMarkerFromMapClick(lng, lat);
    });
  }, []);

  const handleUserLocationChange = () => {
    const lngLat = locationTextToLngLat(locationInputValue);
    if (lngLat) {
      addMarker(lngLat.lng, lngLat.lat);
    } else {
      removeMarker();
    }
  };

  const addMarkerFromMapClick = (lng: number, lat: number) => {
    const location: string = latLngToLocationString(lat, lng);
    setLocationInputValue(location);
    addMarker(lng, lat);
  };

  const addMarker = (lng: number, lat: number) => {
    const lngLat: LngLat | null = createLngLat(lng, lat);
    const location: string = latLngToLocationString(lat, lng);
    setWeatherMarker({
      position: {
        lat: lat,
        lng: lng,
      },
      show: true,
    });
    setShowPopup(true);
    lngLat && mapRef.current?.getMap().panTo(lngLat);
    // TODO: BUG 🐛: The popup contents are not refreshed to the current location weather
  };

  const removeMarker = () => {
    setWeatherMarker({ position: null, show: false });
  };

  return (
    <div className="App">
      <Header
        location={locationInputValue}
        isValidLocation={
          locationInputValue === "" ||
          !!locationTextToLngLat(locationInputValue)
        }
        mapCenterLat={viewState.latitude}
        mapCenterLng={viewState.longitude}
        mapZoom={viewState.zoom}
        handleInputChange={setLocationInputValue}
        handleLocationSubmit={handleUserLocationChange}
        handleToggleDisplayContours={handleToggleDisplayContours}
      />
      <Map
        {...viewState}
        id="map-wrapper"
        ref={mapRef}
        onMove={(evt) => setViewState(evt.viewState)}
        onLoad={onMapLoad}
        pitchWithRotate={false}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={mapboxAccessToken}
      >
        {/* TODO: BUG 🐛 Header disappears when going into fullscreen mode, so disabling full screen map mode
        <FullscreenControl />
        */}
        <NavigationControl />
        {weatherMarker.show &&
          weatherMarker.position?.lng &&
          weatherMarker.position?.lat && (
            <>
              <Marker
                longitude={weatherMarker.position.lng}
                latitude={weatherMarker.position.lat}
                color="magenta"
              />
              {showPopup && (
                <Popup
                  className="popup-container"
                  longitude={weatherMarker.position.lng}
                  latitude={weatherMarker.position.lat}
                  // anchor="top"
                  focusAfterOpen={false}
                  offset={{ bottom: [0, -35] }}
                  onClose={() => {
                    setShowPopup(false);
                    setWeatherMarker({ position: null, show: false });
                  }}
                  // onOpen={() => console.log("popup open")}
                >
                  {/* TODO: BUG 🐛 Solve the re-rendering issue firing off another API call when map is panned and popup is reshown. */}
                  <WeatherDisplay
                    latitude={weatherMarker.position.lat.toFixed(4)}
                    longitude={weatherMarker.position.lng.toFixed(4)}
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
