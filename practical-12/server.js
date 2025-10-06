const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

function parseNumber(value) {
  if (value === undefined || value === null) return { ok: false, error: 'Missing number' };
  const num = Number(value);
  if (Number.isNaN(num)) return { ok: false, error: 'Invalid number' };
  return { ok: true, value: num };
}

app.post('/api/calculate', (req, res) => {
  const { a, b, op } = req.body;
  const pa = parseNumber(a);
  const pb = parseNumber(b);
  if (!pa.ok || !pb.ok) {
    return res.status(400).json({ error: pa.ok ? pb.error : pa.error });
  }
  const x = pa.value;
  const y = pb.value;
  let result;
  switch (op) {
    case 'add':
      result = x + y;
      break;
    case 'sub':
      result = x - y;
      break;
    case 'mul':
      result = x * y;
      break;
    case 'div':
      if (y === 0) return res.status(400).json({ error: 'Division by zero' });
      result = x / y;
      break;
    default:
      return res.status(400).json({ error: 'Unknown operation' });
  }

  return res.json({ result });
});

// simple health
app.get('/api/ping', (req, res) => res.json({ ok: true }));

app.listen(port, () => console.log(`Calculator server running on http://localhost:${port}`));
