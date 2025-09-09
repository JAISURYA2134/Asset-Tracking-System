const express = require('express');
const router = express.Router();
const pool = require('../db');
const bwipjs = require('bwip-js');
const util = require('util');
const toBuffer = util.promisify(bwipjs.toBuffer);

// helper: generate PNG buffer and return data URL (base64)
async function generateBarcodeDataUrl(code) {
  const png = await toBuffer({
    bcid: 'code128',
    text: code,
    scale: 3,
    height: 40,
    includetext: true,
    textxalign: 'center',
  });
  return `data:image/png;base64,${png.toString('base64')}`;
}

// POST /api/warehouses - create new warehouse and store barcode data-url
router.post('/', async (req, res) => {
  const { name, location, rows: rowsIn, rowses: rowsesIn, racks, bins } = req.body;
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

    // generate data-url and store in DB (barcode_url column)
    const barcodeDataUrl = await generateBarcodeDataUrl(code);
    await pool.query('UPDATE warehouses SET code = ?, barcode_url = ? WHERE id = ?', [code, barcodeDataUrl, insertId]);

    const [rows] = await pool.query('SELECT id, code, barcode_url, name, location, rowses, racks, bins, created_at FROM warehouses WHERE id = ?', [insertId]);
    res.status(201).json({ warehouse: rows[0] });
  } catch (err) {
    console.error('POST /api/warehouses error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET list - return stored data-urls as-is
router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim();
  try {
    const sql = q
      ? 'SELECT id, code, barcode_url, name, location, rowses, racks, bins, created_at FROM warehouses WHERE name LIKE ? OR location LIKE ? ORDER BY created_at DESC'
      : 'SELECT id, code, barcode_url, name, location, rowses, racks, bins, created_at FROM warehouses ORDER BY created_at DESC';
    const params = q ? [`%${q}%`, `%${q}%`] : [];
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/warehouses error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET single warehouse by id - return data-url
router.get('/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await pool.query('SELECT id, code, barcode_url, name, location, rowses, racks, bins, created_at FROM warehouses WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Warehouse not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('GET /api/warehouses/:id error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;