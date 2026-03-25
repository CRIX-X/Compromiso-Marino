window.addEventListener('DOMContentLoaded', () => {
  const btnImpacto = document.getElementById('btnImpacto');
  const canvas = document.getElementById('chartImpacto');
  const impactoReal = document.getElementById('impactoReal');
  let chartCreado = null;

  if (!btnImpacto || !canvas) return;

  const contenedor = document.getElementById('impactoContainer');
  contenedor.style.position = 'relative';
  contenedor.style.width = '100%';
  contenedor.style.maxWidth = '700px';
  contenedor.style.height = '400px';
  contenedor.style.marginTop = '20px';

  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'none';

  btnImpacto.addEventListener('click', () => {
    canvas.style.display = 'block';
    impactoReal.textContent = "Impacto real de la contaminación marina 🌊";

    if (!chartCreado) {
      const ctx = canvas.getContext('2d');
      chartCreado = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [
            'Playas Contaminadas',
            'Tortugas Afectadas (%)',
            'Plástico en el Océano (ton)',
            'Fauna en Riesgo',
            'Arrecifes en Crisis',
            'Microplásticos Agua',
            'Contaminación por Petróleo',
            'Aves Marinas',
            'Mamíferos Marinos',
            'Redes Abandonadas',
            'Aceites y Derrames'
          ],
          datasets: [{
            label: 'Impacto Ambiental',
            data: [8000, 33, 8000000, 2000, 1200, 5000, 2500, 4500, 1800, 2200, 6000],
            backgroundColor: [
              '#FF6B6B','#4D96FF','#FFD93D','#6BCB77','#9D4EDD',
              '#FF9F1C','#C0C0C0','#FF4C29','#3D84A8','#8AC926','#8338EC'
            ],
            borderRadius: 6,
            borderWidth: 1,
            borderColor: '#333'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: true, position: 'top', labels: { font: { size: 14 }, color: '#333' } },
            title: { display: true, text: 'Impacto de la Contaminación Marina', font: { size: 18 }, color: '#333' },
            tooltip: { enabled: true, backgroundColor: '#333', titleColor: '#fff', bodyColor: '#fff', cornerRadius: 4 }
          },
          scales: {
            x: { 
              ticks: { color: '#333', font: { size: 12 } }, 
              grid: { display: false }, 
              stacked: false, 
              barPercentage: 0.7, 
              categoryPercentage: 0.8 
            },
            y: { 
              beginAtZero: true,
              type: 'logarithmic', // permite que barras pequeñas y grandes se vean
              ticks: { callback: function(value) { return Number(value.toString()); }, color: '#333', font: { size: 12 } },
              grid: { color: '#ddd' }
            }
          }
        }
      });
    }
  });
});