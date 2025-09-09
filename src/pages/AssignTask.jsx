import { Paper, Typography, Box, TextField, Button } from "@mui/material";

export default function AssignTask(){
  return (
    <Paper sx={{ p:3 }}>
      <Typography variant="h5" gutterBottom>Assign Task</Typography>
      <Box component="form" sx={{ display:'flex', flexDirection:'column', gap:2, maxWidth:500 }}>
        <TextField label="Asset Barcode" fullWidth />
        <TextField label="Worker Email/ID" fullWidth />
        <TextField label="Task Details" fullWidth multiline rows={4} />
        <Button variant="contained">Assign</Button>
      </Box>
    </Paper>
  )
}
