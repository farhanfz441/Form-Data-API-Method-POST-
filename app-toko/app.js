// ========================
// app.js — Logika PWA Toko
// ========================

let allData = [];

// Render statistik
function renderStats(data) {
  const totalEl = document.getElementById("statTotal");
  const minEl   = document.getElementById("statMin");
  const maxEl   = document.getElementById("statMax");

  if (!data || data.length === 0) {
    totalEl.textContent = "0";
    minEl.textContent   = "Rp 0";
    maxEl.textContent   = "Rp 0";
    return;
  }

  const prices = data.map(i => Number(i.harga));

  totalEl.textContent = data.length;
  minEl.textContent   = "Rp " + Math.min(...prices).toLocaleString("id-ID");
  maxEl.textContent   = "Rp " + Math.max(...prices).toLocaleString("id-ID");
}

// Render tabel
function renderTable(data) {
  const tbody = document.getElementById("tabel-barang");

  if (!data || data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3">
          <div class="empty-state"><p>Tidak ada data barang</p></div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = data.map(item => `
    <tr>
      <td class="id-cell">#${String(item.id).padStart(3, "0")}</td>
      <td><span class="name-cell">${item.nama_barang}</span></td>
      <td class="price-cell"><span class="price-badge">Rp ${Number(item.harga).toLocaleString("id-ID")}</span></td>
    </tr>
  `).join("");
}

// Filter pencarian
document.getElementById("searchInput").addEventListener("input", function () {
  const q = this.value.toLowerCase();
  const filtered = allData.filter(i => i.nama_barang.toLowerCase().includes(q));
  renderTable(filtered);
});

// Ambil data dari API
function loadData() {
  fetch("http://program31.test/api-toko/get_barang.php")
    .then(res => res.json())
    .then(res => {
      // Support dua format response: res.data atau langsung array
      allData = Array.isArray(res) ? res : (res.data || []);
      renderStats(allData);
      renderTable(allData);
    })
    .catch(() => {
      document.getElementById("tabel-barang").innerHTML = `
        <tr>
          <td colspan="3">
            <div class="empty-state"><p>Gagal memuat data dari server</p></div>
          </td>
        </tr>`;
    });
}

// Service Worker (PWA)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

// Jalankan
loadData();