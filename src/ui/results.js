// Results panel — renders flight cards and handles filters

let currentResults = [];

export function showLoading() {
  document.getElementById('resultsBody').innerHTML = `
    <div class="loading-state">
      <div class="loading-ring"></div>
      <div class="loading-text">SEARCHING AWARD SPACE...</div>
    </div>`;
  document.getElementById('resultsMeta').innerHTML = 'Searching...';
}

export function showError(msg) {
  document.getElementById('resultsBody').innerHTML = `
    <div class="empty-state">
      <div class="empty-title">Error</div>
      <div class="empty-sub">${msg}</div>
    </div>`;
}

export function displayResults(results, params) {
  currentResults = results;
  const body = document.getElementById('resultsBody');
  const meta = document.getElementById('resultsMeta');
  const filterRow = document.getElementById('filterRow');
  const seatsKey = localStorage.getItem('milechain_seats_key');

  const origin = params.origin || '?';
  const dest = params.destination || '?';
  meta.innerHTML = `<strong>${results.length} results</strong> · ${origin} → ${dest} · ${params.cabin || 'business'} class · ${seatsKey ? 'live data' : 'mock data'}`;
  filterRow.style.display = 'flex';

  if (results.length === 0) {
    body.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <div class="empty-title">No results found</div>
        <div class="empty-sub">Try different dates or cabin class</div>
      </div>`;
    return;
  }

  body.innerHTML = '<div class="flights-grid" id="flightsGrid"></div>';
  const grid = document.getElementById('flightsGrid');

  results.forEach((r, idx) => {
    const card = document.createElement('div');
    card.className = 'flight-card';
    card.style.animationDelay = `${idx * 0.05}s`;
    card.dataset.stops = r.stops;
    card.dataset.miles = r.miles;
    card.innerHTML = `
      <div class="flight-endpoint">
        <div class="flight-time">${r.departTime}</div>
        <div class="flight-airport">${r.origin}</div>
      </div>
      <div class="flight-middle">
        <div class="flight-duration">${r.duration}</div>
        <div class="flight-line"><div class="flight-line-bar"></div></div>
        <div class="flight-stops ${r.stops === 0 ? 'nonstop' : ''}">${r.stops === 0 ? 'nonstop' : r.stops + ' stop'}</div>
      </div>
      <div class="flight-endpoint">
        <div class="flight-time">${r.arriveTime}</div>
        <div class="flight-airport">${r.destination}</div>
      </div>
      <div class="flight-info">
        <div class="flight-program">
          <div class="program-dot" style="background:${r.color}"></div>
          <div class="program-name">${r.program}</div>
        </div>
        <div class="flight-miles">${r.miles.toLocaleString()}</div>
        <div class="flight-miles-label">miles + $${r.taxes.toFixed(2)}</div>
        <div class="cabin-tag ${r.cabin}">${r.cabin}</div>
        <button class="book-btn" onclick="window.openBooking('${r.bookingUrl}','${r.carrier}')">BOOK →</button>
      </div>`;
    grid.appendChild(card);
  });

  return results.reduce((a, b) => a.miles < b.miles ? a : b); // return best deal
}

export function filterResults(type, btn) {
  document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('.flight-card').forEach(card => {
    if (type === 'all') { card.style.display = ''; return; }
    if (type === 'nonstop') { card.style.display = card.dataset.stops === '0' ? '' : 'none'; return; }
    if (type === 'best') {
      const allMiles = currentResults.map(r => r.miles);
      const min = Math.min(...allMiles);
      card.style.display = parseInt(card.dataset.miles) <= min * 1.1 ? '' : 'none';
    }
  });
}
