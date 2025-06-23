// Umm Al-Qura Calendar conversion functions (Gregorian to Hijri) + Offset -4 hari
const ummalqura = {
  toIslamic: function(gregorianDate) {
    const epoch = new Date(622, 6, 16); // 1 Muharram 1 H
    let time = gregorianDate.getTime();
    let daysSinceEpoch = Math.floor((time - epoch.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Koreksi selisih 4 hari
    daysSinceEpoch -= 4;

    let iYear = 1;
    let iMonth = 1;
    let iDay = 1;

    let j = daysSinceEpoch;
    while (j >= 0) {
      const yearLength = this._isLeapYearH(iYear) ? 355 : 354;
      if (j < yearLength) break;
      j -= yearLength;
      iYear++;
    }

    const monthDays = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
    for (let m = 0; m < 12; m++) {
      if (j < monthDays[m]) {
        iMonth = m + 1;
        iDay = j + 1;
        break;
      }
      j -= monthDays[m];
    }

    return { y: iYear, m: iMonth, d: iDay };
  },

  _isLeapYearH(y) {
    return ((14 + 11 * y) % 30) < 11;
  },

  getMonthNameH(m) {
    const months = [
      "Muharram", "Shafar", "Rabi' al-Awwal", "Rabi' al-Thani",
      "Jumada al-Awwal", "Jumada al-Thani", "Rajab", "Sha'ban",
      "Ramadhan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah"
    ];
    return months[m - 1];
  }
};

const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
                   "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

// Inisialisasi flatpickr
const datepicker = flatpickr("#datepicker", {
  dateFormat: "Y-m-d",
  defaultDate: "today",
  onChange: function(selectedDates) {
    generateCalendar(selectedDates[0]);
    loadHolidays(selectedDates[0]);
  }
});

document.getElementById("prevMonth").addEventListener("click", () => {
  const current = new Date(datepicker.selectedDates[0] || new Date());
  current.setMonth(current.getMonth() - 1);
  datepicker.setDate(current, true);
});

document.getElementById("nextMonth").addEventListener("click", () => {
  const current = new Date(datepicker.selectedDates[0] || new Date());
  current.setMonth(current.getMonth() + 1);
  datepicker.setDate(current, true);
});

function generateCalendar(date = new Date()) {
  const calendarBody = document.getElementById("calendarBody");
  const thead = document.querySelector("thead");

  const rowGregorian = thead.querySelectorAll("tr.date-row")[0].querySelectorAll("td");
  const rowHijri = thead.querySelectorAll("tr.date-row")[1].querySelectorAll("td");

  const gregorianMonth = namaBulan[date.getMonth()];
  const gregorianYear = date.getFullYear();

  const hijri = ummalqura.toIslamic(date);
  const hijriMonth = ummalqura.getMonthNameH(hijri.m);

  rowGregorian[0].textContent = date.getDate();
  rowGregorian[1].textContent = gregorianMonth;
  rowGregorian[2].textContent = gregorianYear;

  rowHijri[0].textContent = hijri.d;
  rowHijri[1].textContent = hijriMonth;
  rowHijri[2].textContent = hijri.y;

  calendarBody.innerHTML = "";

  const today = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  let row = document.createElement("tr");

  // Tanggal dari bulan sebelumnya
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = firstDay - 1; i >= 0; i--) {
    const cell = document.createElement("td");
    cell.classList.add("date-cell", "other-month");

    const day = prevMonthLastDay - i;
    cell.innerHTML = `<div class="tgl">${day}</div>`;
    row.appendChild(cell);
  }

  // Tanggal bulan ini
  for (let day = 1; day <= totalDays; day++) {
    const currentDate = new Date(year, month, day);
    const hijri = ummalqura.toIslamic(currentDate);

    const cell = document.createElement("td");
    cell.classList.add("date-cell");

    const dayIndex = currentDate.getDay();
    if (dayIndex === 0) cell.classList.add("hari-minggu");

    // Cek apakah tanggal ini adalah libur
    const isHoliday = holidayData.some(hol => hol.day === day && hol.month === (month + 1));
    if (isHoliday) {
      cell.classList.add("tanggal-libur");
    }

    cell.innerHTML = `<div class="tgl">${day}</div><small class="weton">${hijri.d} ${hitungWeton(currentDate)}</small>`;

    // Indikator hari ini
    if (
      currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    ) {
      const indicator = document.createElement("div");
      indicator.className = "today-indicator";
      cell.appendChild(indicator);
    }

    row.appendChild(cell);

    if ((firstDay + day) % 7 === 0) {
      calendarBody.appendChild(row);
      row = document.createElement("tr");
    }
  }

  // Tanggal dari bulan berikutnya
  const nextMonthDays = (row.children.length < 7) ? 7 - row.children.length : 0;
  for (let i = 1; i <= nextMonthDays; i++) {
    const cell = document.createElement("td");
    cell.classList.add("date-cell", "other-month");
    cell.innerHTML = `<div class="tgl">${i}</div>`;
    row.appendChild(cell);
  }

  if (row.children.length > 0) {
    calendarBody.appendChild(row);
  }
}

function hitungWeton(date) {
  const startDate = new Date(1900, 0, 1);
  const diff = Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
  const wetonList = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"];
  return wetonList[(diff + 1) % 5];
}

let holidayData = [];

function loadHolidays(date = new Date()) {
  const targetMonth = date.getMonth(); // 0-11
  const holidayTable = document.getElementById("holidayTable");
  holidayTable.innerHTML = "<tr><td colspan='2' class='text-center'>Memuat data...</td></tr>";

  fetch('data.xml')
    .then(response => {
      if (!response.ok) throw new Error("Gagal memuat data XML");
      return response.text();
    })
    .then(data => {
      const parser = new DOMParser();
      const xml = parser.parseFromString(data, "application/xml");
      const holidays = xml.querySelectorAll("holiday");

      holidayData = Array.from(holidays).map(hol => ({
        day: parseInt(hol.querySelector("day").textContent),
        month: parseInt(hol.querySelector("month").textContent),
        description: hol.querySelector("description").textContent
      }));

      const filtered = holidayData.filter(hol => hol.month - 1 === targetMonth);

      holidayTable.innerHTML = "";
      if (filtered.length === 0) {
        holidayTable.innerHTML = "<tr><td colspan='2' class='text-center'>Tidak ada libur</td></tr>";
      } else {
        filtered.forEach(hol => {
          const row = document.createElement("tr");
          const monthName = namaBulan[hol.month - 1];
          row.innerHTML = `
            <td>${hol.day} ${monthName}</td>
            <td>${hol.description}</td>
          `;
          holidayTable.appendChild(row);
        });
      }
    })
    .catch(err => {
      holidayTable.innerHTML = `<tr><td colspan='2' class='text-danger text-center'>${err.message}</td></tr>`;
    });
}

generateCalendar(new Date());
loadHolidays(new Date());