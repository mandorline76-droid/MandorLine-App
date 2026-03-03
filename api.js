/* api.js - Fetch wrapper untuk MandorLine backend */

const API_BASE = 'http://127.0.0.1:3001/api';
const API_URL = 'http://127.0.0.1:3001'; // Base URL untuk file statis /uploads

async function apiFetch(path, options = {}) {
    const token = sessionStorage.getItem('ml_user');
    try {
        const res = await fetch(API_BASE + path, {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ message: 'Terjadi kesalahan server' }));
            throw new Error(err.message || 'Error ' + res.status);
        }
        return res.json();
    } catch (error) {
        console.error('API Fetch Error:', error);
        throw new Error('Gagal koneksi ke server. Pastikan server aktif di port 3001.');
    }
}

async function apiPost(path, body) {
    return apiFetch(path, {
        method: 'POST',
        body: JSON.stringify(body)
    });
}

async function apiPostForm(path, formData) {
    try {
        const res = await fetch(API_BASE + path, {
            method: 'POST',
            body: formData
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ message: 'Terjadi kesalahan' }));
            throw new Error(err.message || 'Error ' + res.status);
        }
        return res.json();
    } catch (error) {
        console.error('API PostForm Error:', error);
        throw new Error('Gagal mengirim data. Pastikan server aktif di port 3001.');
    }
}

// Cek apakah user sudah login
function requireLogin() {
    const user = sessionStorage.getItem('ml_user');
    if (!user && !window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
        window.location.href = 'index.html';
        return null;
    }
    return user ? JSON.parse(user) : null;
}

// Utilitas
function toUpperCase(el) {
    const pos = el.selectionStart;
    el.value = el.value.toUpperCase();
    el.setSelectionRange(pos, pos);
}

function showToast(msg, type = '', duration = 2800) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast show' + (type ? ' ' + type : '');
    setTimeout(() => { t.className = 'toast'; }, duration);
}

function previewPhoto(input, previewId) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = document.getElementById(previewId);
        img.src = e.target.result;
        img.classList.add('show');
    };
    reader.readAsDataURL(file);
}

function formatDateTime(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('id-ID', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

function getStatusBadge(status) {
    if (!status) return '<span class="badge badge-notl">Belum TL</span>';
    if (status === 'Open') return '<span class="badge badge-open">Open</span>';
    if (status === 'In Progress') return '<span class="badge badge-progress">In Progress</span>';
    if (status === 'Closed') return '<span class="badge badge-closed">Selesai</span>';
    return `<span class="badge badge-notl">${status}</span>`;
}
