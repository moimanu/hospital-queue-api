import { db } from './db';

// Função para gerar um horário aleatório em um intervalo de tempo a partir de uma data base
function generateRandomTime(from: Date, to: Date): string {
  const randomTimestamp = from.getTime() + Math.random() * (to.getTime() - from.getTime());
  const randomDate = new Date(randomTimestamp);
  return randomDate.toISOString().slice(0, 19).replace('T', ' '); // Formato 'YYYY-MM-DD HH:mm:ss'
}

// Função para gerar 100 registros
function generateInsertStatements() {
  const inserts: string[] = [];
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7); // Definir a data de 7 dias atrás

  for (let i = 0; i < 100; i++) {
    // Gerar uma arrival_time aleatória nos últimos 7 dias
    const arrivalTime = generateRandomTime(sevenDaysAgo, today);

    // Gerar tempos aleatórios a partir de arrival_time
    const triageCallTime = generateRandomTime(new Date(arrivalTime), new Date(new Date(arrivalTime).getTime() + 2 * 60 * 60 * 1000)); // até 2 horas após arrival_time
    const urgencyDefinitionTime = generateRandomTime(new Date(triageCallTime), new Date(new Date(triageCallTime).getTime() + 1 * 60 * 60 * 1000)); // até 1 hora após triageCallTime

    // Determinar o intervalo entre urgency_definition_time e appointment_call_time baseado na urgência
    const urgencies = ['red', 'orange', 'yellow', 'green', 'blue'];
    const urgency = urgencies[Math.floor(Math.random() * urgencies.length)];

    // Definir o intervalo padrão para appointmentDelayInMinutes
    let appointmentDelayInMinutes: number = 0;

    // Ajustar o valor de appointmentDelayInMinutes conforme a urgência
    switch (urgency) {
      case 'red':
        appointmentDelayInMinutes = 0; // 0 minutos para 'red'
        break;
      case 'orange':
        appointmentDelayInMinutes = Math.floor(Math.random() * (15 - 10 + 1)) + 10; // Aleatório entre 10 e 15 minutos para 'orange'
        break;
      case 'yellow':
        appointmentDelayInMinutes = Math.floor(Math.random() * (40 - 25 + 1)) + 25; // Aleatório entre 25 e 40 minutos para 'yellow'
        break;
      case 'green':
        appointmentDelayInMinutes = Math.floor(Math.random() * (60 - 40 + 1)) + 40; // Aleatório entre 40 e 60 minutos para 'green'
        break;
      case 'blue':
        appointmentDelayInMinutes = Math.floor(Math.random() * (120 - 60 + 1)) + 60; // Aleatório entre 60 e 120 minutos para 'blue'
        break;
    }

    // Calcular o appointment_call_time baseado no intervalo
    const appointmentCallTime = new Date(new Date(urgencyDefinitionTime).getTime() + appointmentDelayInMinutes * 60 * 1000);

    // Calcular os tempos de espera (em segundos)
    const triageWaitTime = Math.floor((new Date(triageCallTime).getTime() - new Date(arrivalTime).getTime()) / 1000); // Em segundos
    const appointmentWaitTime = Math.floor((new Date(appointmentCallTime).getTime() - new Date(urgencyDefinitionTime).getTime()) / 1000); // Em segundos

    // Gerar um status aleatório
    const statuses = ['finished'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    // Gerar os inserts
    const insertStatement = `
      INSERT INTO RecordFinished (patient_id, arrival_time, triage_call_time, urgency_definition_time, urgency_classification, appointment_call_time, triage_wait_time, appointment_wait_time, status)
      VALUES (
        'patient_${i + 1}', 
        '${arrivalTime}', 
        '${triageCallTime}', 
        '${urgencyDefinitionTime}', 
        '${urgency}', 
        '${appointmentCallTime.toISOString().slice(0, 19).replace('T', ' ')}', 
        ${triageWaitTime}, 
        ${appointmentWaitTime}, 
        '${status}'
      );
    `;
    inserts.push(insertStatement);
  }

  return inserts.join('\n');
}

interface RowCount {
  count: number;
}

export function initializeDatabase() {
  // Verifica se a tabela "Record" está vazia
  const rowCount = db.prepare("SELECT COUNT(*) as count FROM RecordFinished").get() as RowCount;

  if (rowCount.count === 0) {
    // Caso a tabela esteja vazia, insere os 100 registros
    const insertStatements = generateInsertStatements();
    console.log("Inserindo 100 registros...");
    db.exec(insertStatements);
    populateLastDays();
  } else {
    console.log("A tabela já contém registros. Nenhuma inserção necessária.");
  }
}

function populateLastDays() {
  // Executa a consulta SQL para preencher a tabela LastDays
  const query = `
    INSERT INTO LastDays (date, quantity)
    SELECT 
        DATE(arrival_time) AS date, 
        COUNT(*) AS quantity
    FROM 
        RecordFinished
    GROUP BY 
        DATE(arrival_time);
  `;

  db.exec(query);
  console.log('Tabela LastDays foi preenchida com a quantidade de registros por data.');
}
