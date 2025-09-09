import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
// import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Warehouses from "./pages/Warehouses";
import CreateWarehouse from "./pages/CreateWarehouse";
import WarehouseDetails from "./pages/WarehouseDetails";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* <Route path="/signup" element={<Signup />} /> */}
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="/warehouses" element={<Warehouses />} />
        <Route path="/warehouses/create" element={<CreateWarehouse />} />
        <Route path="/warehouses/:id" element={<WarehouseDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
