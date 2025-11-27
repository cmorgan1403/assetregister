const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Company settings
let companyName = 'Meraki Communications';

// In-memory data store for assets
let assets = [
  {
    id: 10247,
    name: 'Dell Laptop',
    category: 'Electronics',
    serialNumber: 'DL-2023-001',
    purchaseDate: '2023-01-15',
    value: 950,
    status: 'Active',
    location: 'Office A'
  },
  {
    id: 20583,
    name: 'Office Chair',
    category: 'Furniture',
    serialNumber: 'OC-2023-045',
    purchaseDate: '2023-03-20',
    value: 280,
    status: 'Active',
    location: 'Office B'
  },
  {
    id: 30891,
    name: 'HP Printer',
    category: 'Electronics',
    serialNumber: 'HP-2022-789',
    purchaseDate: '2022-11-10',
    value: 360,
    status: 'Under Maintenance',
    location: 'Storage'
  }
];

let nextId = 40000 + Math.floor(Math.random() * 10000);

// Routes
app.get('/', (req, res) => {
  const { sort, order = 'asc', search = '' } = req.query;
  
  let filteredAssets = [...assets];
  
  // Search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredAssets = filteredAssets.filter(asset => 
      asset.name.toLowerCase().includes(searchLower) ||
      asset.category.toLowerCase().includes(searchLower) ||
      asset.serialNumber.toLowerCase().includes(searchLower) ||
      asset.status.toLowerCase().includes(searchLower) ||
      asset.location.toLowerCase().includes(searchLower)
    );
  }
  
  // Sorting
  if (sort) {
    filteredAssets.sort((a, b) => {
      let aVal = a[sort];
      let bVal = b[sort];
      
      // Handle numeric values
      if (sort === 'value' || sort === 'id') {
        aVal = Number(aVal);
        bVal = Number(bVal);
      }
      
      // Handle dates
      if (sort === 'purchaseDate') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      // Handle strings
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (order === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
  }
  
  res.render('index', { 
    assets: filteredAssets, 
    sort, 
    order,
    search,
    totalAssets: assets.length,
    totalValue: assets.reduce((sum, asset) => sum + asset.value, 0),
    companyName
  });
});

// Add new asset
app.post('/assets', (req, res) => {
  const { name, category, serialNumber, purchaseDate, value, status, location } = req.body;
  
  const newAsset = {
    id: nextId,
    name,
    category,
    serialNumber,
    purchaseDate,
    value: parseFloat(value),
    status,
    location
  };
  
  assets.push(newAsset);
  nextId += Math.floor(Math.random() * 1000) + 100;
  res.redirect('/');
});

// Delete asset
app.post('/assets/:id/delete', (req, res) => {
  const id = parseInt(req.params.id);
  assets = assets.filter(asset => asset.id !== id);
  res.redirect('/');
});

// Update asset
app.post('/assets/:id/update', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, category, serialNumber, purchaseDate, value, status, location } = req.body;
  
  const assetIndex = assets.findIndex(asset => asset.id === id);
  
  if (assetIndex !== -1) {
    assets[assetIndex] = {
      id,
      name,
      category,
      serialNumber,
      purchaseDate,
      value: parseFloat(value),
      status,
      location
    };
  }
  
  res.redirect('/');
});

// Get asset by ID (for editing)
app.get('/assets/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const asset = assets.find(asset => asset.id === id);
  res.json(asset);
});

// Print label for asset
app.get('/assets/:id/label', (req, res) => {
  const id = parseInt(req.params.id);
  const asset = assets.find(asset => asset.id === id);
  if (asset) {
    res.render('label', { asset, companyName });
  } else {
    res.redirect('/');
  }
});

// Update company name
app.post('/settings/company', (req, res) => {
  const { name } = req.body;
  if (name && name.trim()) {
    companyName = name.trim();
  }
  res.json({ success: true, companyName });
});

app.listen(PORT, () => {
  console.log(`Asset Register running on http://localhost:${PORT}`);
});
