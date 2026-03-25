// impacto.js
document.addEventListener('DOMContentLoaded', () => {
  const btnImpacto = document.getElementById('btnImpacto');
  const canvas = document.getElementById('chartImpacto');
  const impactoReal = document.getElementById('impactoReal');
  let chartCreado = false;

  btnImpacto.addEventListener('click', () => {
    // Mostrar mensaje
    impactoReal.textContent = "Más de 8 millones de toneladas de plástico llegan al océano cada año 🌊";

    if (!chartCreado) {
      btnImpacto.style.display = 'none';
      canvas.style.display = 'block';

      // ⚠️ Verificar que Chart exista
      if (typeof Chart !== 'undefined') {
        const ctx = canvas.getContext('2d');
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: [
              'Playas Contaminadas',
              'Tortugas Afectadas (%)',
              'Plástico en el Océano (ton)',
              'Fauna en Riesgo',
              'Arrecifes en Crisis',
              'Microplásticos Agua',
              'Contaminación por Petróleo'
            ],
            datasets: [{
              label: 'Impacto Ambiental',
              data: [8000, 33, 8000000, 2000, 1200, 5000, 2500],
              backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF',
                '#FF9F40',
                '#C9CBCF'
              ]
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: true, position: 'top' },
              title: { display: true, text: 'Impacto de la Contaminación Marina' }
            },
            scales: {
              y: { beginAtZero: true }
            }
          }
        });
        chartCreado = true;
      } else {
        console.error("❌ Chart.js no se cargó correctamente. Verifica que cart.js esté en la carpeta correcta.");
      }
    }
  });
});