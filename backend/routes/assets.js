const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/assets  (optional ?q=search)
router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim();
  try {
    if (q) {
      const like = `%${q}%`;
      const [rows] = await pool.query(
        'SELECT id, code, assetname, location_id, status, created_at FROM assets WHERE assetname LIKE ? OR location_id LIKE ? OR code LIKE ? ORDER BY created_at DESC',
        [like, like, like]
      );
      return res.json(rows);
    }
    const [rows] = await pool.query('SELECT id, code, assetname, location_id, status, created_at FROM assets ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('GET /api/assets error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/assets - create asset, generate code A{insertId}
router.post('/', async (req, res) => {
  const { assetname, location_id, status, image_data } = req.body; // ignore warehouse_id from client

  if (!assetname) return res.status(400).json({ message: 'Asset name is required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO assets (assetname, location_id, status, image_data) VALUES (?, ?, ?, ?)',
      [assetname.trim(), location_id || null, status || 'available', image_data || null]
    );
    const insertId = result.insertId;
    const code = `A${insertId}`;
    await pool.query('UPDATE assets SET code = ? WHERE id = ?', [code, insertId]);

    const [rows] = await pool.query('SELECT id, code, assetname, location_id, status, image_data, created_at FROM assets WHERE id = ?', [insertId]);
    res.status(201).json({ asset: rows[0] });
  } catch (err) {
    console.error('POST /api/assets error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;