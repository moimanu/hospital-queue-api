// ===================== Funções auxiliares =====================

// Formata tempo médio "Xh Ymin Zs" ou "..."
function formatAvgTime(seconds) {
  if (seconds === 0) return '...';
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

// Calcula "há Xh Ymin" para timestamps ISO
function timeAgo(isoDate) {
  const now = new Date();
  const past = new Date(isoDate);
  const diffMs = now.getTime() - past.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'agora mesmo';
  const hrs = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;
  let result = '';
  if (hrs > 0) result += `${hrs}h `;
  if (mins > 0) result += `${mins}min`;
  return result.trim();
}

// ===================== Gráfico =====================
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
        y: { beginAtZero: true, precision: 0, stepSize: 1 }
      },
      plugins: { legend: { display: false } }
    }
  });
}

// ===================== Atualização do DOM =====================
function updateLastAppointments(appointments) {
  const listEl = document.getElementById('last-appointments-list');
  if (!listEl) return;
  listEl.innerHTML = '';
  appointments.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="icon-sub-card">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          class="lucide lucide-bell-plus-icon lucide-bell-plus">
          <path d="M10.268 21a2 2 0 0 0 3.464 0"/>
          <path d="M15 8h6"/>
          <path d="M18 5v6"/>
          <path d="M20.002 14.464a9 9 0 0 0 .738.863A1 1 0 0 1 20 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 8.75-5.332"/>
        </svg>
      </div>
      <p>${timeAgo(item.called_at)}</p>
    `;
    listEl.appendChild(li);
  });
}

function updateQueueData(stats) {
  if (!stats || !stats.current_state) return;

  // Total de pessoas
  const totalPeopleEl = document.querySelector('.counter');
  if (totalPeopleEl) totalPeopleEl.textContent = stats.total_people ?? '0';

  // Última atualização
  const lastUpdateEl = document.querySelector('.last-update-caption');
  if (lastUpdateEl && stats.last_update) {
    const lastUpdateDate = new Date(stats.last_update);
    lastUpdateEl.textContent = `Última atualização: ${lastUpdateDate.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}`;
  }

  // Cards por classificação
  const stateMap = { triage:'triage', red:'red', orange:'orange', yellow:'yellow', green:'green', blue:'blue' };
  for (const [stateKey, cardId] of Object.entries(stateMap)) {
    const card = document.getElementById(cardId);
    if (!card) continue;
    const count = stats.current_state[stateKey]?.count ?? 0;
    const avgTimeSeconds = stats.current_state[stateKey]?.avg_time ?? 0;
    const countEl = card.querySelector('.count-manchester h3');
    if (countEl) countEl.textContent = count;
    if (stateKey !== 'red') {
      const avgTimeEl = card.querySelector('.time-caption p');
      if (avgTimeEl) avgTimeEl.textContent = `Média de espera: ${formatAvgTime(avgTimeSeconds)}`;
    }
  }

  // Card "em triagem"
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
      if (triageCard && triageCard.parentNode) triageCard.insertAdjacentElement('afterend', inTriageCard);
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
  } else if (inTriageCard) {
    inTriageCard.remove();
  }

  // Atualiza gráfico last_days
  if (chart && stats.last_days) {
    const dayMap = { Sunday:0, Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6 };
    const labelsOriginal = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
    const todayIndex = new Date().getDay();
    const rotateArrayLeft = (arr,n)=>arr.slice(n).concat(arr.slice(0,n));

    const labelsRotated = rotateArrayLeft(labelsOriginal,(todayIndex+1)%7);
    const chartDataOriginal = new Array(7).fill(0);
    for(const [day,value] of Object.entries(stats.last_days)){
      const index = dayMap[day];
      if(index!==undefined) chartDataOriginal[index]=value;
    }
    chart.data.labels = labelsRotated;
    chart.data.datasets[0].data = rotateArrayLeft(chartDataOriginal,(todayIndex+1)%7);
    chart.update();
  }

  // Últimos 10 atendimentos
  if(stats.last10Appointments) updateLastAppointments(stats.last10Appointments);
}

// ===================== SSE com reconexão automática =====================
function createSSE() {
  const evtSource = new EventSource('https://hospital-queue-api.onrender.com/api/sse/events'); // http://localhost:3000/api/sse/events (para testar localmente)

  evtSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    updateQueueData(data);
    updateLastAppointments(data.last10Appointments || []);
  };

  evtSource.onerror = () => {
    console.warn("SSE connection lost, reconnecting in 3s...");
    evtSource.close();
    setTimeout(createSSE, 3000); // tenta reconectar após 3 segundos
  };
}

// ===================== Botão mostrar/esconder =====================
const toggleBtn = document.getElementById('toggle-last-appointments');
const lastsList = document.getElementById('last-appointments-list');

toggleBtn.addEventListener('click', () => {
  const isClosed = lastsList.style.maxHeight === '0px' || lastsList.style.maxHeight === '0';
  if (isClosed) {
    lastsList.style.maxHeight = lastsList.scrollHeight + 'px';
    toggleBtn.textContent = 'Esconder';
  } else {
    lastsList.style.maxHeight = '0';
    toggleBtn.textContent = 'Visualizar';
  }
});

// ===================== Inicialização =====================
window.onload = () => {
  createChart();
  createSSE(); // inicia o SSE com reconexão automática
};
