// filepath: d:\Assert_Track_System\asset-tracking\src\pages\Warehouses.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { useNavigate } from "react-router-dom";

export default function Warehouses() {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  // sort state: 'desc' by default so newest entries (higher id) appear first
  const [sortOrder, setSortOrder] = useState("desc");

  // pagination state
  const PAGE_SIZE = 5;
  const [page, setPage] = useState(1);

  const normalizeList = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.warehouses && Array.isArray(data.warehouses)) return data.warehouses;
    if (data.warehouse) return [data.warehouse];
    return [];
  };

  const fetchList = async (search = "") => {
    setLoading(true);
    try {
      const url = `/api/warehouses${search ? `?q=${encodeURIComponent(search)}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      setWarehouses(normalizeList(data));
      setPage(1); // reset to first page on fresh fetch/search
    } catch (err) {
      console.error("fetch warehouses error", err);
      setWarehouses([]);
      setPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchList(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  // extract numeric part of code (W7 -> 7). fallback to id when code missing or unparsable.
  const codeNumber = (w) => {
    if (!w) return 0;
    const code = (w.code || (`W${w.id || 0}`)).toString();
    const m = code.match(/\d+/);
    return m ? parseInt(m[0], 10) : Number(w.id) || 0;
  };
  
  // memoized sorted list based on sortOrder
  const sortedWarehouses = useMemo(() => {
    const list = Array.isArray(warehouses) ? [...warehouses] : [];
    list.sort((a, b) => {
      const na = codeNumber(a);
      const nb = codeNumber(b);
      return sortOrder === "asc" ? na - nb : nb - na;
    });
    return list;
  }, [warehouses, sortOrder]);

  // pagination: compute total pages and current page slice
  const totalPages = Math.max(1, Math.ceil(sortedWarehouses.length / PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, totalPages]);

  const pagedWarehouses = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sortedWarehouses.slice(start, start + PAGE_SIZE);
  }, [sortedWarehouses, page]);

  const toggleSort = () => setSortOrder((s) => (s === "asc" ? "desc" : "asc"));

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <TextField label="Search" value={q} onChange={(e) => setQ(e.target.value)} size="small" />
        </Box>

        <Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/dashboard/create-warehouse")}>
            Create
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{ bgcolor: "grey.100", fontWeight: 700, cursor: "pointer", userSelect: "none" }}
                onClick={toggleSort}
              >
                <Box display="inline-flex" alignItems="center" gap={1}>
                  Code
                  {sortOrder === "desc" ? (
                    <ArrowDownwardIcon fontSize="small" />
                  ) : (
                    <ArrowUpwardIcon fontSize="small" />
                  )}
                </Box>
              </TableCell>
              <TableCell sx={{ bgcolor: 'grey.100', fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ bgcolor: 'grey.100', fontWeight: 700 }}>Location</TableCell>
              <TableCell align="right" sx={{ bgcolor: 'grey.100', fontWeight: 700 }}>Rows</TableCell>
              <TableCell align="right" sx={{ bgcolor: 'grey.100', fontWeight: 700 }}>Racks/Row</TableCell>
              <TableCell align="right" sx={{ bgcolor: 'grey.100', fontWeight: 700 }}>Bins/Rack</TableCell>
              <TableCell sx={{ bgcolor: 'grey.100', fontWeight: 700 }}>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(pagedWarehouses) && pagedWarehouses.length > 0 ? (
              pagedWarehouses.map((w) => (
                <TableRow key={w.id} hover>
                  <TableCell>
                    <Button variant="text" onClick={() => navigate(`/dashboard/warehouses/${w.id}`)} sx={{ textTransform: "none", fontWeight: 700 }}>
                      {w.code || `W${w.id}`}
                    </Button>
                  </TableCell>
                  <TableCell>{w.name}</TableCell>
                  <TableCell>{w.location}</TableCell>
                  <TableCell align="right">{w.rowses}</TableCell>
                  <TableCell align="right">{w.racks}</TableCell>
                  <TableCell align="right">{w.bins}</TableCell>
                  <TableCell>{new Date(w.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {loading ? "Loading..." : "No warehouses found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* pagination controls */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
        <Box>
          <Button onClick={goPrev} disabled={page <= 1} variant="outlined" sx={{ mr: 1 }}>
            Prev
          </Button>
          <Button onClick={goNext} disabled={page >= totalPages || sortedWarehouses.length === 0} variant="outlined">
            Next
          </Button>
        </Box>

        <Box>
          <Typography variant="body2">
            Page {page} of {totalPages} — {sortedWarehouses.length} item{sortedWarehouses.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}