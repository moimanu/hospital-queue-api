# PROJETO - Fila de Hospital em Tempo Real

## Sumário

- [Contexto](#contexto)
- [Ideia](#ideia)
- [Resumo da estrutura](#resumo-da-estrutura)
- [Estrutura do backend](#estrutura-do-backend)
- [Instruções para configurar e executar o backend](#instruções-para-configurar-e-executar-o-backend)
- [Rotas de Logs](#rotas-de-logs)
- [Ciclo de vida de um registro](#ciclo-de-vida-de-um-registro)
- [Exemplo de Registro e Evolução nas Requisições](#exemplo-de-registro-e-evolução-nas-requisições)
- [Banco de dados](#banco-de-dados)
- [Estrutura do frontend](#estrutura-do-frontend)

---

## Contexto

Existe um hospital. O hospital possui um telão de atendimento dos pacientes, informando a fila. Este telão, provavelmente depende da interação dos funcionários. No entanto, o telão é exibido apenas localmente.

## Ideia

Criar uma API para fornecer endpoints para cada uma das interações que os funcionários realizam com o sistema de atendimento (do hospital). Essa API seria responsável por APENAS receber os logs. A partir daí, o backend ficaria responsável por atualizar um RealTime Database de um projeto no Firebase, que armazenaria informações extremamente simples. Seria necessário criar um banco local, também, para registrar todas as informações, o que não irá sobrecarregar os limites do Firebase. O front-end (hospedado via Hosting Firebase), então, estaria conectado diretamente com o RealTime Database, sendo atualizado em tempo real. Dessa forma, seria possível expor a fila do hospital em tempo real para os cidadãos da cidade. Importante ressaltar que o sistema não armazenará informações pessoais, como nome, idade, cpf ou outras informações sensíveis.

## Resumo da estrutura

A API recebe os logs do hospital e os salva localmente, sincronizando-os em tempo real com o Firebase. O front-end no Firebase mostra a fila atualizada ao público, sem expor dados pessoais.

`Sistema do Hospital` → `API (Backend) ⇔ Banco de Dados Local` → `RealTime Database` → `FrontEnd (Hosting Firebase)`

---

## Estrutura do backend

```
backend/
├── node_modules/                              # Dependências do Node.js instaladas pelo npm
│
├── src/                                       # Código-fonte principal do backend
│ │
│ ├── config/                                  # Configurações da aplicação
│ │ └── swagger.ts                             # Configuração da documentação da API (Swagger)
│ │
│ ├── controllers/                             # Controladores das rotas
│ │ └── logController.ts                       # Controla requisições relacionadas a registros (logs)
│ │
│ ├── database/                                # Configuração e conexão com o banco de dados
│ │ └── db.ts                                  # Conexão com SQLite via better-sqlite3
│ │
│ ├── firebase/                                # Integração com Firebase
│ │ ├── exampleJsonRealtimeDatabase.json       # Exemplo da estrutura atual do Realtime Database
│ │ ├── firebaseAdmin.ts                       # Configuração do SDK Admin do Firebase
│ │ └── serviceAccountKey.json                 # Credenciais do Firebase
│ │
│ ├── helpers/                                 # Funções utilitárias
│ │ ├── dateHelper.ts                          # Funções para manipulação de datas    
│ │ └── handleLogAction.ts                     # Lida com diferentes tipos de logs
│ │
│ ├── models/                                  # Modelos de dados
│ │ └── hospitalRecord.ts                      # Modelo de registro hospitalar
│ │
│ ├── repositories/                            # Camada de acesso a dados
│ │ ├── brokenRecordRepository.ts              # Backups de registros quebrados
│ │ ├── lastDaysRepository.ts                  # Contagem de entradas por dia
│ │ ├── recordFinishedRepository.ts            # Backups de registros finalizados
│ │ └── recordRepository.ts                    # CRUD principal da tabela de registros
│ │
│ ├── routes/                                  # Definição de rotas
│ │ ├── index.ts                               # Rotas principais
│ │ └── logRoutes.ts                           # Rotas de logs
│ │
│ ├── routines/                                # Rotinas
│ │ └── cancelTimeout.ts                       # Rotina para cancelamento de registros
│ │
│ ├── services/                                # Serviços de regras de negócio
│ │ ├── firebaseSyncService.ts                 # Sincroniza dados com Firebase
│ │ ├── logAppointmentCallService.ts           # Registro de chamadas de atendimento
│ │ ├── logEntryService.ts                     # Registro de entradas no hospital
│ │ ├── logTriageCallService.ts                # Registro de chamadas de triagem
│ │ └── logUrgencyDefinitionService.ts         # Definição de classificação de urgência
│ │
│ ├── types/                                   # Definições de tipos TypeScript
│ │ └── swagger-jsdoc.d.ts                     # Tipos para integração com swagger-jsdoc
│ │
│ └── index.ts                                 # Ponto de entrada do backend
│ 
├── .gitignore                                 # Arquivos e pastas ignorados pelo Git
├── database.db                                # Banco de dados SQLite
├── package-lock.json                          # Registro exato das versões das dependências
├── package.json                               # Metadados e dependências do projeto
└── tsconfig.json                              # Configuração do compilador TypeScript
```

---

## Instruções para configurar e executar o backend

### Instalar as dependências  
Com o Node.js instalado, **e dentro da pasta backend**, execute o comando para instalar todas as dependências listadas no `package.json`:  

```
npm install
```

### Configurar as credenciais do Firebase  
Para a integração com o Firebase funcionar corretamente, você precisa adicionar o arquivo de credenciais `serviceAccountKey.json` na pasta `src/firebase/`. Este arquivo pode ser obtido no console do Firebase, na seção de configurações do projeto, criando uma nova chave para a conta de serviço. Sem este arquivo, a conexão com o Firebase Admin SDK não funcionará, e funcionalidades dependentes do Firebase ficarão indisponíveis.

### Rodar o backend em modo de desenvolvimento  
Após configurar as credenciais, rode o servidor localmente com o comando:  

```
npm run dev
```

Isso iniciará o backend usando o `ts-node-dev`, permitindo recarregamento automático ao salvar arquivos.

### Acessar a aplicação  
Você poderá acessar as rotas definidas para manipular os registros hospitalares no endereço:  

```
http://localhost:3000/api-docs
```

---

## Rotas de Logs

O backend lida com as 4 rotas principais para manipulação de registros no sistema de fila.

---

### POST/logs/entry

**O que ela faz:**  
Registra a chegada de um paciente no hospital.

**Recebe:**  
`patient_id` (String)

**Condições:**  
- Se houver algum registro desse mesmo paciente que não foi finalizado ou cancelado, ele será cancelado para possibilitar outro registro zerado.

---

### PUT/logs/triage-call

**O que ela faz:**  
Registra a chamada do paciente para a triagem no hospital.

**Recebe:**  
`patient_id` (String)

**Condições:**  
- Se o paciente não for encontrado, cria-se um novo registro, sem dados, e o atualiza com os dados do log em questão.  

---

### PUT/logs/urgency-definition

**O que ela faz:**  
Registra a definição da classificação de urgência de um paciente.

**Recebe:**  
`patient_id` (String)  
`urgency_classification` (String)

**Condições:**  
- Se o paciente não for encontrado, cria-se um novo registro, sem dados, e o atualiza com os dados do log em questão.  

---

### PUT/logs/appointment-call

**O que ela faz:**  
Registra a chamada do paciente para o atendimento no hospital.

**Recebe:**  
`patient_id` (String)

**Condições:**  
- Se o paciente não for encontrado, cria-se um novo registro, sem dados, e o atualiza com os dados do log em questão.  

---

## Ciclo de vida de um registro

| Requisição                  | Campos Atualizados                                    | Status Atualizado        | Observações                                                                                     |
|----------------------------|------------------------------------------------------|-------------------------|------------------------------------------------------------------------------------------------|
| **POST/logs/entry**        | `patient_id`, `arrival_time`, `urgency_classification = "triage"` | `"Waiting Triage"`      | Cancela registros ativos anteriores do paciente, antes de criar novo, e os move para `BrokenRecord`. |
| **PUT/logs/triage-call**   | `triage_call_time`, `triage_wait_time`               | `"In Triage"`           | Atualiza tempo de espera baseado em `arrival_time`.                                            |
| **PUT/logs/urgency-definition** | `urgency_definition_time`, `urgency_classification` | `"Waiting Appointment"` | Recebe a classificação de urgência e atualiza o status.                                       |
| **PUT/logs/appointment-call** | `appointment_call_time`, `appointment_wait_time`     | `"Finished"`            | Atualiza tempo de espera baseado em `urgency_definition_time` e move para `RecordFinished`. |

## Exemplo de Registro e Evolução nas Requisições

| Etapa / Campo                 | id | patient_id | arrival_time         | triage_call_time      | urgency_definition_time | urgency_classification | appointment_call_time   | triage_wait_time | appointment_wait_time | status                  |
|------------------------------|----|------------|-----------------------|------------------------|--------------------------|------------------------|--------------------------|------------------|------------------------|--------------------------|
| POST /logs/entry             | 1  | 12345      | 2025-08-12 08:00:00   | —                      | —                        | triage                 | —                        | —                | —                      | Waiting Triage       |
| PUT /logs/triage-call        | 1  | 12345      | 2025-08-12 08:00:00   | 2025-08-12 08:15:00    | —                        | triage                 | —                        | 900              | —                      | In Triage               |
| PUT /logs/urgency-definition | 1  | 12345      | 2025-08-12 08:00:00   | 2025-08-12 08:15:00    | 2025-08-12 08:30:00      | orange                | —                        | 900              | —                      | Waiting Appointment   |
| PUT /logs/appointment-call   | 1  | 12345      | 2025-08-12 08:00:00   | 2025-08-12 08:15:00    | 2025-08-12 08:30:00      | orange                | 2025-08-12 08:50:00      | 900              | 1200                   | Finished               |

> - Os campos `triage_wait_time` e `appointment_wait_time` representam tempo de espera em segundos.

### Explicação do Exemplo

- **POST /logs/entry:** Paciente "12345" chega no hospital às 08:00. O registro é criado com o status **"Waiting Triage"**.
- **PUT /logs/triage-call:** Paciente chamado para triagem às 08:15. O tempo de espera para triagem é registrado como 15 minutos (900 segundos). O status é atualizado para **"In Triage"**.
- **PUT /logs/urgency-definition:** Triagem finalizada e urgência definida como **"orange"** às 08:30. O status é alterado para **"Waiting Appointment"**.
- **PUT /logs/appointment-call:** Paciente chamado para atendimento às 08:50. O tempo de espera para atendimento é registrado como 20 minutos (1200 segundos). O status é atualizado para **"Finished"** e o registro é movido para backup.

---

## Banco de Dados

### Tabela: `Record`

| Campo                     | Tipo                                                            |
|---------------------------|-----------------------------------------------------------------|
| `id`                      | INTEGER PRIMARY KEY AUTOINCREMENT                               |
| `patient_id`              | TEXT NOT NULL                                                   |
| `arrival_time`            | TEXT (hora no formato HH:MM:SS)                                 |
| `triage_call_time`        | TEXT (hora no formato HH:MM:SS)                                 |
| `urgency_definition_time` | TEXT (hora no formato HH:MM:SS)                                 |
| `urgency_classification`  | TEXT (ex: "triage", "red", "orange", "yellow", "green", "blue") |
| `appointment_call_time`   | TEXT (hora no formato HH:MM:SS)                                 |
| `triage_wait_time`        | INTEGER (duração em segundos)                                   |
| `appointment_wait_time`   | INTEGER (duração em segundos)                                   |
| `status`                  | TEXT (ex: "Waiting Triage", "In Triage", "In Triage (superimposed)", "Waiting Appointment", "Finished") |

---

### Tabela: `BrokenRecord`

Mesmos campos da tabela `Record`, com a adição de:

| Campo         | Tipo                                                               |
|---------------|--------------------------------------------------------------------|
| `broked_at`   | TEXT (timestamp do momento do envio para a tabela, padrão `datetime('now')`) |
| `reason` | TEXT (motivo pelo qual foi adicionado à tabela de registros quebrados)
---

### Tabela: `RecordFinished`

Mesmos campos da tabela `Record`, com a adição de:

| Campo        | Tipo                                                               |
|--------------|--------------------------------------------------------------------|
| `finished_at` | TEXT (timestamp do momento da finalização, padrão `datetime('now')`) |

---

### Tabela: `LastDays`

| Campo         | Tipo                                                              |
|---------------|-------------------------------------------------------------------|
| `date`        | TEXT (data no formato ISO, ex: `YYYY-MM-DD`)                      |
| `quantity`    | INTEGER (quantidade de registros para o dia especificado)         |

> **Objetivo da Tabela `LastDays`:**  
> A tabela `LastDays` armazena a quantidade de registros de pacientes para cada dia. Essa tabela pode ser utilizada para fins de contagem diária ou para acompanhar a quantidade de registros inseridos em um período.

---

### Observações gerais

- O banco de dados utiliza SQLite com a biblioteca `better-sqlite3`.  
- Registros ativos ficam na tabela `Record`.  
- Registros quebrados são movidos para `BrokenRecord`.  
- Registros finalizados são movidos para `RecordFinished`.  
- O campo `triage_wait_time` e `appointment_wait_time` armazenam a duração em segundos (em formato INTEGER).

---

## Estrutura do frontend

```
frontend/
├── .firebase/                                 # Arquivos internos do Firebase
│ └── hosting.cHVibGlj.cache                   # Cache do Firebase Hosting
│
├── public/                                    # Arquivos públicos servidos pelo frontend
│ ├── img/                                     # Imagens usadas no frontend
│ ├── index.html                               # Página HTML principal
│ ├── script.js                                # Lógica JavaScript do frontend
│ └── style.css                                # Estilos CSS
│
├── .firebaserc                                # Configurações locais do projeto Firebase
├── .gitignore                                 # Arquivos e pastas ignorados pelo Git
└── firebase.json                              # Configuração do Firebase Hosting
```
