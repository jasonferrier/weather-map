import { useCallback, useEffect, useRef, useState } from "react";
import ReactMapGL, {
  LngLat,
  MapRef,
  Marker,
  NavigationControl,
  Popup,
  ViewState,
} from "react-map-gl";
import WeatherDisplay from "./WeatherDisplay";
import {
  createLngLat,
  latLngToLocationString,
  locationTextToLngLat,
} from "./utils";
import "mapbox-gl/dist/mapbox-gl.css";
import "./map.css";

const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const defaultMapViewState: ViewState = {
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
};

type PropTypes = {
  handleCheckLocationInputValidity: Function;
  handleChangeMapCenter: Function;
  handleChangeMarkerLocation: Function;
  handleClearPendingUserInput: Function;
  locationInputValue: string;
  showTerrainLayer: boolean;
  updateMarkerLocation: boolean;
};

type MarkerType = {
  position: Partial<LngLat> | null;
  show: boolean;
};

const Map: React.FC<PropTypes> = (props) => {
  const {
    handleCheckLocationInputValidity,
    handleChangeMapCenter,
    handleChangeMarkerLocation,
    handleClearPendingUserInput,
    locationInputValue,
    showTerrainLayer,
    updateMarkerLocation,
  } = props;

  // Prevent the map from reloading when the user interacts with the map
  const mapRef = useRef<MapRef | null>(null);
  const [viewState, setViewState] = useState<ViewState>(defaultMapViewState);
  const [weatherMarker, setWeatherMarker] = useState<MarkerType>({
    position: null,
    show: false,
  });
  const [showPopup, setShowPopup] = useState<boolean>(false);

  const addMarkerFromMapClick = (lng: number, lat: number) => {
    const location: string = latLngToLocationString(lat, lng);
    // Update value in text input in header
    handleChangeMarkerLocation(location);
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
    setShowPopup(false);
    setWeatherMarker({ position: null, show: false });
    handleChangeMarkerLocation("");
  };

  // When the user text input has changed, validate it.
  // If valid, set validity on parent and update marker location
  useEffect(() => {
    const lngLat = locationTextToLngLat(locationInputValue);

    if (lngLat) {
      // User input is a valid coordinate
      if (updateMarkerLocation) {
        addMarker(lngLat.lng, lngLat.lat);
        // Clear out App: setUpdateLocation(false)
        handleClearPendingUserInput();
      }
      handleCheckLocationInputValidity(true);
    } else {
      // Else, set invalid
      handleCheckLocationInputValidity(false);
    }
  }, [locationInputValue, updateMarkerLocation]);

  useEffect(() => {
    if (showTerrainLayer) {
      mapRef.current
        ?.getMap()
        .setLayoutProperty("contours", "visibility", "visible");
    } else {
      mapRef.current
        ?.getMap()
        .setLayoutProperty("contours", "visibility", "none");
    }
  }, [showTerrainLayer]);

  const onMapLoad = useCallback(() => {
    handleChangeMapCenter({
      latitude: mapRef.current?.getMap().getCenter().lat,
      longitude: mapRef.current?.getMap().getCenter().lng,
      zoom: mapRef.current?.getMap().getZoom(),
    });
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
        filter: [">", ["get", "ele"], 3048],
      });
    mapRef.current?.on("move", () => {
      handleChangeMapCenter({
        latitude: mapRef.current?.getMap().getCenter().lat,
        longitude: mapRef.current?.getMap().getCenter().lng,
        zoom: mapRef.current?.getMap().getZoom(),
      });
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

  return (
    <ReactMapGL
      {...viewState}
      id="map-wrapper"
      ref={mapRef}
      onMove={(evt) => setViewState(evt.viewState)}
      onLoad={onMapLoad}
      pitchWithRotate={false}
      minZoom={3}
      maxZoom={14}
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
                onClose={() => removeMarker()}
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
    </ReactMapGL>
  );
};

export default Map;
