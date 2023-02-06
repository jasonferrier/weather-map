import { latLngToLocationString, locationTextToLngLat } from "./utils";
import "./header.css";

type HeaderProps = {
  location: string;
  isValidLocation: boolean;
  mapCenterLat: number;
  mapCenterLng: number;
  mapZoom: number;
  handleInputChange: Function;
  handleLocationSubmit: Function;
  handleToggleDisplayContours: Function;
};

const Header: React.FC<HeaderProps> = (props) => {
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

  const handleLocationInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    handleInputChange(e.target.value);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLocationSubmit();
  };

  return (
    <div className="header">
      {/* TODO: change this to flexbox */}
      {/* <h1>Weather Map</h1>
      <div className="app-description">
        You can get the current weather for a location on the map by either
        clicking the map or entering the location manually.
      </div> */}
      <div className="location-input">
        <form onSubmit={handleFormSubmit}>
          <label htmlFor="coordinates">Location:</label>
          <input
            autoFocus
            className={isValidLocation ? "" : "warning"}
            type="text"
            id="coordinates"
            name="coordinates"
            value={location}
            onChange={handleLocationInputChange}
            placeholder={latLngToLocationString(mapCenterLat, mapCenterLng)}
          />
          <button
            className="go-button"
            type="submit"
            disabled={!isValidLocation}
          >
            Go
          </button>
          {!isValidLocation && (
            <span
              className="warning-message"
              style={{
                display: locationTextToLngLat(location) ? "none" : "inline",
              }}
            >
              Please enter a valid decimal coordinate as "latitude, longitude".
            </span>
          )}
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
        Current map center: {mapCenterLat.toFixed(4)}, {mapCenterLng.toFixed(4)}{" "}
        | Zoom: {mapZoom.toFixed(3)}
      </div>
    </div>
  );
};

export default Header;
