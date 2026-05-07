// ========================
// app.js — Logika PWA Toko
// CRUD Lengkap: Create, Read, Update, Delete
// ========================

const BASE_URL = "http://program31.test/api-toko";
let allData   = [];
let modeEdit  = false;

// ========================
// TOAST NOTIFIKASI
// ========================
function showToast(pesan) {
  const toast = document.getElementById("toast");
  toast.textContent = pesan;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2800);
}

// ========================
// RESPONSE MESSAGE (form)
// ========================
function showResponse(pesan, tipe = "success") {
  const el = document.getElementById("response");
  el.textContent = pesan;
  el.style.display = "block";
  if (tipe === "success") {
    el.style.color      = "#1a7a4a";
    el.style.background = "rgba(39,174,96,0.1)";
    el.style.border     = "1px solid rgba(39,174,96,0.25)";
  } else {
    el.style.color      = "#c0392b";
    el.style.background = "rgba(231,76,60,0.1)";
    el.style.border     = "1px solid rgba(231,76,60,0.25)";
  }
  setTimeout(() => { el.style.display = "none"; }, 3000);
}

// ========================
// RENDER STATISTIK
// ========================
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

  const prices        = data.map(i => Number(i.harga));
  totalEl.textContent = data.length;
  minEl.textContent   = "Rp " + Math.min(...prices).toLocaleString("id-ID");
  maxEl.textContent   = "Rp " + Math.max(...prices).toLocaleString("id-ID");
}

// ========================
// RENDER TABEL
// ========================
function renderTable(data) {
  const tbody = document.getElementById("tabel-barang");

  if (!data || data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4">
          <div class="empty-state"><p>Tidak ada data barang</p></div>
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = data.map(item => `
    <tr>
      <td class="id-cell">#${String(item.id).padStart(3, "0")}</td>
      <td><span class="name-cell">${item.nama_barang}</span></td>
      <td><span class="price-badge">Rp ${Number(item.harga).toLocaleString("id-ID")}</span></td>
      <td class="action-cell">
        <div class="btn-group">
          <button class="btn-edit"  onclick="mulaiEdit(${item.id}, '${item.nama_barang}', ${item.harga})">Edit</button>
          <button class="btn-hapus" onclick="hapusBarang(${item.id}, '${item.nama_barang}')">Hapus</button>
        </div>
      </td>
    </tr>
  `).join("");
}

// ========================
// FILTER PENCARIAN
// ========================
document.getElementById("searchInput").addEventListener("input", function () {
  const q        = this.value.toLowerCase();
  const filtered = allData.filter(i => i.nama_barang.toLowerCase().includes(q));
  renderTable(filtered);
});

// ========================
// LOAD DATA (READ)
// ========================
function loadData() {
  fetch(`${BASE_URL}/get_barang.php`)
    .then(res => res.json())
    .then(res => {
      allData = Array.isArray(res) ? res : (res.data || []);
      renderStats(allData);
      renderTable(allData);
    })
    .catch(() => {
      document.getElementById("tabel-barang").innerHTML = `
        <tr>
          <td colspan="4">
            <div class="empty-state"><p>Gagal memuat data dari server</p></div>
          </td>
        </tr>`;
    });
}

// ========================
// SIMPAN BARANG (CREATE / UPDATE)
// ========================
function simpanBarang() {
  const nama  = document.getElementById("inputNama").value.trim();
  const harga = document.getElementById("inputHarga").value;
  const id    = document.getElementById("editId").value;

  if (!nama || !harga) {
    showResponse("Nama dan harga wajib diisi!", "error");
    return;
  }

  if (modeEdit && id) {
    // UPDATE
    fetch(`${BASE_URL}/edit_barang.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id, nama_barang: nama, harga: harga })
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        showToast("Barang berhasil diperbarui");
        batalEdit();
        loadData();
      } else {
        showResponse(data.pesan || "Gagal memperbarui", "error");
      }
    })
    .catch(() => showResponse("Gagal terhubung ke server", "error"));

  } else {
    // CREATE
    fetch(`${BASE_URL}/tambah_barang.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama_barang: nama, harga: harga })
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        showToast("Barang berhasil ditambahkan");
        document.getElementById("inputNama").value  = "";
        document.getElementById("inputHarga").value = "";
        loadData();
      } else {
        showResponse(data.pesan || "Gagal menambahkan", "error");
      }
    })
    .catch(() => showResponse("Gagal terhubung ke server", "error"));
  }
}

// ========================
// MODE EDIT — isi form dengan data baris
// ========================
function mulaiEdit(id, nama, harga) {
  modeEdit = true;
  document.getElementById("editId").value     = id;
  document.getElementById("inputNama").value  = nama;
  document.getElementById("inputHarga").value = harga;
  document.getElementById("editLabel").classList.add("show");
  document.getElementById("btnBatal").classList.add("show");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function batalEdit() {
  modeEdit = false;
  document.getElementById("editId").value     = "";
  document.getElementById("inputNama").value  = "";
  document.getElementById("inputHarga").value = "";
  document.getElementById("editLabel").classList.remove("show");
  document.getElementById("btnBatal").classList.remove("show");
}

// ========================
// HAPUS BARANG (DELETE)
// ========================
async function hapusBarang(id_target, nama) {
  const yakin = confirm(
    "Peringatan!\nApakah Anda yakin ingin menghapus barang \"" + nama + "\" dengan ID " + id_target + "?"
  );

  if (yakin) {
    try {
      const response = await fetch(`${BASE_URL}/hapus_barang.php`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id_target })
      });

      const hasil = await response.json();

      if (hasil.status === "success") {
        showToast("Barang berhasil dihapus");
        loadData();
      } else {
        showToast("Gagal: " + (hasil.pesan || "Error"));
      }
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      showToast("Gagal terhubung ke server");
    }
  }
}

// ========================
// SERVICE WORKER (PWA)
// ========================
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

// ========================
// JALANKAN
// ========================
loadData();