import { useState } from "react";
import Header from "./Header";
import Map from "./Map";
import "./App.css";

type MapCenterWithZoomLevel = {
  latitude: number;
  longitude: number;
  zoom: number;
};

function App() {
  const [mapCenterWithZoomLevel, setMapCenterWithZoomLevel] =
    useState<MapCenterWithZoomLevel | null>(null);

  const [locationInputValue, setLocationInputValue] = useState<string>("");
  const [isValidLocation, setIsValidLocation] = useState<boolean>(false);
  const [isUserSubmissionHandled, setIsUserSubmissionHandled] =
    useState<boolean>(true);
  const [showTerrainLayer, setShowTerrainLayer] = useState<boolean>(false);

  const handleToggleDisplayContours = () => {
    setShowTerrainLayer(!showTerrainLayer);
  };

  const handleUserLocationChange = () => {
    setIsUserSubmissionHandled(false);
  };

  const handleMapUpdatedMarker = () => {
    setIsUserSubmissionHandled(true);
  };

  return (
    <div className="App">
      <Header
        location={locationInputValue}
        isValidLocation={isValidLocation}
        mapCenterLat={mapCenterWithZoomLevel?.latitude}
        mapCenterLng={mapCenterWithZoomLevel?.longitude}
        mapZoom={mapCenterWithZoomLevel?.zoom}
        handleInputChange={setLocationInputValue}
        handleLocationSubmit={handleUserLocationChange}
        handleToggleDisplayContours={handleToggleDisplayContours}
      />
      <Map
        handleCheckLocationInputValidity={setIsValidLocation} // This is when the user types into the text input
        handleChangeMapCenter={setMapCenterWithZoomLevel}
        handleChangeMarkerLocation={setLocationInputValue} // This is when the user clicks the map
        handleClearPendingUserInput={handleMapUpdatedMarker}
        locationInputValue={locationInputValue}
        showTerrainLayer={showTerrainLayer}
        updateMarkerLocation={!isUserSubmissionHandled}
      />
    </div>
  );
}

export default App;
