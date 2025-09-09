import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout"; 
import Warehouses from "./Warehouses";
import CreateWarehouse from "./CreateWarehouse";
import CreateAsset from "./CreateAsset";
import CreateAssembly from "./CreateAssembly";
import AssignTask from "./AssignTask";
import WorkerDashboard from "./WorkerDashboard";
import WorkerTasks from "./WorkerTasks";
import WarehouseDetails from "./WarehouseDetails";

export default function Dashboard() {
  return (
    <MainLayout>
      <Routes>
        <Route path="" element={<div>Welcome to the Dashboard!</div>} />
        <Route path="warehouses" element={<Warehouses />} />
        <Route path="warehouses/:id" element={<WarehouseDetails />} />
        <Route path="create-asset" element={<CreateAsset />} />
        <Route path="create-warehouse" element={<CreateWarehouse />} />
        <Route path="create-assembly" element={<CreateAssembly />} />
        <Route path="assign-task" element={<AssignTask />} />
        <Route path="worker" element={<WorkerDashboard />} />
        <Route path="worker/tasks" element={<WorkerTasks />} />
      
      </Routes>
    </MainLayout>
  );
}
