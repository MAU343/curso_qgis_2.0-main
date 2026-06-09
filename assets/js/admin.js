const API_BASE_URL = 'https://sigetux.tuxtla.gob.mx/api';
let token = localStorage.getItem('admin_token');

document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        mostrarDashboard();
    }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUser').value;
    const password = document.getElementById('loginPass').value;
    const loginError = document.getElementById('loginError');

    loginError.classList.add('d-none');

    try {
        const res = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!res.ok) {
            throw new Error('Credenciales incorrectas');
        }

        const data = await res.json();
        token = data.access_token;
        localStorage.setItem('admin_token', token);
        mostrarDashboard();
    } catch (err) {
        loginError.textContent = err.message;
        loginError.classList.remove('d-none');
    }
});

async function mostrarDashboard() {
    document.getElementById('loginSection').classList.add('d-none');
    document.getElementById('dashboardSection').classList.remove('d-none');
    await cargarRegistros();
}

async function cargarRegistros() {
    const tbody = document.getElementById('registrosBody');
    const countInfo = document.getElementById('countInfo');
    const emptyState = document.getElementById('emptyState');

    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Cargando registros...</td></tr>';
    emptyState.classList.add('d-none');

    try {
        const res = await fetch(`${API_BASE_URL}/curso/registrations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401) {
            cerrarSesion();
            return;
        }

        if (!res.ok) throw new Error('Error al cargar');

        const data = await res.json();

        if (data.length === 0) {
            tbody.innerHTML = '';
            emptyState.classList.remove('d-none');
            countInfo.textContent = '0 registros encontrados';
            return;
        }

        countInfo.textContent = `${data.length} registro(s) encontrado(s)`;

        tbody.innerHTML = data.map((r, i) => `
            <tr>
                <td>${i + 1}</td>
                <td class="text-qgis-light fw-bold">${r.nombre}</td>
                <td>${r.email}</td>
                <td>${r.telefono}</td>
                <td>${r.profesion}</td>
                <td class="text-muted">${new Date(r.created_at).toLocaleString('es-MX')}</td>
            </tr>
        `).join('');

    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error al cargar: ${err.message}</td></tr>`;
    }
}

async function exportarCSV() {
    try {
        const res = await fetch(`${API_BASE_URL}/curso/registrations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Error');
        const data = await res.json();

        const headers = ['ID', 'Nombre', 'Email', 'Telefono', 'Profesion', 'Fecha'];
        const rows = data.map(r => [
            r.id,
            `"${r.nombre}"`,
            `"${r.email}"`,
            `"${r.telefono}"`,
            `"${r.profesion}"`,
            new Date(r.created_at).toISOString()
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `registros_qgis_${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
    } catch (err) {
        alert('Error al exportar CSV');
    }
}

function cerrarSesion() {
    localStorage.removeItem('admin_token');
    token = null;
    document.getElementById('dashboardSection').classList.add('d-none');
    document.getElementById('loginSection').classList.remove('d-none');
    document.getElementById('loginForm').reset();
}
