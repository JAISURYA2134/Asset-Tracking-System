const express = require('express');
const router = express.Router();
const pool = require('../db');
const bwipjs = require('bwip-js');
const fs = require('fs');
const path = require('path');
const util = require('util');
const toBuffer = util.promisify(bwipjs.toBuffer);

// ensure uploads dir
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'barcodes');
fs.mkdirSync(uploadsDir, { recursive: true });

const absoluteUrl = (req, relPath) => {
  if (!relPath) return null;
  // ensure relPath starts with '/'
  return `${req.protocol}://${req.get('host')}${relPath.startsWith('/') ? relPath : '/' + relPath}`;
};

async function ensureBarcodeFile(code) {
  const filename = `${code}.png`;
  const relPath = `/uploads/barcodes/${filename}`;
  const fullPath = path.join(uploadsDir, filename);
  if (fs.existsSync(fullPath)) return relPath;
  const png = await toBuffer({
    bcid: 'code128',
    text: code,
    scale: 3,
    height: 40,
    includetext: true,
    textxalign: 'center',
  });
  await fs.promises.writeFile(fullPath, png);
  return relPath;
}

// GET single warehouse by id - include rowses etc.
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await pool.query('SELECT id, code, barcode_url, name, location, rowses, racks, bins, created_at FROM warehouses WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Warehouse not found' });
    const row = rows[0];

    // compute disk path safely (strip leading slash)
    const storedRel = row.barcode_url;
    const diskPath = storedRel ? path.join(__dirname, '..', 'public', storedRel.replace(/^\//, '')) : null;

    // If barcode_url missing or file missing, generate it
    if (!storedRel || !fs.existsSync(diskPath)) {
      const code = row.code || `W${row.id}`;
      const barcodeRel = await ensureBarcodeFile(code);
      await pool.query('UPDATE warehouses SET barcode_url = ? WHERE id = ?', [barcodeRel, row.id]);
      row.barcode_url = barcodeRel;
    }

    row.barcode_url = absoluteUrl(req, row.barcode_url);
    return res.json(row);
  } catch (err) {
    console.error('GET /api/warehouses/:id error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET list - include absolute barcode_url
router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim();
  try {
    const sql = q
      ? 'SELECT id, code, barcode_url, name, location, rowses, racks, bins, created_at FROM warehouses WHERE name LIKE ? OR location LIKE ? ORDER BY created_at DESC'
      : 'SELECT id, code, barcode_url, name, location, rowses, racks, bins, created_at FROM warehouses ORDER BY created_at DESC';
    const params = q ? [`%${q}%`, `%${q}%`] : [];
    const [rows] = await pool.query(sql, params);

    const host = `${req.protocol}://${req.get('host')}`;
    const mapped = rows.map(r => ({ ...r, barcode_url: r.barcode_url ? `${host}${r.barcode_url}` : null }));
    res.json(mapped);
  } catch (err) {
    console.error('GET /api/warehouses error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST - create warehouse (note column name 'rowses')
router.post('/', async (req, res) => {
  const { name, location, rows: rowsIn, rowses: rowsesIn, racks, bins } = req.body;
  // support either rows or rowses in request body
  const rowsCount = Number(rowsesIn ?? rowsIn);
  if (!name || !location || !rowsCount || !racks || !bins) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO warehouses (name, location, rowses, racks, bins) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), location.trim(), rowsCount, Number(racks), Number(bins)]
    );
    const insertId = result.insertId;
    const code = `W${insertId}`;
    const barcodeRel = await ensureBarcodeFile(code);
    await pool.query('UPDATE warehouses SET code = ?, barcode_url = ? WHERE id = ?', [code, barcodeRel, insertId]);
    const [rows] = await pool.query('SELECT id, code, barcode_url, name, location, rowses, racks, bins, created_at FROM warehouses WHERE id = ?', [insertId]);
    const row = rows[0];
    row.barcode_url = absoluteUrl(req, row.barcode_url);
    res.status(201).json({ warehouse: row });
  } catch (err) {
    console.error('POST /api/warehouses error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;