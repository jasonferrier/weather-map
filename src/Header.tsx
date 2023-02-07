import { useEffect, useState } from "react";
import { latLngToLocationString, locationTextToLngLat } from "./utils";
import "./header.css";

type PropTypes = {
  location: string;
  isValidLocation: boolean;
  mapCenterLat: number | undefined;
  mapCenterLng: number | undefined;
  mapZoom: number | undefined;
  handleInputChange: Function;
  handleLocationSubmit: Function;
  handleToggleDisplayContours: Function;
};

const Header: React.FC<PropTypes> = (props) => {
  const {
    location,
    isValidLocation,
    mapCenterLat,
    mapCenterLng,
    mapZoom,
    handleInputChange,
    handleLocationSubmit,
    handleToggleDisplayContours,
  } = props;

  const [showWarning, setShowWarning] = useState<boolean>(false);

  const handleLocationInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    handleInputChange(e.target.value);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLocationSubmit();
  };

  useEffect(() => {
    setShowWarning(!(isValidLocation || location === ""));
  }, [location, isValidLocation]);

  return (
    <div className="header">
      <h1>Weather Map</h1>
      <div className="app-description">
        You can get the current weather for a location on the map by either
        clicking the map or entering the location manually.
      </div>
      <div className="location-input">
        {showWarning && (
          <p
            className="warning-message"
            style={{
              display: locationTextToLngLat(location) ? "none" : "inline",
            }}
          >
            Please enter a valid decimal coordinate as "latitude, longitude".
          </p>
        )}
        <form
          className={showWarning ? "warning" : ""}
          onSubmit={handleFormSubmit}
        >
          <label htmlFor="coordinates">Location:</label>
          <input
            autoFocus
            type="text"
            id="coordinates"
            name="coordinates"
            value={location}
            onChange={handleLocationInputChange}
            placeholder={
              mapCenterLat && mapCenterLng
                ? latLngToLocationString(mapCenterLat, mapCenterLng)
                : ""
            }
          />
          <button
            className="go-button"
            type="submit"
            disabled={!isValidLocation}
          >
            Go
          </button>
        </form>
      </div>
      <div className="layer-wrapper">
        <input
          type="checkbox"
          id="displayTerrain"
          name="displayTerrain"
          onChange={() => handleToggleDisplayContours()}
        />
        <label htmlFor="displayTerrain">Display topo above 10,000 feet</label>
      </div>
      <div className="map-location">
        Current map center: {mapCenterLat ? mapCenterLat.toFixed(4) : "N/A"} ,{" "}
        {mapCenterLng ? mapCenterLng.toFixed(4) : "N/A"} | Zoom:{" "}
        {mapZoom ? mapZoom.toFixed(3) : "N/A"}
      </div>
    </div>
  );
};

export default Header;
