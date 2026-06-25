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

function formatearFecha(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString('es-MX', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

async function cargarRegistros() {
    const container = document.getElementById('asistenciaContainer');
    const countInfo = document.getElementById('asistenciaCountInfo');
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
                    <td class="text-muted" style="color: #ffffff !important;">${new Date(r.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</td>
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

// ---- COMMENTS ADMIN ----

async function cargarComentariosAdmin() {
    const dia = document.getElementById('comentarioDiaSelect').value;
    const container = document.getElementById('comentariosAdminContainer');
    const emptyState = document.getElementById('comentariosEmptyState');

    container.innerHTML = '<p class="text-muted font-mono small text-center">Cargando comentarios...</p>';
    emptyState.classList.add('d-none');

    try {
        const res = await fetch(`${API_BASE_URL}/curso/comments/${dia}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401) { cerrarSesion(); return; }
        if (!res.ok) throw new Error('Error al cargar');

        const data = await res.json();

        if (!data.length) {
            container.innerHTML = '';
            emptyState.classList.remove('d-none');
            return;
        }

        function renderStars(rating) {
            if (!rating || rating < 1 || rating > 5) return '<span class="text-muted">-</span>';
            let html = '';
            for (let i = 1; i <= 5; i++) {
                html += i <= rating
                    ? '<i class="bi bi-star-fill" style="color:#FEE028;font-size:0.75rem;margin-right:1px"></i>'
                    : '<i class="bi bi-star" style="color:rgba(255,255,255,0.15);font-size:0.75rem;margin-right:1px"></i>';
            }
            return html;
        }

        container.innerHTML = `
            <div class="table-responsive">
                <table class="table table-dark table-bordered border-secondary admin-comments-table mb-0">
                    <thead class="text-qgis-yellow text-uppercase font-mono small" style="background-color:#1e1e1e;">
                        <tr>
                            <th style="width:50px;">#</th>
                            <th>Comentario</th>
                            <th style="width:140px;">Valoracion</th>
                            <th style="width:180px;">Fecha</th>
                            <th style="width:80px;">Accion</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map((c, i) => `
                            <tr>
                                <td class="text-muted">${i + 1}</td>
                                <td class="comment-content-cell text-light">${escapeHtml(c.content)}</td>
                                <td class="font-mono small" style="white-space:nowrap;">${renderStars(c.rating)}</td>
                                <td class="text-muted" style="color: #ffffff !important;">${formatearFecha(c.created_at)}</td>
                                <td>
                                    <button class="btn-delete-comment font-mono small" onclick="eliminarComentario(${c.id})">
                                        <i class="bi bi-trash3"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <p class="text-muted font-mono small mt-2">${data.length} comentario(s) ${dia === '0' ? 'Generales' : 'para Día ' + dia}</p>
        `;
    } catch (err) {
        container.innerHTML = `<p class="text-center text-danger font-mono small">Error al cargar: ${err.message}</p>`;
    }
}

async function eliminarComentario(id) {
    if (!confirm('Eliminar este comentario permanentemente?')) return;

    try {
        const res = await fetch(`${API_BASE_URL}/curso/comments/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401) { cerrarSesion(); return; }
        if (!res.ok) throw new Error('Error al eliminar');

        cargarComentariosAdmin();
    } catch (err) {
        alert('Error al eliminar: ' + err.message);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ---- INTERESADOS ADMIN ----

async function cargarInteresados() {
    const container = document.getElementById('interesadosContainer');
    const countInfo = document.getElementById('interesadosCountInfo');
    const emptyState = document.getElementById('interesadosEmptyState');

    container.innerHTML = '<p class="text-muted font-mono small text-center">Cargando interesados...</p>';
    emptyState.classList.add('d-none');

    try {
        const res = await fetch(`${API_BASE_URL}/curso/registrations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401) { cerrarSesion(); return; }
        if (!res.ok) throw new Error('Error al cargar');

        const data = await res.json();
        const interesados = data.filter(r => r.curso);

        if (interesados.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('d-none');
            countInfo.textContent = '0 interesados registrados';
            return;
        }

        // Group by course
        const grouped = {};
        interesados.forEach(r => {
            const courseKey = r.curso;
            if (!grouped[courseKey]) {
                grouped[courseKey] = { label: courseKey, records: [] };
            }
            grouped[courseKey].records.push(r);
        });

        const sortedCourses = Object.keys(grouped).sort();

        countInfo.textContent = `${interesados.length} interesado(s) en ${sortedCourses.length} curso(s)`;

        container.innerHTML = sortedCourses.map(courseKey => {
            const group = grouped[courseKey];
            const rows = group.records.map((r, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td class="text-qgis-light fw-bold">${escapeHtml(r.nombre)}</td>
                    <td>${escapeHtml(r.email)}</td>
                    <td class="text-qgis-yellow font-mono small">${escapeHtml(r.curso)}</td>
                    <td class="text-muted" style="color: #ffffff !important;">${formatearFecha(r.created_at)}</td>
                </tr>
            `).join('');

            return `
                <div class="mb-5">
                    <h4 class="fw-bold mb-3 text-qgis-light">
                        <i class="bi bi-bookmark-star-fill me-2"></i>${escapeHtml(group.label)}
                        <span class="badge bg-qgis-dark font-mono ms-2">${group.records.length}</span>
                    </h4>
                    <div class="table-responsive">
                        <table class="table table-dark table-striped table-bordered border-secondary font-mono small mb-0">
                            <thead class="text-qgis-yellow text-uppercase" style="background-color:#1e1e1e;">
                                <tr>
                                    <th>#</th>
                                    <th>Nombre</th>
                                    <th>Email</th>
                                    <th>Curso</th>
                                    <th>Fecha</th>
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

document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('comentarioDiaSelect');
    select.addEventListener('change', () => cargarComentariosAdmin());

    document.getElementById('comentariosTab').addEventListener('shown.bs.tab', () => {
        cargarComentariosAdmin();
    });

    document.getElementById('interesadosTab').addEventListener('shown.bs.tab', () => {
        cargarInteresados();
    });
});
