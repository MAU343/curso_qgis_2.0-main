const API_BASE_URL = 'https://sigetux.tuxtla.gob.mx/api';

document.addEventListener('DOMContentLoaded', () => {
    cargarComentariosTotales();
});

async function cargarComentariosTotales() {
    const container = document.getElementById('commentsContainer');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('emptyState');
    const errorState = document.getElementById('errorState');

    // Reset UI
    container.innerHTML = '';
    loadingState.classList.remove('d-none');
    emptyState.classList.add('d-none');
    errorState.classList.add('d-none');

    try {
        // Fetch comments for all 5 days
        const requests = [1, 2, 3, 4, 5].map(dia => 
            fetch(`${API_BASE_URL}/curso/comments/${dia}`).catch(() => null)
        );
        
        const responses = await Promise.all(requests);
        let allComments = [];

        for (let i = 0; i < responses.length; i++) {
            if (responses[i] && responses[i].ok) {
                const data = await responses[i].json();
                if (data && Array.isArray(data)) {
                    data.forEach(c => c.dia_curso = i + 1);
                    allComments = allComments.concat(data);
                }
            }
        }

        loadingState.classList.add('d-none');
        
        // Ordenar del más reciente al más antiguo
        allComments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        if (allComments.length === 0) {
            emptyState.classList.remove('d-none');
            return;
        }

        renderComentarios(allComments);
    } catch (err) {
        console.error("Error cargando comentarios:", err);
        loadingState.classList.add('d-none');
        errorState.classList.remove('d-none');
    }
}

function renderComentarios(comentarios) {
    const container = document.getElementById('commentsContainer');
    
    const html = comentarios.map(c => `
        <div class="col-md-6 col-lg-4 animate-fade-in">
            <div class="p-4 bg-dark bg-darker border border-secondary rounded h-100 d-flex flex-column position-relative overflow-hidden">
                <div class="mb-3 d-flex justify-content-between align-items-center">
                    <div class="stars-container">
                        ${renderStars(c.rating)}
                    </div>
                    <span class="badge bg-qgis-dark font-mono small text-muted-light border border-dark">
                        ${c.dia_curso ? 'Día ' + c.dia_curso + ' • ' : ''}${formatearFecha(c.created_at)}
                    </span>
                </div>
                <div class="comment-content flex-grow-1">
                    <p class="text-light font-mono small mb-0" style="line-height: 1.6;">
                        <i class="bi bi-quote fs-4 text-qgis-yellow opacity-50 me-1"></i>
                        ${escapeHtml(c.content)}
                    </p>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

function renderStars(rating) {
    if (!rating || rating < 1 || rating > 5) return '<span class="text-muted font-mono small">Sin calificación</span>';
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += i <= rating
            ? '<i class="bi bi-star-fill text-qgis-yellow me-1"></i>'
            : '<i class="bi bi-star text-muted opacity-50 me-1"></i>';
    }
    return html;
}

function formatearFecha(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
