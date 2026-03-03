/* login.js */

async function doLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errEl = document.getElementById('loginError');
    const btn = document.getElementById('btnLogin');

    errEl.style.display = 'none';

    if (!username || !password) {
        errEl.textContent = 'Username dan password wajib diisi.';
        errEl.style.display = 'block';
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>';

    try {
        const res = await apiPost('/login', { username, password });
        if (res.success) {
            sessionStorage.setItem('ml_user', JSON.stringify(res.user));
            window.location.href = 'dashboard.html';
        }
    } catch (err) {
        errEl.textContent = err.message || 'Login gagal.';
        errEl.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.textContent = 'MASUK';
    }
}

// Enter key submit
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doLogin();
});
