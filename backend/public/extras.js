// CONTADORES ANIMADOS
function animateCounter(id, endValue, duration = 2000) {
  const el = document.getElementById(id);
  let start = 0;
  const increment = Math.ceil(endValue / (duration / 50));
  const counter = setInterval(() => {
    start += increment;
    if (start >= endValue) {
      el.textContent = endValue;
      clearInterval(counter);
    } else {
      el.textContent = start;
    }
  }, 50);
}

// Ejecutar animación al cargar
window.addEventListener('load', () => {
  animateCounter('playas', 120);
  animateCounter('tortugas', 45);
  animateCounter('plasticos', 35);
  animateCounter('voluntarios', 200);
});

// MAPA INTERACTIVO CON TOOLTIP
const puntos = document.querySelectorAll('.mapa-punto');

// Crear tooltip
const tooltip = document.createElement('div');
tooltip.classList.add('tooltip');
document.body.appendChild(tooltip);

puntos.forEach(p => {
  const info = p.getAttribute('data-info');

  p.addEventListener('mouseenter', () => {
    tooltip.textContent = info;
    tooltip.style.opacity = '1';
    p.style.transform = 'scale(1.5)';
  });

  p.addEventListener('mousemove', e => {
    tooltip.style.left = e.pageX + 15 + 'px';
    tooltip.style.top = e.pageY + 15 + 'px';
  });

  p.addEventListener('mouseleave', () => {
    tooltip.style.opacity = '0';
    p.style.transform = 'scale(1)';
  });
});