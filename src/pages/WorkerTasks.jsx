import { Paper, Typography } from "@mui/material";

export default function WorkerTasks(){
  return (
    <Paper sx={{ p:3 }}>
      <Typography variant="h5">Worker Tasks</Typography>
      <Typography>List of tasks assigned to worker</Typography>
    </Paper>
  )
}
