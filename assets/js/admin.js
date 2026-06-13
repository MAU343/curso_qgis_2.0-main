const API_BASE_URL = 'https://sigetux.tuxtla.gob.mx/api';
// const API_BASE_URL = 'http://127.0.0.1:8000/api';
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
    const container = document.getElementById('asistenciaContainer');
    const countInfo = document.getElementById('countInfo');
    const emptyState = document.getElementById('emptyState');

    container.innerHTML = '<p class="text-muted font-mono small text-center">Cargando asistencias...</p>';
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
            container.innerHTML = '';
            emptyState.classList.remove('d-none');
            countInfo.textContent = '0 asistencias registradas';
            return;
        }

        // Group records by date
        const grouped = {};
        data.forEach(r => {
            const dateStr = new Date(r.created_at).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const d = new Date(r.created_at);
            const dateKey = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
            if (!grouped[dateKey]) {
                grouped[dateKey] = { label: dateStr, records: [] };
            }
            grouped[dateKey].records.push(r);
        });

        // Sort dates descending
        const sortedDates = Object.keys(grouped).sort().reverse();

        countInfo.textContent = `${data.length} asistencias registradas en ${sortedDates.length} fecha(s)`;

        // Render tables
        container.innerHTML = sortedDates.map(dateKey => {
            const group = grouped[dateKey];
            const rows = group.records.map((r, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td class="text-qgis-light fw-bold">${r.nombre}</td>
                    <td>${r.email}</td>
                    <td>${r.telefono || '-'}</td>
                    <td>${r.profesion}</td>
                    <td class="text-muted">${new Date(r.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</td>
                </tr>
            `).join('');

            return `
                <div class="mb-5">
                    <h4 class="fw-bold mb-3 text-qgis-light">
                        <i class="bi bi-calendar-event me-2"></i>${group.label}
                        <span class="badge bg-qgis-dark font-mono ms-2">${group.records.length}</span>
                    </h4>
                    <div class="table-responsive">
                        <table class="table table-dark table-striped table-bordered border-secondary font-mono small mb-0">
                            <thead class="text-qgis-yellow text-uppercase" style="background-color:#1e1e1e;">
                                <tr>
                                    <th>#</th>
                                    <th>Nombre</th>
                                    <th>Email</th>
                                    <th>Telefono</th>
                                    <th>Profesion</th>
                                    <th>Hora</th>
                                </tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>
                    </div>
                </div>
            `;
        }).join('');

    } catch (err) {
        container.innerHTML = `<p class="text-center text-danger font-mono small">Error al cargar: ${err.message}</p>`;
    }
}

async function exportarCSV() {
    try {
        const res = await fetch(`${API_BASE_URL}/curso/registrations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Error');
        const data = await res.json();

        const headers = ['ID', 'Nombre', 'Email', 'Telefono', 'Profesion', 'Fecha', 'Hora'];
        const rows = data.map(r => [
            r.id,
            `"${r.nombre}"`,
            `"${r.email}"`,
            `"${r.telefono}"`,
            `"${r.profesion}"`,
            new Date(r.created_at).toLocaleDateString('es-MX'),
            new Date(r.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `asistencia_qgis_${new Date().toISOString().slice(0,10)}.csv`;
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
