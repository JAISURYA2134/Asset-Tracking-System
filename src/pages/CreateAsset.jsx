import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function CreateAsset() {
  const navigate = useNavigate();
  const [assetname, setAssetname] = useState("");
  const [locationId, setLocationId] = useState("");
  const [status, setStatus] = useState("available");
  const [error, setError] = useState("");
  const [imageData, setImageData] = useState(null); // base64 data URL
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [warehouseMeta, setWarehouseMeta] = useState(null); // selected warehouse object
  const [assignedBins, setAssignedBins] = useState(new Set());
  const [pendingBin, setPendingBin] = useState(null); // { r, rc, b }
  const [loading, setLoading] = useState(false);

  // load warehouses for dropdown
  useEffect(() => {
    let mounted = true;
    const fetchWarehouses = async () => {
      try {
        const res = await fetch("/api/warehouses");
        const data = await res.json();
        if (!mounted) return;
        setWarehouses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("fetch warehouses", err);
      }
    };
    fetchWarehouses();
    return () => (mounted = false);
  }, []);

  // update warehouseMeta when warehouseId changes
  useEffect(() => {
    const meta = warehouses.find((w) => String(w.id) === String(warehouseId));
    setWarehouseMeta(meta || null);
    // reset assignments preview when switching warehouse
    setAssignedBins(new Set());
    setLocationId("");
    // reset status to available when switching warehouse
    setStatus("available");
  }, [warehouseId, warehouses]);

  const handleImagePick = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageData(String(ev.target.result)); // data:image/...;base64,...
    };
    reader.readAsDataURL(f);
  };

  const onBinClick = (r, rc, b) => {
    setPendingBin({ r, rc, b });
  };

  const confirmAssign = (yes) => {
    if (yes && pendingBin && warehouseMeta) {
      const binId = `R${pendingBin.r}K${pendingBin.rc}B${pendingBin.b}`;
      // mark assigned
      setAssignedBins((s) => new Set([...s, binId]));
      // set location field to bin id (user requested)
      setLocationId(binId);
      // change status to 'warehouse' when assigned
      setStatus("warehouse");
    }
    setPendingBin(null);
  };

  const validate = () => {
    if (!assetname.trim()) return "Asset name required";
    if (!warehouseMeta) return "Select a warehouse";
    if (!locationId.trim()) return "Assign a bin (location) before submit";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = {
        assetname: assetname.trim(),
        location_id: locationId.trim(),
        status,
        image_data: imageData || null,
        // do not send warehouse_id per request
      };
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError((body && body.message) || `Server error (${res.status})`);
      } else {
        navigate("/dashboard/assets");
      }
    } catch (err) {
      console.error(err);
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  // render warehouse grid using warehouseMeta.rowses, racks, bins
  const renderGrid = () => {
    if (!warehouseMeta) return null;
    const rows = Number(warehouseMeta.rowses || warehouseMeta.rows || 0);
    const racks = Number(warehouseMeta.racks || 0);
    const bins = Number(warehouseMeta.bins || 0);

    return Array.from({ length: rows }, (_, rIndex) => {
      const r = rIndex + 1;
      return (
        <Box key={`row-${r}`} sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Row {r}
          </Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", overflowX: "auto", py: 1 }}>
            {Array.from({ length: racks }, (_, rcIndex) => {
              const rc = rcIndex + 1;
              return (
                <Paper key={`rack-${r}-${rc}`} variant="outlined" sx={{ p: 1, minWidth: 140 }}>
                  <Typography variant="caption" sx={{ mb: 1 }}>
                    Rack {rc}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {Array.from({ length: bins }, (_, bIndex) => {
                      const b = bIndex + 1;
                      const binId = `R${r}K${rc}B${b}`;
                      const assigned = assignedBins.has(binId);
                      return (
                        <Button
                          key={binId}
                          variant="outlined"
                          size="small"
                          onClick={() => onBinClick(r, rc, b)}
                          sx={{
                            textTransform: "none",
                            minWidth: 72,
                            p: 0.75,
                            bgcolor: assigned ? "rgba(255,0,0,0.12)" : "inherit",
                          }}
                        >
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>
                              {`${r}-${rc}-${b}`}
                            </Typography>
                            <Typography variant="caption" display="block" sx={{ color: "#666" }}>
                              {binId}
                            </Typography>
                          </Box>
                        </Button>
                      );
                    })}
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </Box>
      );
    });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Create Asset
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Asset name full width */}
            <Grid item xs={12} md={12}>
              <TextField label="Asset Name" value={assetname} onChange={(e) => setAssetname(e.target.value)} fullWidth required />
            </Grid>

            {/* Image upload - next row under Asset Name */}
            <Grid item xs={12} md={4}>
              <Box>
                <input id="asset-image" type="file" accept="image/*" onChange={handleImagePick} style={{ display: "none" }} />
                <label htmlFor="asset-image">
                  <Button variant="outlined" component="span">
                    Upload Image
                  </Button>
                </label>
                {imageData && (
                  <Avatar variant="rounded" src={imageData} sx={{ width: 80, height: 80, ml: 2, display: "inline-block" }} />
                )}
              </Box>
            </Grid>

            {/* Warehouse dropdown wider */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="warehouse-select-label">Warehouse</InputLabel>
                <Select
                  labelId="warehouse-select-label"
                  value={warehouseId}
                  label="Warehouse"
                  onChange={(e) => setWarehouseId(e.target.value)}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {warehouses.map((w) => (
                    <MenuItem key={w.id} value={w.id}>
                      {w.code || `W${w.id}`} - {w.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Location and Status - visible but not editable */}
            <Grid item xs={12} md={4}>
              <TextField label="Location (bin id)" value={locationId} fullWidth disabled />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField label="Status" value={status} fullWidth disabled />
            </Grid>

            <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Button variant="outlined" onClick={() => navigate("/dashboard/assets")} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={loading}>
                Create
              </Button>
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Typography color="error">{error}</Typography>
              </Grid>
            )}
          </Grid>
        </form>
      </Paper>

      {/* warehouse preview */}
      {warehouseMeta ? (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Layout Preview — {warehouseMeta.code || `W${warehouseMeta.id}`} {warehouseMeta.name ? `- ${warehouseMeta.name}` : ""}
          </Typography>
          {renderGrid()}
        </Paper>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Select a warehouse to preview layout and assign bins.
        </Typography>
      )}

      {/* confirm dialog */}
      <Dialog open={!!pendingBin} onClose={() => confirmAssign(false)}>
        <DialogTitle>Assign to bin</DialogTitle>
        <DialogContent>
          <Typography>
            Assign to {pendingBin ? `R${pendingBin.r}K${pendingBin.rc}B${pendingBin.b}` : ""} ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => confirmAssign(false)}>No</Button>
          <Button onClick={() => confirmAssign(true)} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
