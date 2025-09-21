import { db } from './db';
import { updateCache } from "../services/cache/syncService";

// Utilitário para converter Date -> 'YYYY-MM-DD HH:mm:ss'
function formatDate(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

// Gera uma data aleatória entre dois pontos
function generateRandomTime(from: Date, to: Date): Date {
  const randomTimestamp = from.getTime() + Math.random() * (to.getTime() - from.getTime());
  return new Date(randomTimestamp);
}

// Função para gerar 100 registros
function generateInsertStatements() {
  const inserts: string[] = [];
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  for (let i = 0; i < 100; i++) {
    const arrivalTime = generateRandomTime(sevenDaysAgo, today);

    const triageCallTime = generateRandomTime(
      new Date(arrivalTime.getTime() + 1 * 60 * 1000),
      new Date(arrivalTime.getTime() + 25 * 60 * 1000)
    );

    const urgencyDefinitionTime = generateRandomTime(
      triageCallTime,
      new Date(triageCallTime.getTime() + 60 * 60 * 1000)
    );

    const urgencies = ['red', 'orange', 'yellow', 'green', 'blue'];
    const urgency = urgencies[Math.floor(Math.random() * urgencies.length)];

    let appointmentDelayInMinutes: number = 0;

    switch (urgency) {
      case 'red':
        appointmentDelayInMinutes = 0;
        break;
      case 'orange':
        appointmentDelayInMinutes = Math.floor(Math.random() * 6) + 10;
        break;
      case 'yellow':
        appointmentDelayInMinutes = Math.floor(Math.random() * 16) + 25;
        break;
      case 'green':
        appointmentDelayInMinutes = Math.floor(Math.random() * 21) + 40;
        break;
      case 'blue':
        appointmentDelayInMinutes = Math.floor(Math.random() * 61) + 60;
        break;
    }

    const appointmentCallTime = new Date(urgencyDefinitionTime.getTime() + appointmentDelayInMinutes * 60000);

    const triageWaitTime = Math.floor((triageCallTime.getTime() - arrivalTime.getTime()) / 1000);
    const appointmentWaitTime = Math.floor((appointmentCallTime.getTime() - urgencyDefinitionTime.getTime()) / 1000);

    const status = 'finished';

    // Gerando o id negativo manualmente
    const id = -(i + 1);  // Gerar IDs negativos como -1, -2, ...

    const insertStatement = `
      INSERT INTO RecordFinished (
        id, patient_id, arrival_time, triage_call_time, urgency_definition_time,
        urgency_classification, appointment_call_time,
        triage_wait_time, appointment_wait_time, status, finished_at
      ) VALUES (
        ${id}, 'patient_${i + 1}',
        '${formatDate(arrivalTime)}',
        '${formatDate(triageCallTime)}',
        '${formatDate(urgencyDefinitionTime)}',
        '${urgency}',
        '${formatDate(appointmentCallTime)}',
        ${triageWaitTime},
        ${appointmentWaitTime},
        '${status}',
        '${formatDate(appointmentCallTime)}'
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
  const rowCount = db.prepare("SELECT COUNT(*) as count FROM RecordFinished").get() as RowCount;

  if (rowCount.count === 0) {
    const insertStatements = generateInsertStatements();
    console.log("\n📊 Inserindo 100 registros...");
    db.exec(insertStatements);
    populateLastDays();

    updateCache().catch(console.error);
    console.log("\n🔥 Sincronização concluída...");
  } else {
    console.log("\n👍 A tabela já contém registros. Nenhuma inserção necessária.");
  }
}

function populateLastDays() {
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
  console.log('\n📅 Tabela LastDays foi preenchida com a quantidade de registros por data.');  
}
