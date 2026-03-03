/* tindak-lanjut.js */

requireLogin();

let temuanData = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Set tanggal TL auto (display only)
    const now = new Date();
    document.getElementById('tanggalTL').value = now.toLocaleString('id-ID', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    }) + ' WIB';

    await loadTemuanList();

    // Pre-select jika ada query param temuan_id
    const params = new URLSearchParams(window.location.search);
    const tid = params.get('temuan_id');
    if (tid) {
        document.getElementById('pilihTemuan').value = tid;
        onTemuanSelected();
    }
});

async function loadTemuanList() {
    try {
        const res = await apiFetch('/temuan');
        temuanData = res.data;
        const sel = document.getElementById('pilihTemuan');
        sel.innerHTML = '<option value="">-- Pilih Temuan --</option>';
        res.data.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.id;
            const statusLabel = t.status ? ` [${t.status}]` : ' [Belum TL]';
            opt.textContent = `${t.no_kondisi} – ${t.jenis_temuan.substring(0, 30)}${statusLabel}`;
            sel.appendChild(opt);
        });
    } catch (e) {
        showToast('Gagal memuat daftar temuan', 'error');
    }
}

function onTemuanSelected() {
    const id = parseInt(document.getElementById('pilihTemuan').value);
    const infoEl = document.getElementById('infoTemuan');
    const formEl = document.getElementById('formTL');

    if (!id) {
        infoEl.style.display = 'none';
        formEl.style.display = 'none';
        return;
    }

    const t = temuanData.find(x => x.id === id);
    if (!t) return;

    // Fill info card
    document.getElementById('infoNoKondisi').textContent = t.no_kondisi;
    document.getElementById('infoJenis').textContent = t.jenis_temuan;
    document.getElementById('infoPenyulang').textContent = t.penyulang;
    document.getElementById('infoLokasi').textContent = t.lokasi_temuan;
    document.getElementById('infoTanggal').textContent = formatDateTime(t.tanggal_patroli);

    // Pre-fill existing TL if any
    if (t.prioritas) {
        document.getElementById('prioritas').value = t.prioritas;
    }
    if (t.status) {
        document.getElementById('statusTL').value = t.status;
    }
    if (t.nama_petugas_tl) {
        document.getElementById('namaPetugasTL').value = t.nama_petugas_tl;
    }

    infoEl.style.display = 'block';
    formEl.style.display = 'block';
}

async function simpanTL() {
    const temuanId = document.getElementById('pilihTemuan').value;
    const prioritas = document.getElementById('prioritas').value;
    const tanggalTL = document.getElementById('tanggalTL').value;
    const namaTL = document.getElementById('namaPetugasTL').value.trim();
    const status = document.getElementById('statusTL').value;
    const btn = document.getElementById('btnSimpanTL');

    // Validasi
    if (!temuanId) { showToast('Pilih temuan terlebih dahulu', 'error'); return; }
    if (!prioritas) { showToast('Prioritas wajib dipilih', 'error'); return; }
    if (!tanggalTL) { showToast('Tanggal Tindak Lanjut wajib diisi', 'error'); return; }
    if (!namaTL) { showToast('Nama Petugas TL wajib diisi', 'error'); return; }
    if (!status) { showToast('Status wajib dipilih', 'error'); return; }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Menyimpan...';

    try {
        const fd = new FormData();
        fd.append('prioritas', prioritas);
        fd.append('tanggal_tl', tanggalTL);
        fd.append('nama_petugas_tl', namaTL);
        fd.append('status', status);

        const f1 = document.getElementById('fotoTL1').files[0];
        const f2 = document.getElementById('fotoTL2').files[0];
        if (f1) fd.append('foto_tl_1', f1);
        if (f2) fd.append('foto_tl_2', f2);

        const res = await apiPostForm(`/temuan/${temuanId}/tindak-lanjut`, fd);
        showToast('✓ Tindak lanjut berhasil disimpan!', 'success');
        setTimeout(() => { window.location.href = 'list-temuan.html'; }, 1500);
    } catch (err) {
        showToast('Gagal: ' + err.message, 'error');
        btn.disabled = false;
        btn.textContent = 'SIMPAN TINDAK LANJUT';
    }
}
