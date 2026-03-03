/* list-temuan.js */

requireLogin();

let allData = [];

document.addEventListener('DOMContentLoaded', () => {
  loadTemuan();
});

async function loadTemuan() {
  const el = document.getElementById('temuanList');
  const filterPenyulang = document.getElementById('filterPenyulang').value;
  const filterStatus = document.getElementById('filterStatus').value;
  const filterTanggal = document.getElementById('filterTanggal')?.value;

  el.innerHTML = `<div class="empty-state">
    <div class="spinner" style="border-color:var(--border);border-top-color:var(--abu-tua)"></div>
  </div>`;

  try {
    const res = await apiFetch('/temuan');
    allData = res.data;

    let filtered = allData.filter(t => {
      const matchPenyulang = !filterPenyulang || t.penyulang === filterPenyulang;
      let matchStatus = true;
      if (filterStatus === 'notl') matchStatus = !t.status;
      else if (filterStatus) matchStatus = t.status === filterStatus;

      let matchTanggal = true;
      if (filterTanggal && t.tanggal_patroli) {
        const tgl = t.tanggal_patroli.split('T')[0];
        matchTanggal = tgl === filterTanggal;
      }

      return matchPenyulang && matchStatus && matchTanggal;
    });

    if (!filtered.length) {
      el.innerHTML = `<div class="empty-state">
        <div class="empty-state-icon">
          <svg width="24" height="24" fill="none" stroke="var(--abu-mid)" stroke-width="2" viewBox="0 0 24 24">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
          </svg>
        </div>
        <div class="empty-state-title">Tidak Ada Temuan</div>
        <div class="empty-state-sub">Sesuaikan filter atau tambah temuan baru</div>
      </div>`;
      return;
    }

    el.innerHTML = filtered.map(t => {
      const statusClass = t.status === 'In Progress' ? 'progress' : (t.status === 'Closed' ? 'closed' : 'notl');
      return `
      <div class="temuan-item ${statusClass}" onclick="if(event.target.tagName !== 'A') window.location.href='tindak-lanjut.html?temuan_id=${t.id}'">
        <div class="temuan-row" style="align-items:flex-start">
          <span class="temuan-no">${t.no_kondisi}</span>
          <div style="display:flex; flex-direction:column; align-items:flex-end; gap:5px;">
            ${getStatusBadge(t.status)}
          </div>
        </div>
        <div class="temuan-jenis">${t.jenis_temuan}</div>
        <div class="temuan-meta">
          <span>🔌 ${t.penyulang}</span>
          <span>📍 ${t.lokasi_temuan}</span>
        </div>
        <div class="temuan-meta">
          <span>👤 ${t.nama_petugas}</span>
          <span>🕐 ${formatDateTime(t.tanggal_patroli)}</span>
        </div>
        ${t.prioritas ? `<div class="temuan-meta"><span>⚡ Prioritas ${t.prioritas}</span>${t.nama_petugas_tl ? `<span>TL: ${t.nama_petugas_tl}</span>` : ''}</div>` : ''}
        <div style="margin-top:12px; display:flex; justify-content:center;">
          <a href="cetak-laporan.html?id=${t.id}" target="_blank" class="btn btn-primary" style="padding:8px 25px; font-size:12px; width:auto; text-decoration:none;">🖨️ CETAK LAPORAN</a>
        </div>
      </div>
    `}).join('');

  } catch (e) {
    el.innerHTML = `<div class="empty-state">
      <div class="empty-state-title">Gagal memuat data</div>
      <div class="empty-state-sub">${e.message}</div>
    </div>`;
  }
}

function cetakSemua() {
  const filterPenyulang = document.getElementById('filterPenyulang').value;
  const filterStatus = document.getElementById('filterStatus').value;
  const filterTanggal = document.getElementById('filterTanggal')?.value;

  const query = new URLSearchParams();
  if (filterPenyulang) query.set('penyulang', filterPenyulang);
  if (filterStatus) query.set('status', filterStatus);
  if (filterTanggal) query.set('tanggal', filterTanggal);

  window.open(`cetak-semua.html?${query.toString()}`, '_blank');
}
