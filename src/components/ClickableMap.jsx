import { useState } from "react";
import { MapContainer, TileLayer, useMapEvents, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

const ClickableMap = () => {
    const [markers, setMarkers] = useState([]);
    const [distance, setDistance] = useState(null);

    const handleMapClick = (e) => {
        if (markers.length >= 2) return; 

        const newMarkers = [...markers, { lat: e.latlng.lat, lng: e.latlng.lng }];
        setMarkers(newMarkers);

        if (newMarkers.length === 2) {
            fetchDistance(newMarkers);
        }
    };

    const fetchDistance = async (points) => {
        try {
            const response = await axios.get("http://127.0.0.1:5000/distance", {
                params: {
                    lat1: points[0].lat,
                    lon1: points[0].lng,
                    lat2: points[1].lat,
                    lon2: points[1].lng,
                },
            });
            setDistance(response.data.distance_km);
        } catch (error) {
            console.error("Error fetching distance:", error);
        }
    };

    const resetMap = () => {
        setMarkers([]);
        setDistance(null);
    };

    return (
        <div className="flex flex-col items-center p-4">
            <h2 className="text-xl font-semibold mb-4">Click on Two Points to Calculate Distance</h2>
            <div className="w-full h-[400px] md:w-[600px] md:h-[500px] border-2 border-gray-300 rounded-lg overflow-hidden">
                <MapContainer center={[20, 0]} zoom={2} className="w-full h-full">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapClickHandler onMapClick={handleMapClick} />
                    {markers.map((pos, idx) => (
                        <Marker key={idx} position={[pos.lat, pos.lng]} />
                    ))}
                </MapContainer>
            </div>
            <h3 className="mt-4 text-lg font-medium">
                {distance !== null ? `Distance: ${distance} km` : "Click two locations on the map"}
            </h3>
            <button
                onClick={resetMap}
                className="mt-3 px-4 py-2 bg-blue-500 text-blue-500 rounded-lg hover:bg-blue-700 transition"
            >
                Reset
            </button>
        </div>
    );
};

const MapClickHandler = ({ onMapClick }) => {
    useMapEvents({
        click: onMapClick,
    });
    return null;
};

export default ClickableMap;
