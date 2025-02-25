import AddLocationForm from "./components/AddLocationForm";
import NearbyPlacesMap from "./components/NearbyPlacesMap";
import ClickableMap from "./components/ClickableMap";
import "leaflet/dist/leaflet.css";

function App() {
  return (
    <div className="p-6">
      <AddLocationForm />
      <NearbyPlacesMap/>
      <ClickableMap/>
    </div>
  );
}

export default App;
