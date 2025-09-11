const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const warehouseRoutes = require('./routes/warehouses'); // add this
const assetsRoutes = require('./routes/assets');

require('dotenv').config();
const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded files (barcodes)
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/warehouses', warehouseRoutes); // mount warehouses
app.use('/api/assets', assetsRoutes);

app.get('/', (req, res) => res.send('API running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));