/* dashboard.js */

const user = requireLogin();

document.addEventListener('DOMContentLoaded', () => {
  // Greeting
  if (user) {
    document.getElementById('greetUser').textContent = `Selamat Datang, ${user.nama}`;
  }
  const now = new Date();
  document.getElementById('greetDate').textContent = now.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  loadStats();
  loadRecent();
});

function doLogout() {
  sessionStorage.removeItem('ml_user');
  window.location.href = 'index.html';
}

async function loadStats() {
  try {
    const res = await apiFetch('/dashboard');
    document.getElementById('statTotal').textContent = res.total;
    document.getElementById('statOpen').textContent = res.open;
    document.getElementById('statProg').textContent = res.in_progress;
    document.getElementById('statDone').textContent = res.closed;
  } catch (e) {
    console.error('Stats error:', e);
  }
}

async function loadRecent() {
  const el = document.getElementById('recentList');
  try {
    const res = await apiFetch('/temuan');
    const data = res.data.slice(0, 5);
    if (!data.length) {
      el.innerHTML = `<div class="empty-state">
        <div class="empty-state-icon">
          <svg width="24" height="24" fill="none" stroke="var(--abu-mid)" stroke-width="2" viewBox="0 0 24 24">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
          </svg>
        </div>
        <div class="empty-state-title">Belum Ada Temuan</div>
        <div class="empty-state-sub">Tap "Input" untuk mencatat temuan baru</div>
      </div>`;
      return;
    }
    el.innerHTML = data.map(t => {
      const statusClass = t.status === 'In Progress' ? 'progress' : (t.status === 'Closed' ? 'closed' : 'notl');
      return `
      <a href="tindak-lanjut.html?temuan_id=${t.id}" class="temuan-item ${statusClass}">
        <div class="temuan-row">
          <span class="temuan-no">${t.no_kondisi}</span>
          ${getStatusBadge(t.status)}
        </div>
        <div class="temuan-jenis">${t.jenis_temuan}</div>
        <div class="temuan-meta">
          <span>🔌 ${t.penyulang}</span>
          <span>📍 ${t.lokasi_temuan}</span>
          <span>🕐 ${formatDateTime(t.tanggal_patroli)}</span>
        </div>
      </a>
    `}).join('');
  } catch (e) {
    el.innerHTML = `<div class="empty-state"><div class="empty-state-title">Gagal memuat data</div></div>`;
  }
}
