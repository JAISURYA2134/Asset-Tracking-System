
import React from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Box } from "@mui/material";
import { useState } from "react";
import Warehouses from "../pages/Warehouses";



export default function MainLayout({ children }) {
  const [open, setOpen] = useState(true);
  const [activePage, setActivePage] = useState("Dashboard");

  const toggleSidebar = () => {
    setOpen((prev) => !prev);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Sidebar
        open={open}
        setOpen={setOpen}
        activePage={activePage}
        setActivePage={setActivePage}
      />
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          transition: "margin-left 0.3s ease",
          ml: 0,
        }}
      >
        <Navbar onToggleSidebar={toggleSidebar} />
        <Box sx={{ p: 3, overflowY: "auto", flex: 1 }}>
          {React.Children.count(children) > 0 ? (
            children
          ) : (
            <>
              {activePage === "Dashboard" && <div>Welcome to the Dashboard!</div>}
              {activePage === "Warehouse" && <Warehouses />}
              
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
