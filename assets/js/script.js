// script.js

const API_BASE_URL = 'https://sigetux.tuxtla.gob.mx/api';
// const API_BASE_URL = 'http://127.0.0.1:8000/api';


document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll Reveal Animation
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: stop observing once revealed
                // observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.15, // Trigger when 15% of the element is visible
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // 2. Smooth Scrolling for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                // Offset for fixed navbar
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // 3. Attendance Form Submission
    const asistenciaForm = document.getElementById('asistenciaForm');
    const asistenciaStatus = document.getElementById('asistenciaStatus');

    if (asistenciaForm) {
        asistenciaForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                nombre: document.getElementById('nombreAsistencia').value,
                email: document.getElementById('emailAsistencia').value,
                telefono: document.getElementById('telefonoAsistencia').value,
                profesion: document.getElementById('profesionAsistencia').value
            };

            const submitBtn = asistenciaForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i> ENVIANDO...';

            try {
                const response = await fetch(`${API_BASE_URL}/curso/registrar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.detail || 'Error al enviar');
                }

                asistenciaStatus.className = 'alert alert-success rounded-0 border-0 font-mono small animate-fade-in';
                asistenciaStatus.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i> Asistencia registrada correctamente.';

                setTimeout(() => {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('asistenciaModal'));
                    if (modal) modal.hide();
                    asistenciaStatus.classList.add('d-none');
                    asistenciaForm.reset();
                }, 1500);
            } catch (error) {
                asistenciaStatus.className = 'alert alert-danger rounded-0 border-0 font-mono small animate-fade-in';
                asistenciaStatus.innerHTML = '<i class="bi bi-exclamation-triangle-fill me-2"></i> Error al registrar. Intenta de nuevo.';
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="bi bi-check-circle me-2"></i> REGISTRAR ASISTENCIA';

                setTimeout(() => {
                    asistenciaStatus.classList.add('d-none');
                }, 5000);
            }
        });
    }

    // 4. Presentation Mode Navigation
    if (document.documentElement.classList.contains('presentation-mode')) {
        const slides = document.querySelectorAll('.slide');
        let currentSlideIndex = 0;

        const scrollToSlide = (index) => {
            if (index >= 0 && index < slides.length) {
                slides[index].scrollIntoView({ behavior: 'smooth' });
                currentSlideIndex = index;
            }
        };

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
                e.preventDefault();
                scrollToSlide(currentSlideIndex + 1);
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                e.preventDefault();
                scrollToSlide(currentSlideIndex - 1);
            }
        });

        // Button navigation
        const btnNext = document.getElementById('btnNextSlide');
        const btnPrev = document.getElementById('btnPrevSlide');
        
        if(btnNext) {
            btnNext.addEventListener('click', () => scrollToSlide(currentSlideIndex + 1));
        }
        if(btnPrev) {
            btnPrev.addEventListener('click', () => scrollToSlide(currentSlideIndex - 1));
        }

        // Update current index based on scroll position (in case user scrolls manually)
        let isScrolling;
        window.addEventListener('scroll', () => {
            window.clearTimeout(isScrolling);
            isScrolling = setTimeout(() => {
                const scrollPosition = window.scrollY;
                const windowHeight = window.innerHeight;
                currentSlideIndex = Math.round(scrollPosition / windowHeight);
            }, 150);
        });
    }
});
