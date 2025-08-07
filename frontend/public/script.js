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

// Formata o tempo médio para string "Xh Ymin" ou "IMEDIATO"
function formatAvgTime(minutes) {
  if (minutes === 0) return 'IMEDIATO';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return (hrs > 0 ? `${hrs}h ` : '') + (mins > 0 ? `${mins}min` : '');
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
        data: [0, 0, 0, 0, 0, 0, 0], // dados iniciais zeros
        backgroundColor: 'rgba(30, 136, 229, 0.7)', // azul
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
    const avgTime = stats.current_state[stateKey]?.avg_time ?? 0;

    // Atualiza contagem (lado direito)
    const countEl = card.querySelector('.count-manchester h3');
    if (countEl) countEl.textContent = count;

    // Atualiza média de espera (lado esquerdo, dentro de .caption-time p)
    const avgTimeEl = card.querySelector('.caption-time p');
    if (avgTimeEl) avgTimeEl.textContent = `Média de espera: ${formatAvgTime(avgTime)}`;
  }

  // Atualiza gráfico com dados last_days
  if (chart && stats.last_days) {
    const dayMap = {
      Sunday: 0,    // Domingo
      Monday: 1,    // Segunda
      Tuesday: 2,   // Terça
      Wednesday: 3, // Quarta
      Thursday: 4,  // Quinta
      Friday: 5,    // Sexta
      Saturday: 6   // Sábado
    };

    // Array original de labels em português
    const labelsOriginal = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    // Pega o dia da semana atual (0=Domingo, 6=Sábado)
    const todayIndex = new Date().getDay();

    // Função para rotacionar array para a esquerda em n posições
    function rotateArrayLeft(arr, n) {
      return arr.slice(n).concat(arr.slice(0, n));
    }

    // Rotaciona as labels para que o dia atual fique no final (posição 6)
    // Para isso rotacionamos à esquerda em (todayIndex + 1) posições
    // Exemplo: se hoje é Quarta (3), rotaciona 4 posições para esquerda
    const labelsRotated = rotateArrayLeft(labelsOriginal, (todayIndex + 1) % 7);

    // Monta o array de dados na ordem original
    const chartDataOriginal = new Array(7).fill(0);
    for (const [day, value] of Object.entries(stats.last_days)) {
      const index = dayMap[day];
      if (index !== undefined) {
        chartDataOriginal[index] = value;
      }
    }

    // Rotaciona os dados da mesma forma que as labels
    const chartDataRotated = rotateArrayLeft(chartDataOriginal, (todayIndex + 1) % 7);

    // Atualiza os dados e labels do gráfico
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

// Cria o gráfico ao carregar a página
window.onload = () => {
  createChart();
};
