// Search form — cabin selection, date defaults, manual search trigger

export let selectedCabin = 'business';

export function initForm() {
  // Set default dates
  const today = new Date();
  const next30 = new Date(today);
  next30.setDate(today.getDate() + 30);
  const next37 = new Date(today);
  next37.setDate(today.getDate() + 37);
  document.getElementById('departDate').value = next30.toISOString().split('T')[0];
  document.getElementById('returnDate').value = next37.toISOString().split('T')[0];
}

export function selectCabin(btn, cabin) {
  document.querySelectorAll('.cabin-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedCabin = cabin;
}

export function syncFormFromParsed(parsed) {
  if (parsed.origin) document.getElementById('origin').value = parsed.origin;
  if (parsed.destination) document.getElementById('destination').value = parsed.destination;
  if (parsed.departDate) document.getElementById('departDate').value = parsed.departDate;
  if (parsed.returnDate) document.getElementById('returnDate').value = parsed.returnDate;
  if (parsed.cabin) {
    selectedCabin = parsed.cabin;
    document.querySelectorAll('.cabin-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.cabin-btn').forEach(b => {
      if (b.textContent.toLowerCase().includes(parsed.cabin.slice(0, 3))) b.classList.add('active');
    });
  }
}

export function getFormParams() {
  return {
    origin: document.getElementById('origin').value.trim(),
    destination: document.getElementById('destination').value.trim(),
    departDate: document.getElementById('departDate').value,
    returnDate: document.getElementById('returnDate').value,
    cabin: selectedCabin,
    program: document.getElementById('program').value,
    passengers: document.getElementById('passengers').value,
  };
}
