const COMMENTS_API = 'https://sigetux.tuxtla.gob.mx/api/curso/comments';

function getComentariosCookie() {
  const match = document.cookie.match(/(?:^|;\s*)qgis_comentarios=([^;]*)/);
  if (!match) return {};
  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return {};
  }
}

function setComentariosCookie(data) {
  const expires = new Date();
  expires.setDate(expires.getDate() + 365);
  document.cookie = `qgis_comentarios=${encodeURIComponent(JSON.stringify(data))}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}

function yaComento(dia) {
  const cookie = getComentariosCookie();
  return cookie[dia] === true;
}

function marcarComentado(dia) {
  const cookie = getComentariosCookie();
  cookie[dia] = true;
  setComentariosCookie(cookie);
}

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('commentModal');
  if (!modal) return;

  const form = document.getElementById('commentForm');
  const contentField = document.getElementById('commentContent');
  const formWrapper = document.getElementById('commentFormWrapper');
  const alreadyWrapper = document.getElementById('alreadyCommented');
  const submitBtn = document.getElementById('commentSubmitBtn');
  const submitStatus = document.getElementById('commentSubmitStatus');
  const modalDiaLabel = document.getElementById('commentModalDiaLabel');

  let currentDia = null;

  function actualizarEstadoUI() {
    if (yaComento(currentDia)) {
      formWrapper.classList.add('d-none');
      alreadyWrapper.classList.remove('d-none');
    } else {
      formWrapper.classList.remove('d-none');
      alreadyWrapper.classList.add('d-none');
    }
  }

  modal.addEventListener('show.bs.modal', (event) => {
    const btn = event.relatedTarget;
    if (!btn) return;
    currentDia = parseInt(btn.getAttribute('data-dia'), 10);
    if (!currentDia) return;

    modalDiaLabel.textContent = 'Dia ' + currentDia;
    form.reset();
    submitStatus.classList.add('d-none');
    actualizarEstadoUI();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = contentField.value.trim();
    if (!content || !currentDia) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i> ENVIANDO...';
    submitStatus.classList.add('d-none');

    try {
      const res = await fetch(COMMENTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dia: currentDia, content })
      });

      if (!res.ok) throw new Error();

      marcarComentado(currentDia);
      form.reset();
      actualizarEstadoUI();

      submitStatus.className = 'alert alert-success rounded-0 border-0 font-mono small mt-3 animate-fade-in';
      submitStatus.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i> Comentario enviado correctamente.';
      submitStatus.classList.remove('d-none');
      setTimeout(() => submitStatus.classList.add('d-none'), 4000);
    } catch {
      submitStatus.className = 'alert alert-danger rounded-0 border-0 font-mono small mt-3 animate-fade-in';
      submitStatus.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i> Error al enviar. Intenta de nuevo.';
      submitStatus.classList.remove('d-none');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="bi bi-send-fill me-2"></i> ENVIAR COMENTARIO';
    }
  });
});
