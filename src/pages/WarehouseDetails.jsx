import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import JsBarcode from "jsbarcode";
import { jsPDF } from "jspdf";

export default function WarehouseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // { row, rack, bin, codeValue }

  useEffect(() => {
    const fetchWarehouse = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/warehouses/${id}`);
        if (!res.ok) throw new Error("Warehouse fetch failed");
        const data = await res.json();
        setWarehouse(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWarehouse();
  }, [id]);

  const onBinClick = (r, rc, b) => {
    if (!warehouse) return;
    const codeValue = `${warehouse.code || `W${warehouse.id}`}-R${r}K${rc}B${b}`;
    setSelected({ row: r, rack: rc, bin: b, codeValue });
  };

  // generate barcode dataURL using offscreen canvas (reliable pixel sizing)
  const generateBarcodeDataUrl = (value) => {
    const canvas = document.createElement("canvas");
    const desiredWidth = 600;
    const desiredHeight = 120;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = desiredWidth * dpr;
    canvas.height = desiredHeight * dpr;
    canvas.style.width = `${desiredWidth}px`;
    canvas.style.height = `${desiredHeight}px`;
    try {
      JsBarcode(canvas, value, {
        format: "CODE128",
        displayValue: true,
        height: 50,
        margin: 10,
      });
    } catch (err) {
      console.error("JsBarcode generation error:", err);
    }
    return canvas.toDataURL("image/png");
  };

  const handlePrintPdf = async () => {
    if (!selected) return;

    // prefer warehouse-level stored image? For per-bin we generate client-side barcode from selected.codeValue
    const dataUrl = generateBarcodeDataUrl(selected.codeValue);

    const pdf = new jsPDF({ orientation: "portrait" });
    const imgProps = pdf.getImageProperties(dataUrl);
    const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(dataUrl, "PNG", 10, 20, pdfWidth, imgHeight);
    pdf.save(`${selected.codeValue}.pdf`);
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (!warehouse) return <Typography>Warehouse not found</Typography>;

  const { name, location, rowses, racks, bins } = warehouse;

  const renderGrid = () =>
    Array.from({ length: rowses }, (_, rIndex) => {
      const r = rIndex + 1;
      return (
        <Box key={`row-${r}`} sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Row {r}</Typography>
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", overflowX: "auto", py: 1 }}>
            {Array.from({ length: racks }, (_, rcIndex) => {
              const rc = rcIndex + 1;
              return (
                <Paper key={`rack-${r}-${rc}`} variant="outlined" sx={{ p: 1, minWidth: 140 }}>
                  <Typography variant="caption" sx={{ mb: 1 }}>Rack {rc}</Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {Array.from({ length: bins }, (_, bIndex) => {
                      const b = bIndex + 1;
                      const label = `${r}-${rc}-${b}`;
                      const binId = `R${r}K${rc}B${b}`;
                      return (
                        <Button
                          key={binId}
                          variant="outlined"
                          size="small"
                          onClick={() => onBinClick(r, rc, b)}
                          sx={{ textTransform: "none", minWidth: 72, p: 0.75 }}
                        >
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{label}</Typography>
                            <Typography variant="caption" display="block" sx={{ color: "#666" }}>{binId}</Typography>
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Warehouse: {warehouse.code || `W${warehouse.id}`}</Typography>
        <Button variant="outlined" onClick={() => navigate("/dashboard/warehouses")}>Back to list</Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Details</Typography>
        <Typography><strong>Name:</strong> {name}</Typography>
        <Typography><strong>Location:</strong> {location}</Typography>
        <Typography><strong>Rows:</strong> {rowses} &nbsp; <strong>Racks/Row:</strong> {racks} &nbsp; <strong>Bins/Rack:</strong> {bins}</Typography>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Layout</Typography>
        {renderGrid()}
      </Paper>

      <Drawer anchor="right" open={!!selected} onClose={() => setSelected(null)}>
        <Box sx={{ width: 340, p: 2 }}>
          <Typography variant="h6">Selected Bin</Typography>
          {selected && (
            <>
              <List>
                <ListItem>
                  <ListItemText primary="Row" secondary={selected.row} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Rack" secondary={selected.rack} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Bin" secondary={selected.bin} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="ID" secondary={`R${selected.row}K${selected.rack}B${selected.bin}`} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Barcode value" secondary={selected.codeValue} />
                </ListItem>
              </List>

              <Box sx={{ mt: 2, textAlign: 'center' }}>
                {/* show generated per-bin barcode preview only (W{ID}-R{r}K{c}B{b}) */}
                <Box sx={{ mt: 2 }}>
                  {selected && (
                    <img
                      src={generateBarcodeDataUrl(selected.codeValue)}
                      alt="Bin barcode"
                      style={{ maxWidth: '100%', height: 'auto', background: '#fff' }}
                    />
                  )}
                </Box>

                <Box display="flex" gap={1} mt={2} justifyContent="center">
                  <Button variant="contained" onClick={handlePrintPdf}>Print barcode (PDF)</Button>
                  <Button variant="outlined" onClick={() => setSelected(null)}>Close</Button>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}