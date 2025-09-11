import React, { useEffect, useState, useMemo } from "react";
import { Box, Paper, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { useNavigate } from "react-router-dom";

export default function Assets() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  // default descending so newest first
  const [sortOrder, setSortOrder] = useState("desc");

  // pagination
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  const normalize = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.assets && Array.isArray(data.assets)) return data.assets;
    if (data.asset) return [data.asset];
    return [];
  };

  const fetchList = async (search = "") => {
    setLoading(true);
    try {
      const url = `/api/assets${search ? `?q=${encodeURIComponent(search)}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      setAssets(normalize(data));
      setPage(1);
    } catch (err) {
      console.error('fetch assets error', err);
      setAssets([]);
      setPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => fetchList(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const codeNumber = (a) => {
    if (!a) return 0;
    const code = (a.code || (`A${a.id || 0}`)).toString();
    const m = code.match(/\d+/);
    return m ? parseInt(m[0], 10) : Number(a.id) || 0;
  };

  const sorted = useMemo(() => {
    const list = Array.isArray(assets) ? [...assets] : [];
    list.sort((a, b) => (sortOrder === "asc" ? codeNumber(a) - codeNumber(b) : codeNumber(b) - codeNumber(a)));
    return list;
  }, [assets, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, totalPages]);

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, page]);

  const toggleSort = () => setSortOrder(s => (s === "asc" ? "desc" : "asc"));
  const goPrev = () => setPage(p => Math.max(1, p - 1));
  const goNext = () => setPage(p => Math.min(totalPages, p + 1));

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField label="Search" value={q} onChange={(e) => setQ(e.target.value)} size="small" />
        </Box>

        <Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/dashboard/create-asset")}>
            Create
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: 'grey.100', fontWeight: 700, cursor: 'pointer' }} onClick={toggleSort}>
                <Box display="inline-flex" alignItems="center" gap={1}>Code {sortOrder === 'desc' ? <ArrowDownwardIcon fontSize="small"/> : <ArrowUpwardIcon fontSize="small"/>}</Box>
              </TableCell>
              <TableCell sx={{ bgcolor: 'grey.100', fontWeight: 700 }}>Asset Name</TableCell>
              <TableCell sx={{ bgcolor: 'grey.100', fontWeight: 700 }}>Created Date</TableCell>
              <TableCell sx={{ bgcolor: 'grey.100', fontWeight: 700 }}>Location ID</TableCell>
              <TableCell sx={{ bgcolor: 'grey.100', fontWeight: 700 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paged.length > 0 ? (
              paged.map(a => (
                <TableRow key={a.id} hover>
                  <TableCell>
                    <Button variant="text" onClick={() => navigate(`/dashboard/assets/${a.id}`)} sx={{ textTransform: 'none', fontWeight: 700 }}>
                      {a.code || `A${a.id}`}
                    </Button>
                  </TableCell>
                  <TableCell>{a.assetname}</TableCell>
                  <TableCell>{new Date(a.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{a.location_id}</TableCell>
                  <TableCell>{a.status}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">{loading ? 'Loading...' : 'No assets found'}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
        <Box>
          <Button variant="outlined" onClick={goPrev} disabled={page <= 1} sx={{ mr: 1 }}>Prev</Button>
          <Button variant="outlined" onClick={goNext} disabled={page >= totalPages || sorted.length === 0}>Next</Button>
        </Box>

        <Box>
          <Typography variant="body2">Page {page} of {totalPages} — {sorted.length} item{sorted.length !== 1 ? 's' : ''}</Typography>
        </Box>
      </Box>
    </Box>
  );
}