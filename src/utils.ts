import mapboxgl from "mapbox-gl";
import { LngLat } from "mapbox-gl";

export const latLngToLocationString = (lat: number, lng: number): string => {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
};

export const lngLatToString = (lngLat: Partial<LngLat> | null): string => {
  if (lngLat?.lat && lngLat?.lng) {
    return latLngToLocationString(lngLat.lat, lngLat.lng);
  } else return "";
};

export const locationTextToLngLat = (value: string): LngLat | null => {
  if (value) {
    const lat: number = Number(value.split(",")[0]?.trim());
    const lng: number = Number(value.split(",")[1]?.trim());

    if (lat && lng) {
      return createLngLat(lng, lat);
    } else return null;
  }
  return null;
};

export const createLngLat = (lng: number, lat: number): LngLat | null => {
  try {
    return new mapboxgl.LngLat(lng, lat);
  } catch (error) {
    return null;
  }
};
