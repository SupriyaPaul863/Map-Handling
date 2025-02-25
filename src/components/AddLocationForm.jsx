import "leaflet/dist/leaflet.css";
import React, { useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddLocationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    latitude: "",
    longitude: "",
  });

  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState(null);
  const [marker, setMarker] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setServerMessage(null); 
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name) newErrors.name = "Place name is required!";
    if (!formData.type) newErrors.type = "Place type is required!";
    if (!formData.latitude) newErrors.latitude = "Latitude is required!";
    if (!formData.longitude) newErrors.longitude = "Longitude is required!";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: formData.name,
      type: formData.type,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
    };

    try {
      const response = await fetch("http://localhost:5000/insert_place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Location added successfully!");
        setServerMessage({ type: "success", text: "Place added successfully!" });
        setMarker([payload.latitude, payload.longitude]); 
        setFormData({ name: "", type: "", latitude: "", longitude: "" }); 
      } else {
        setServerMessage({ type: "error", text: data.error || "Failed to add location" });
        toast.error(data.error || "Failed to add location");
      }
    } catch (error) {
      setServerMessage({ type: "error", text: "Something went wrong. Please try again." });
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (

    <div className="flex flex-col xl:flex-row gap-8 p-8 max-w-6xl mx-auto"> 
      <div className="w-full  bg-white shadow-lg rounded-2xl p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Add New Location</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-gray-600 text-sm mb-1">Place Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter place name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-3 border ${errors.name ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-1">Place Type</label>
            <input
              type="text"
              name="type"
              placeholder="Enter place type"
              value={formData.type}
              onChange={handleChange}
              className={`w-full p-3 border ${errors.type ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500`}
            />
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 text-sm mb-1">Latitude</label>
              <input
                type="number"
                name="latitude"
                placeholder="Enter latitude"
                value={formData.latitude}
                onChange={handleChange}
                className={`w-full p-3 border ${errors.latitude ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500`}
                step="any"
              />
              {errors.latitude && <p className="text-red-500 text-sm mt-1">{errors.latitude}</p>}
            </div>

            <div>
              <label className="block text-gray-600 text-sm mb-1">Longitude</label>
              <input
                type="number"
                name="longitude"
                placeholder="Enter longitude"
                value={formData.longitude}
                onChange={handleChange}
                className={`w-full p-3 border ${errors.longitude ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500`}
                step="any"
              />
              {errors.longitude && <p className="text-red-500 text-sm mt-1">{errors.longitude}</p>}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-blue-500 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all"
          >
            Add Location
          </button>
        </form>

        {serverMessage && (
          <p
            className={`mt-4 text-center text-lg font-semibold ${
              serverMessage.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {serverMessage.text}
          </p>
        )}
      </div>

      <div className="w-full h-[450px] bg-gray-100 shadow-lg rounded-2xl overflow-hidden border border-gray-200">
        <MapContainer center={[20, 78]} zoom={4} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {marker && <Marker position={marker} />}
        </MapContainer>
      </div>
    </div>
  );
};

export default AddLocationForm;




