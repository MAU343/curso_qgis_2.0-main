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
  return cookie[dia] !== undefined;
}

function getRatingCookie(dia) {
  const cookie = getComentariosCookie();
  const val = cookie[dia];
  return typeof val === 'number' ? val : 0;
}

function marcarComentado(dia, rating) {
  const cookie = getComentariosCookie();
  cookie[dia] = rating;
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
  const starRating = document.getElementById('starRating');
  const ratingValueInput = document.getElementById('ratingValue');
  const previousRating = document.getElementById('previousRating');

  let currentDia = null;

  function updateStars(value) {
    const stars = starRating.querySelectorAll('.star-btn');
    stars.forEach((star) => {
      const starVal = parseInt(star.getAttribute('data-value'), 10);
      star.classList.toggle('active', starVal <= value);
    });
  }

  function resetRating() {
    ratingValueInput.value = 0;
    updateStars(0);
  }

  function showPreviousRating(dia) {
    const rating = getRatingCookie(dia);
    if (!rating) {
      previousRating.innerHTML = '';
      return;
    }
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      starsHtml += i <= rating
        ? '<i class="bi bi-star-fill fs-5 mx-1" style="color:#FEE028"></i>'
        : '<i class="bi bi-star fs-5 mx-1" style="color:rgba(255,255,255,0.15)"></i>';
    }
    previousRating.innerHTML = '<div class="font-mono small text-qgis-yellow mb-1">Tu valoracion:</div>' + starsHtml;
  }

  starRating.addEventListener('click', (e) => {
    const star = e.target.closest('.star-btn');
    if (!star) return;
    const value = parseInt(star.getAttribute('data-value'), 10);
    ratingValueInput.value = value;
    updateStars(value);
  });

  starRating.addEventListener('mouseover', (e) => {
    const star = e.target.closest('.star-btn');
    if (!star) return;
    const value = parseInt(star.getAttribute('data-value'), 10);
    updateStars(value);
  });

  starRating.addEventListener('mouseleave', () => {
    updateStars(parseInt(ratingValueInput.value, 10) || 0);
  });

  function actualizarEstadoUI() {
    if (yaComento(currentDia)) {
      formWrapper.classList.add('d-none');
      alreadyWrapper.classList.remove('d-none');
      showPreviousRating(currentDia);
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
    resetRating();
    submitStatus.classList.add('d-none');
    actualizarEstadoUI();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = contentField.value.trim();
    const rating = parseInt(ratingValueInput.value, 10);
    if (!rating || !content || !currentDia) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i> ENVIANDO...';
    submitStatus.classList.add('d-none');

    try {
      const res = await fetch(COMMENTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dia: currentDia, content, rating })
      });

      if (!res.ok) throw new Error();

      marcarComentado(currentDia, rating);
      form.reset();
      resetRating();
      actualizarEstadoUI();

      submitStatus.className = 'alert alert-success rounded-0 border-0 font-mono small mt-3 animate-fade-in';
      submitStatus.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i> Comentario y valoracion enviados correctamente.';
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
