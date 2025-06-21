const dateInput = document.getElementById('datepicker');
const today = new Date();
dateInput.value = today.toISOString().substr(0, 10);

function updateTable(date) {
    const tgl = date.getDate();
    const bln = date.toLocaleString('id-ID', { month: 'long' });
    const th = date.getFullYear();
    document.getElementById('tgl').textContent = tgl;
    document.getElementById('bln').textContent = bln;
    document.getElementById('th').textContent = th;
}

// Fungsi navigasi bulan
function changeMonth(delta) {
    let current = new Date(dateInput.value);
    let year = current.getFullYear();
    let month = current.getMonth() + delta;
    let day = current.getDate();

    if (month < 0) {
        month = 11;
        year -= 1;
    } else if (month > 11) {
        month = 0;
        year += 1;
    }
    let lastDay = new Date(year, month + 1, 0).getDate();
    if (day > lastDay) day = lastDay;

    const newDate = new Date(year, month, day);
    dateInput.value = newDate.toISOString().substr(0, 10);
    updateTable(newDate);
}

// Event: navigasi & datepicker input
document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));
dateInput.addEventListener('input', () => updateTable(new Date(dateInput.value)));

// Inisialisasi tabel saat load
updateTable(today);
