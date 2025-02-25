import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

const customIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const LocationMarker = ({ setLocation }) => {
  useMapEvents({
    click(e) {
      setLocation(e.latlng);
    },
  });
  return null;
};

export default function NearbyPlacesMap() {
  const [location, setLocation] = useState(null);
  const [radius, setRadius] = useState(5);
  const [places, setPlaces] = useState([]);
  const [nearestPlace, setNearestPlace] = useState(null);
  const [error, setError] = useState(null);
  
  const fetchNearbyPlaces = async () => {
    if (!location) return;
    try {
      const response = await axios.get("http://localhost:5000/nearby_places", {
        params: {
          lat: location.lat,
          lon: location.lng,
          radius: Number(radius),
        },
      });
      setPlaces(response.data.places);
      setError(null);
    } catch (error) {
      console.error("Error fetching places:", error);
      setError("Failed to fetch nearby places.");
    }
  };
  
  const fetchNearestPlace = async () => {
    if (!location) return;
    try {
      const response = await axios.get("http://localhost:5000/nearest_place", {
        params: {
          lat: location.lat,
          lon: location.lng,
        },
      });
      setNearestPlace(response.data.place);
      setError(null);
    } catch (error) {
      console.error("Error fetching nearest place:", error);
      setError("Failed to fetch nearest place.");
    }
  };
  
  return (
    <div className="flex flex-col items-center w-full h-screen p-4">
      <div className="mb-4 flex gap-4">
        <input
          type="number"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          className="border p-2 rounded-lg"
          placeholder="Enter radius (km)"
        />
        <button
          onClick={fetchNearbyPlaces}
          className="bg-blue-500 text-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600"
          disabled={!location}
        >
          Find Places
        </button>
        <button
          onClick={fetchNearestPlace}
          className="bg-green-500 text-blue-500 px-4 py-2 rounded-lg hover:bg-green-600"
          disabled={!location}
        >
          Find Nearest Place
        </button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <MapContainer center={[20, 78]} zoom={5} className="w-full h-full rounded-lg">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker setLocation={setLocation} />
        {location && <Marker position={location} icon={customIcon}><Popup>Selected Location</Popup></Marker>}
        {places.length > 0 && places.map((place) => (
          <Marker key={place.id} position={[place.latitude, place.longitude]} icon={customIcon}>
            <Popup>
              <strong>{place.name}</strong><br />
              Type: {place.type}<br />
              Distance: {place.distance_km} km
            </Popup>
          </Marker>
        ))}
        {nearestPlace && (
          <Marker position={[nearestPlace.latitude, nearestPlace.longitude]} icon={customIcon}>
            <Popup>
              <strong>{nearestPlace.name}</strong><br />
              Type: {nearestPlace.type}<br />
              Distance: {nearestPlace.distance_km} km
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}




