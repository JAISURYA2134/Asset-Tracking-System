import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Toolbar,
  Collapse,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import FiberManualRecord from "@mui/icons-material/FiberManualRecord";

const Sidebar = ({ activePage, setActivePage, open, setOpen }) => {
  const drawerWidth = open ? 200 : 60;

  const navigate = useNavigate();
  const location = useLocation();

  const [openGroups, setOpenGroups] = useState({});

  const toggleGroup = (key) => {
    // open only the clicked group (accordion-style) - comment out the next line
    // if you prefer multiple open groups, replace with previous behaviour
    setOpenGroups({ [key]: !openGroups[key] });
  };

  // Keep activePage in sync with current URL so highlight follows navigation
  useEffect(() => {
    const p = location.pathname || "";
    if (p.includes("/dashboard/assets") || p.includes("/dashboard/create-asset")) {
      setActivePage("Assets");
      setOpenGroups((s) => ({ ...s, Assets: true }));
    } else if (p.includes("/dashboard/warehouses") || p.includes("/dashboard/create-warehouse")) {
      setActivePage("Warehouse");
      setOpenGroups((s) => ({ ...s, Warehouse: true }));
    } else if (p.includes("/dashboard/assembly") || p.includes("/dashboard/create-assembly")) {
      setActivePage("Assembly Line");
      setOpenGroups((s) => ({ ...s, "Assembly Line": true }));
    } else if (p.includes("/dashboard/assign-task")) {
      setActivePage("Assign Task");
      setOpenGroups({});
    } else if (p.includes("/dashboard/worker")) {
      setActivePage("Worker");
      setOpenGroups((s) => ({ ...s, Worker: true }));
    } else {
      setActivePage("Dashboard");
      setOpenGroups({});
    }
  }, [location.pathname, setActivePage]);

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    {
      text: "Assets",
      icon: <Inventory2Icon />,
      children: [
        { text: "Dashboard", path: "/dashboard" },
        { text: "Asset Creation", path: "/dashboard/create-asset" },
      ],
    },
    {
      text: "Warehouse",
      icon: <WarehouseIcon />,
      children: [
        { text: "Dashboard", path: "/dashboard" },
        { text: "Warehouse Creation", path: "/dashboard/warehouses" },
      ],
    },
    {
      text: "Assembly Line",
      icon: <PrecisionManufacturingIcon />,
      children: [
        { text: "Dashboard", path: "/dashboard" },
        { text: "Assembly Creation", path: "/dashboard/create-assembly" },
      ],
    },
    { text: "Assign Task", icon: <AssignmentIcon />, path: "/dashboard/assign-task" },
    {
      text: "Worker",
      icon: <PeopleIcon />,
      children: [
        { text: "Dashboard", path: "/dashboard" },
        { text: "Tasks", path: "/dashboard/worker/tasks" },
      ],
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          // slower, smoother transition
          transition: "width 450ms cubic-bezier(0.2, 0, 0, 1)",
          overflowX: "hidden",
        },
      }}
    >
      {/* Top Menu Icon */}
      <Toolbar sx={{ display: "flex", justifyContent: open ? "flex-end" : "center" }}>
        <IconButton onClick={() => setOpen(!open)} aria-label="toggle sidebar">
          <MenuIcon />
        </IconButton>
      </Toolbar>

      {/* Sidebar Menu */}
      <List>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem
              disablePadding
              sx={{
                bgcolor: activePage === item.text ? "rgba(25,118,210,0.08)" : "transparent",
                "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
              }}
            >
              <ListItemButton
                onClick={() => {
                  setActivePage(item.text);
                  if (item.path && !item.children) navigate(item.path);
                  if (item.children) toggleGroup(item.text);
                }}
                sx={{ minHeight: 48 }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                {open && (
                  <ListItemText primary={item.text} primaryTypographyProps={{ style: { color: "#111" } }} />
                )}
                {item.children && open && (openGroups[item.text] ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
            </ListItem>

            {item.children && (
              <Collapse in={open && !!openGroups[item.text]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItem key={child.text} disablePadding>
                      <ListItemButton
                        onClick={() => {
                          setActivePage(item.text);
                          navigate(child.path);
                        }}
                        sx={{ pl: open ? 4 : 2 }}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <FiberManualRecord sx={{ fontSize: 12, color: "#757575" }} />
                        </ListItemIcon>
                        {open && (
                          <ListItemText
                            primary={child.text}
                            primaryTypographyProps={{ style: { color: "#333", fontSize: 14 } }}
                          />
                        )}
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
