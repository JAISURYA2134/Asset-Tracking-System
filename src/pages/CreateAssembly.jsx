import { Button, TextField, Paper, Typography, Box } from "@mui/material";

export default function CreateAssembly() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Create Assembly Line</Typography>
      <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 400 }}>
        <TextField label="Assembly Name" fullWidth />
        <TextField label="Position Label" fullWidth />
        <TextField label="Barcode" fullWidth />
        <Button variant="contained">Save</Button>
      </Box>
    </Paper>
  );
}
