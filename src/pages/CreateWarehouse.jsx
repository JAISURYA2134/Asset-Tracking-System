import React, { useState } from "react";
import { Box, Paper, Typography, TextField, Button, Grid, Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function CreateWarehouse() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [rowses, setrowses] = useState(2);
  const [racks, setRacks] = useState(2);
  const [bins, setBins] = useState(4);
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const MAX_ROWS = 20;
  const MAX_RACKS = 20;
  const MAX_BINS = 200;

  const validate = () => {
    if (!name.trim() || !location.trim()) return "Warehouse Name and Location are required";
    if (!rowses || !racks || !bins) return "rowses, Racks and Bins are required";
    if (rowses > MAX_ROWS || racks > MAX_RACKS || bins > MAX_BINS) return `Limits: rowses<=${MAX_ROWS}, Racks<=${MAX_RACKS}, Bins<=${MAX_BINS}`;
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) { setError(v); return; }

    // Build explicit payload with parsed numbers
    const payload = {
      name: (name || "").trim(),
      location: (location || "").trim(),
      rowses: Number(rowses),
      racks: Number(racks),
      bins: Number(bins),
    };

    console.log("CreateWarehouse payload:", payload);

    // Basic client-side sanity check
    if (!payload.name || !payload.location || !payload.rowses || !payload.racks || !payload.bins) {
      setError("All fields are required (client validation)");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/warehouses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => null);
      console.log("CreateWarehouse response status:", res.status, "body:", body);

      if (!res.ok) {
        // show server message if available
        setError((body && body.message) || `Server error (${res.status})`);
      } else {
        setOpenSnackbar(true);
        setTimeout(() => navigate("/dashboard/warehouses"), 700);
      }
    } catch (err) {
      console.error("Network error:", err);
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  // simplified preview (you can reuse your previous renderPreview)
  const renderPreview = () => {
    const preview = [];
    for (let r = 1; r <= rowses; r++) {
      const racksRow = [];
      for (let rc = 1; rc <= racks; rc++) {
        const binsRow = [];
        for (let b = 1; b <= bins; b++) {
          const id = `R${r}K${rc}B${b}`;
          binsRow.push(
            <Box key={id} sx={{ border: '1px solid #ccc', borderRadius: 1, p: 0.5, minWidth: 64, textAlign: 'center', bgcolor: '#fafafa', mx: 0.5, my: 0.5 }}>
              <Typography variant="caption">{`${r}-${rc}-${b}`}</Typography>
              <Typography variant="caption" display="block" sx={{ color: '#666' }}>{id}</Typography>
            </Box>
          );
        }
        racksRow.push(<Box key={`R${r}C${rc}`} sx={{ mr: 1 }}>{binsRow}</Box>);
      }
      preview.push(
        <Box key={`row-${r}`} sx={{ mb: 1 }}>
          <Typography variant="subtitle2">Row {r}</Typography>
          <Box sx={{ display: 'flex', overflowX: 'auto', py: 1 }}>{racksRow}</Box>
        </Box>
      );
    }
    return preview;
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Warehouse Creation</Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField label="Warehouse Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth required />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Location" value={location} onChange={(e) => setLocation(e.target.value)} fullWidth required />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField label="Rows" type="number" value={rowses} onChange={(e) => setrowses(Math.max(1, Math.min(MAX_ROWS, Number(e.target.value || 0))))} fullWidth required inputProps={{ min: 1, max: MAX_ROWS }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Racks" type="number" value={racks} onChange={(e) => setRacks(Math.max(1, Math.min(MAX_RACKS, Number(e.target.value || 0))))} fullWidth required inputProps={{ min: 1, max: MAX_RACKS }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Bins" type="number" value={bins} onChange={(e) => setBins(Math.max(1, Math.min(MAX_BINS, Number(e.target.value || 0))))} fullWidth required inputProps={{ min: 1, max: MAX_BINS }} />
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => navigate('/dashboard/warehouses')} disabled={submitting}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={submitting}>Submit</Button>
            </Grid>
          </Grid>
        </form>
        {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Preview</Typography>
        {renderPreview()}
      </Paper>

      <Snackbar open={openSnackbar} autoHideDuration={2500} onClose={() => setOpenSnackbar(false)}>
        <Alert severity="success" onClose={() => setOpenSnackbar(false)}>Warehouse created</Alert>
      </Snackbar>
    </Box>
  );
}
