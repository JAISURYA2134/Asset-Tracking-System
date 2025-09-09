import React from "react";
import { AppBar, Toolbar, Typography, Avatar, Box, IconButton } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

export default function Navbar({ onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // clear local storage or any auth state
    try { localStorage.removeItem("user"); localStorage.removeItem("token"); } catch {}
    if (typeof onLogout === "function") onLogout();
    navigate("/");
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#1976d2", boxShadow: "none" }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography variant="h6">Assert Tracking System</Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body1">User</Typography>
          <Avatar alt="User Avatar" src="https://via.placeholder.com/40" />
          <IconButton aria-label="logout" color="inherit" onClick={handleLogout} sx={{ ml: 1 }}>
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
