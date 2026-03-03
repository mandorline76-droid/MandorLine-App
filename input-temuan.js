/* input-temuan.js */

requireLogin();

document.addEventListener('DOMContentLoaded', async () => {
    // Set tanggal waktu auto
    const now = new Date();
    document.getElementById('tanggalPatroli').value = now.toLocaleString('id-ID', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    }) + ' WIB';

    // Load no kondisi preview
    try {
        const res = await apiFetch('/temuan/meta/next-no-kondisi');
        document.getElementById('noKondisiVal').textContent = res.no_kondisi;
    } catch (e) {
        document.getElementById('noKondisiVal').textContent = 'HAR-??????-???';
    }
});

// Ambil GPS
function ambilGPS() {
    const btn = document.getElementById('btnGps');
    const hint = document.getElementById('gpsHint');
    btn.classList.add('loading');
    btn.textContent = '📡 ...';
    hint.textContent = 'Mengambil lokasi GPS...';

    if (!navigator.geolocation) {
        hint.textContent = 'Browser tidak mendukung GPS';
        btn.classList.remove('loading');
        btn.innerHTML = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> GPS`;
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const lat = pos.coords.latitude.toFixed(6);
            const lng = pos.coords.longitude.toFixed(6);
            document.getElementById('koordinat').value = `${lat}, ${lng}`;
            hint.textContent = `✓ Akurasi: ±${Math.round(pos.coords.accuracy)}m`;
            btn.classList.remove('loading');
            btn.innerHTML = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> GPS`;
        },
        (err) => {
            hint.textContent = 'GPS gagal: ' + err.message;
            btn.classList.remove('loading');
            btn.innerHTML = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> GPS`;
        },
        { timeout: 10000, maximumAge: 0 }
    );
}

async function simpanTemuan() {
    const btn = document.getElementById('btnSimpan');

    const namaPetugas = document.getElementById('namaPetugas').value.trim();
    const penyulang = document.getElementById('penyulang').value;
    const kondisiCuaca = document.getElementById('kondisiCuaca').value;
    const segmen = document.getElementById('segmen').value.trim();
    const koordinat = document.getElementById('koordinat').value.trim();
    const jenisTemuan = document.getElementById('jenisTemuan').value;
    const lokasiTemuan = document.getElementById('lokasiTemuan').value.trim();
    const keterangan = document.getElementById('keterangan').value.trim();

    // Validasi wajib
    const required = [
        [namaPetugas, 'Nama Petugas wajib diisi'],
        [penyulang, 'Penyulang wajib dipilih'],
        [kondisiCuaca, 'Kondisi Cuaca wajib dipilih'],
        [segmen, 'Segmen wajib diisi'],
        [koordinat, 'Titik Koordinat wajib diisi (tekan tombol GPS)'],
        [jenisTemuan, 'Jenis Temuan wajib dipilih'],
        [lokasiTemuan, 'Lokasi Temuan wajib diisi'],
    ];

    for (const [val, msg] of required) {
        if (!val) { showToast(msg, 'error'); return; }
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Menyimpan...';

    try {
        const fd = new FormData();
        fd.append('nama_petugas', namaPetugas);
        fd.append('tanggal_patroli', new Date().toISOString());
        fd.append('penyulang', penyulang);
        fd.append('kondisi_cuaca', kondisiCuaca);
        fd.append('segmen', segmen);
        fd.append('titik_koordinat', koordinat);
        fd.append('jenis_temuan', jenisTemuan);
        fd.append('lokasi_temuan', lokasiTemuan);
        fd.append('keterangan', keterangan);

        const f1 = document.getElementById('fotoTemuan1').files[0];
        const f2 = document.getElementById('fotoTemuan2').files[0];
        if (f1) fd.append('foto_temuan_1', f1);
        if (f2) fd.append('foto_temuan_2', f2);

        const res = await apiPostForm('/temuan', fd);
        showToast(`✓ Temuan ${res.no_kondisi} berhasil disimpan!`, 'success');

        setTimeout(() => { window.location.href = 'list-temuan.html'; }, 1500);
    } catch (err) {
        showToast('Gagal: ' + err.message, 'error');
        btn.disabled = false;
        btn.textContent = 'SIMPAN TEMUAN';
    }
}
