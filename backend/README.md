# Logs do Sistema

## EXISTEM 4 LOGS

- Entrada no hospital  
- Chamada para triagem  
- Definição de urgência  
- Chamada para atendimento  

---

Cada log, enviado para uma API REST, terá o seu próprio endpoint.

**logController**: fará a chamada dos services respectivos a cada endpoint.

---

## POST `/log/entrada-hospital`

**logEntradaHospitalService**:

- **RECEBE:** `id_paciente`  
- **REALIZA:**  
  - Pode criar um novo registro.  
    `[INSERT id, id_paciente, data_atendimento, hora_chegada_hospital, status = "Aguardando Triagem"]`

- **CONDIÇÕES:**  
  - Deve conferir se há algum registro anterior com status `"Aguardando Triagem"` || `"Em triagem"` || `"Aguardando Atendimento"`, do mesmo paciente, e, se houver, cancelar.  
    `[UPDATE status = "Cancelado"]`

---

## UPDATE `/log/chamada-triagem`

**logChamadaTriagemService**:

- **RECEBE:** `id_paciente`  
- **REALIZA:**  
  - Deve atualizar o registro do paciente.  
    `[UPDATE hora_chamada_triagem = now(), status = "Em triagem"]`  
  - Deve armazenar o tempo de espera para triagem.  
    `[UPDATE tempo_espera_triagem = intervalo entre hora_chegada_hospital e hora_chamada_triagem]`

- **CONDIÇÕES:**  
  - Se não houver registro, retorna erro ("Paciente não encontrado.")  
  - Se o registro do paciente estiver com status `"Em Triagem"`, retorna erro ("Paciente já foi chamado pela triagem.")  
  - Se o registro do paciente estiver com status `"Aguardando Atendimento"`, retorna erro ("Paciente já passou pela triagem.")

---

## UPDATE `/log/definicao-urgencia`

**logDefinicaoUrgenciaService**:

- **RECEBE:** `id_paciente`, `classificacao`  
- **REALIZA:**  
  - Deve atualizar o registro do paciente.  
    `[UPDATE hora_definicao_urgencia = now(), status = "Aguardando Atendimento"]`

- **CONDIÇÕES:**  
  - Se não houver registro, retorna erro ("Paciente não encontrado.")  
  - Se o registro do paciente estiver com status `"Aguardando Triagem"`, retorna erro ("Paciente ainda está aguardando triagem.")  
  - Se o registro do paciente estiver com status `"Aguardando Atendimento"`, retorna erro ("Paciente já passou pela triagem.")

---

## UPDATE `/log/chamada-atendimento`

**logChamadaAtendimentoService**:

- **RECEBE:** `id_paciente`  
- **REALIZA:**  
  - Deve atualizar o registro do paciente.  
    `[UPDATE hora_chamada_atendimento = now(), status = "Finalizado"]`  
  - Deve armazenar o tempo de espera para atendimento.  
    `[UPDATE tempo_espera_atendimento = intervalo entre hora_definicao_urgencia e hora_chamada_atendimento]`

- **CONDIÇÕES:**  
  - Se não houver registro, retorna erro ("Paciente não encontrado.")  
  - Se o registro do paciente estiver com status `"Aguardando Triagem"`, retorna erro ("Paciente ainda não foi chamado para triagem.")  
  - Se o registro do paciente estiver com status `"Em Triagem"`, retorna erro ("Paciente ainda está na triagem.")

---

## Banco de dados

### Tabela: `Registro`

| Campo                     | Tipo                                                     |
|---------------------------|----------------------------------------------------------|
| `id`                      | INTEGER PRIMARY KEY AUTOINCREMENT                         |
| `id_paciente`             | TEXT NOT NULL                                            |
| `data_atendimento`        | DATE                                                     |
| `hora_chegada_hospital`   | TIME                                                     |
| `hora_chamada_triagem`    | TIME                                                     |
| `hora_definicao_urgencia` | TIME                                                     |
| `classificacao`           | ENUM("Triagem", "Vermelho", "Laranja", "Amarelo", "Verde", "Azul") |
| `hora_chamada_atendimento`| TIME                                                     |
| `tempo_espera_triagem`    | TEXT                                                     |
| `tempo_espera_atendimento`| TEXT                                                     |
| `status`                  | ENUM("Aguardando Triagem", "Em triagem", "Aguardando Atendimento", "Finalizado", "Cancelado") |

---

DESENVOLVIMENTO 1

# Resumo do Projeto de Logs Hospitalares

## Estrutura Geral

Desenvolvimento de uma **API REST em Node.js + TypeScript** para registrar e controlar o fluxo de atendimento de pacientes no hospital, baseado em logs de eventos.

---

## Logs Implementados (4 Endpoints)

### 1. `POST /logs/entry`
- Registra a chegada do paciente.
- Cancela registros anteriores ativos do paciente.
- Cria um novo registro com status `"Waiting Triage"`.

### 2. `PUT /logs/triage-call`
- Verifica se o paciente existe e está aguardando triagem.
- Atualiza o status para `"In Triage"`.
- Calcula e armazena o tempo de espera desde a chegada.

### 3. `PUT /logs/urgency-definition`
- Verifica se o paciente existe e está na triagem.
- Atualiza o status para `"Waiting Appointment"` com a classificação de urgência.
- Registra o horário da definição de urgência.

### 4. `PUT /logs/appointment-call`
- Verifica se o paciente existe e já passou pela triagem.
- Atualiza o status para `"Finished"`.
- Calcula e armazena o tempo de espera entre a definição de urgência e o atendimento.

---

## Repositório (`RecordRepository`)
- Métodos para:
  - Inserir registro.
  - Buscar o último registro ativo do paciente.
  - Atualizar chamadas de triagem, definição de urgência e atendimento.
  - Cancelar registros anteriores.

---

## Models
- Interface `HospitalRecord`.
- Enums:
  - `UrgencyClassification`: triage, red, orange, yellow, green, blue.
  - `RecordStatus`: Waiting Triage, In Triage, Waiting Appointment, Finished, Canceled.

---

## Refatoração Aplicada

### Helpers de Tempo (`helpers/time.ts`)
Criado para evitar duplicação de código:

- `getCurrentTime()` — retorna hora no formato `HH:MM:SS`.
- `calculateWaitTime(startDate, startTime)` — calcula tempo de espera formatado como `Xm Ys`.
- `formatDuration(ms)` — função utilitária interna para formatar duração.

Esta refatoração foi aplicada nos serviços de triagem e atendimento para tornar o código mais limpo e reutilizável.

---

## Boas Práticas Aplicadas

- Tipagem segura com TypeScript.
- Validação de dados e checagem de status.
- Mensagens de erro claras e coerentes.
- Documentação Swagger completa para todas as rotas.

---

## Próximos Passos Sugeridos

- Testes automáticos.
- Logger de erros.
- Persistência mais robusta (ex: backup dos registros cancelados).
- Geração de relatórios (ex: média de tempo de espera).

---

DESENVOLVIMENTO 2

## Resumo das mudanças na estrutura do banco de dados

### Criação de tabelas de backup

Foram criadas duas novas tabelas para garantir uma **persistência mais robusta** dos dados:

---

### 1. `RecordBackup`

Armazena os registros **cancelados**, preservando todas as informações da tabela principal e adicionando:

- `canceled_at`: armazena automaticamente a data e hora do cancelamento  
  *(valor padrão: `datetime('now')` no SQLite)*

---

### 2. `RecordFinishedBackup`

Armazena os registros **finalizados**, com os mesmos dados da tabela original e uma coluna extra:

- `finished_at`: registra a data e hora da finalização  
  *(valor padrão: `datetime('now')` no SQLite)*

---

### Tipagem coerente

- Todas as colunas de data e hora foram padronizadas com o tipo `TEXT`  
  *(recomendado no SQLite para formato ISO `YYYY-MM-DD HH:MM:SS`)*
- As colunas `id` das tabelas de backup **não usam `AUTOINCREMENT`**, para preservar o ID original do registro.
- Colunas com dados essenciais foram mantidas com `NOT NULL`, especialmente na `RecordFinishedBackup`.

---

DESENVOLVIMENTO 3

## Objetivo

Criar uma função `syncRealtimeDatabase()` para atualizar estatísticas em tempo real no **Firebase Realtime Database** com dados locais do **SQLite**.

---

## Configurações

- Firebase Realtime Database foi configurado usando `firebase-admin`.
- Criado um módulo `firebaseAdmin.ts` que chama `admin.initializeApp()` com:
  - o caminho da chave de serviço (`.json`),
  - e a `databaseURL` do seu projeto.

---

## Dados enviados para o Firebase

A função `syncRealtimeDatabase()` atualiza o nó `stats/` com:

- `last_update`: horário atual em formato ISO.
- `total_people`: quantidade total de registros **exceto** os com status `"in_triage"`.
- `current_state`: estatísticas por nível de urgência:
  - `count`: número de registros no nível.
  - `avg_time`: tempo médio de espera para o nível.
- `last_days`: (opcional) contador de registros por **dia da semana** — usa os dados atuais do Firebase, se existirem.

---

## Refatoração feita

- Criada a função `countAllExceptInTriage()` no `RecordRepository` com a seguinte query:
  ```sql
  SELECT COUNT(*) FROM Record WHERE status != 'In Triage'

---

DESENVOLVIMENTO 4

## Refatoração do `logController`

### Problema original
O controller possuía código **repetitivo** em todas as rotas, como:
- Verificação de campos obrigatórios (`if (!campo)`)
- Execução do serviço (`logXService.doSomething`)
- `try/catch` para tratamento de erros
- Retorno de mensagens padrão

---

### Solução aplicada
Criado um **helper genérico** chamado `handleLogAction` que:
1. Valida campos obrigatórios
2. Executa a ação desejada
3. Retorna resposta HTTP adequada

---

### Estrutura criada
- Novo arquivo: `src/helpers/handleLogAction.ts`
- Função `handleLogAction(req, res, requiredFields, action, successMessage)`
- Cada método do controller passou a usar o helper

---

### Exemplo de antes e depois

**Antes:**
```ts
if (!patient_id) {
  return res.status(400).json({ error: "Missing patient_id" });
}
try {
  logEntryService.register(patient_id);
  return res.status(201).json({ message: "Entry registered successfully." });
} catch (err) {
  return res.status(500).json({ error: "Internal server error." });
}
```
**Depois:**
```ts
return handleLogAction(req, res, ["patient_id"], ({ patient_id }) => {
  logEntryService.register(patient_id);
}, "Entry registered successfully.");
```