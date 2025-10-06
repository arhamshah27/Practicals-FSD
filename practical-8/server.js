const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const counterFile = path.join(__dirname, 'counter.json');

app.use(express.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// Helper to load counter
function loadCounter() {
  if (!fs.existsSync(counterFile)) {
    fs.writeFileSync(counterFile, JSON.stringify({ count: 0 }));
  }
  const data = fs.readFileSync(counterFile);
  return JSON.parse(data).count;
}

// Helper to save counter
function saveCounter(count) {
  fs.writeFileSync(counterFile, JSON.stringify({ count }));
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/count', (req, res) => {
  const count = loadCounter();
  res.json({ count });
});

app.post('/api/count', (req, res) => {
  const { count } = req.body;
  saveCounter(count);
  res.json({ count });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
