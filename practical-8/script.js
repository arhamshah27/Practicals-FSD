let count = 0;

async function fetchCount() {
  const res = await fetch('/api/count');
  const data = await res.json();
  count = data.count;
  document.getElementById('count').textContent = count;
}

async function updateCount(change) {
  count += change;
  await fetch('/api/count', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count })
  });
  document.getElementById('count').textContent = count;
}

async function resetCount() {
  count = 0;
  await fetch('/api/count', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count })
  });
  document.getElementById('count').textContent = count;
}

fetchCount();
