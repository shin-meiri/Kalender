// Set default ke hari ini
const dateInput = document.getElementById('datepicker');
const today = new Date();
dateInput.value = today.toISOString().substr(0, 10);

// Fungsi untuk tambah/kurangi bulan
function changeMonth(delta) {
    let current = new Date(dateInput.value);
    let year = current.getFullYear();
    let month = current.getMonth() + delta; // delta bisa -1 (prev) atau +1 (next)
    let day = current.getDate();

    // Cek overflow bulan
    if (month < 0) {
        month = 11;
        year -= 1;
    } else if (month > 11) {
        month = 0;
        year += 1;
    }

    // Set tanggal ke tanggal yang valid jika bulan baru punya hari lebih sedikit (misal, Feb)
    let lastDay = new Date(year, month + 1, 0).getDate();
    if (day > lastDay) day = lastDay;

    const newDate = new Date(year, month, day);
    dateInput.value = newDate.toISOString().substr(0, 10);
}

document.getElementById('prevMonth').addEventListener('click', () => changeMonth(-1));
document.getElementById('nextMonth').addEventListener('click', () => changeMonth(1));
