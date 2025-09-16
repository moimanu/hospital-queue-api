import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

const firebaseConfig = {
  apiKey: "AIzaSyCtkWYHgex_drLMdF-hdA4Z2-unvZG65AQ",
  authDomain: "hospital-queue-api.firebaseapp.com",
  databaseURL: "https://hospital-queue-api-default-rtdb.firebaseio.com",
  projectId: "hospital-queue-api",
  storageBucket: "hospital-queue-api.firebasestorage.app",
  messagingSenderId: "707733174962",
  appId: "1:707733174962:web:200b93cffeffe1a9e0a7ab"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Formata o tempo médio para string "Xh Ymin Zs" ou "IMEDIATO"
function formatAvgTime(seconds) {
  if (seconds === 0) return '...';

  // Garante que segundos sejam um número inteiro
  seconds = Math.round(seconds);

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  let result = '';
  if (hrs > 0) result += `${hrs}h `;
  if (mins > 0) result += `${mins}min `;
  if (secs > 0) result += `${secs}s`;

  return result.trim();
}

// Cria o gráfico (variável global para atualizar depois)
let chart = null;

function createChart() {
  const ctx = document.getElementById('chart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
      datasets: [{
        label: 'Pacientes atendidos',
        data: [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: 'rgba(30, 136, 229, 0.7)',
        borderColor: 'rgba(30, 136, 229, 1)',
        borderWidth: 1,
        borderRadius: 5
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          precision: 0,
          stepSize: 1
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

function updateQueueData(data) {
  if (!data || !data.stats || !data.stats.current_state) {
    console.warn('Dados incompletos: stats ou current_state ausente');
    return;
  }

  const stats = data.stats;

  // Atualiza total de pessoas
  const totalPeopleEl = document.querySelector('.counter');
  if (totalPeopleEl) totalPeopleEl.textContent = stats.total_people ?? '0';

  // Atualiza última atualização formatada
  const lastUpdateEl = document.querySelector('.last-update-caption');
  if (lastUpdateEl && stats.last_update) {
    const lastUpdateDate = new Date(stats.last_update);
    lastUpdateEl.textContent = `Última atualização: ${lastUpdateDate.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}`;
  }

  // Mapeamento estado -> id dos cards no HTML
  const stateMap = {
    triage: 'triage',
    red: 'red',
    orange: 'orange',
    yellow: 'yellow',
    green: 'green',
    blue: 'blue'
  };

  for (const [stateKey, cardId] of Object.entries(stateMap)) {
    const card = document.getElementById(cardId);
    if (!card) continue;

    const count = stats.current_state[stateKey]?.count ?? 0;
    const avgTimeSeconds = stats.current_state[stateKey]?.avg_time ?? 0;

    // Atualiza contagem
    const countEl = card.querySelector('.count-manchester h3');
    if (countEl) countEl.textContent = count;

    // Atualiza média de espera
    if (stateKey !== 'red') {
      const avgTimeEl = card.querySelector('.time-caption p');
      if (avgTimeEl) avgTimeEl.textContent = `Média de espera: ${formatAvgTime(avgTimeSeconds)}`;
    }
  }

  // Card de "em triagem"
  const inTriageCount = stats.in_triage ?? 0;
  let inTriageCard = document.getElementById('in-triage');
  const triageCard = document.getElementById('triage');

  if (inTriageCount > 0) {
    if (!inTriageCard) {
      inTriageCard = document.createElement('li');
      inTriageCard.id = 'in-triage';
      inTriageCard.className = 'card-manchester';
      inTriageCard.style.border = 'none';
      inTriageCard.style.display = 'flex';

      // inserir logo após o triage
      if (triageCard && triageCard.parentNode) {
        triageCard.insertAdjacentElement('afterend', inTriageCard);
      }
    }

    inTriageCard.innerHTML = `
      <div class="sub-card">
        <div class="icon-sub-card">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="lucide lucide-activity-icon lucide-activity">
            <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>
          </svg>
        </div>
        <p>${inTriageCount} pessoa${inTriageCount > 1 ? 's' : ''} 
           está${inTriageCount > 1 ? 'm' : ''} sendo atendida${inTriageCount > 1 ? 's' : ''} 
           na triagem...</p>
      </div>
    `;
  } else {
    if (inTriageCard) {
      inTriageCard.remove();
    }
  }

  // Atualiza gráfico com dados last_days
  if (chart && stats.last_days) {
    const dayMap = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6
    };

    const labelsOriginal = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const todayIndex = new Date().getDay();

    function rotateArrayLeft(arr, n) {
      return arr.slice(n).concat(arr.slice(0, n));
    }

    const labelsRotated = rotateArrayLeft(labelsOriginal, (todayIndex + 1) % 7);

    const chartDataOriginal = new Array(7).fill(0);
    for (const [day, value] of Object.entries(stats.last_days)) {
      const index = dayMap[day];
      if (index !== undefined) {
        chartDataOriginal[index] = value;
      }
    }

    const chartDataRotated = rotateArrayLeft(chartDataOriginal, (todayIndex + 1) % 7);

    chart.data.labels = labelsRotated;
    chart.data.datasets[0].data = chartDataRotated;
    chart.update();
  }
}

const queueRef = ref(database, '/');

onValue(queueRef, (snapshot) => {
  const data = snapshot.val();
  if (data) {
    updateQueueData(data);
  }
});

window.onload = () => {
  createChart();
};
