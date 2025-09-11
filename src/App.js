import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
// import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Warehouses from "./pages/Warehouses";
import CreateWarehouse from "./pages/CreateWarehouse";
import WarehouseDetails from "./pages/WarehouseDetails";
import Assets from "./pages/Assets";
import CreateAsset from "./pages/CreateAsset";
// import AssetDetails from "./pages/AssetDetails";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* <Route path="/signup" element={<Signup />} /> */}
        <Route path="/dashboard/*" element={<Dashboard />} />
        {/* Warehouse Routes */}
        <Route path="/warehouses" element={<Warehouses />} />
        <Route path="/warehouses/create" element={<CreateWarehouse />} />
        <Route path="/warehouses/:id" element={<WarehouseDetails />} />
        {/* Asset Routes */}
        <Route path="/assets" element={<Assets />} />
        <Route path="/assets/create" element={<CreateAsset />} />
        {/* <Route path="/assets/:id" element={<AssetDetails />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
