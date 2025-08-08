# PROJETO - Fila de Hospital em Tempo Real

## Contexto: 

Existe um hospital. O hospital possui um telão de atendimento dos pacientes, informando a fila. Este telão, provavelmente depende da interação dos funcionários. No entanto, o telão é exibido apenas localmente.

## Ideia: 

Criar uma API para fornecer endpoints para cada uma das interações que os funcionários realizam com o sistema de atendimento (do hospital). Essa API seria responsável por APENAS receber os logs. A partir daí, o backend ficaria responsável por atualizar um RealTime Database de um projeto no Firebase, que armazenaria informações extremamente simples. Seria necessário criar um banco local, também, para registrar todas as informações, o que não irá sobrecarregar os limites do Firebase. O front-end (hospedado via Hosting Firebase), então, estaria conectado diretamente com o RealTime Database, sendo atualizado em tempo real. Dessa forma, seria possível expor a fila do hospital em tempo real para os cidadãos da cidade. Importante ressaltar que o sistema não armazenará informações pessoais, como nome, idade, cpf ou outras informações sensíveis.

## Resumo da estrutura:
A API recebe os logs do hospital e os salva localmente, sincronizando-os em tempo real com o Firebase. O front-end no Firebase mostra a fila atualizada ao público, sem expor dados pessoais.

`Sistema do Hospital` → `API (Backend) ⇔ Banco de Dados Local` → `RealTime Database` → `FrontEnd (Hosting Firebase)`

# 🔸Estrutura do backend

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
│ │ ├── firebaseAdmin.ts                       # Configuração do SDK Admin do Firebase
│ │ └── serviceAccountKey.json                 # Credenciais do Firebase
│ │
│ ├── helpers/                                 # Funções utilitárias
│ │ ├── handleLogAction.ts                     # Lida com diferentes tipos de logs
│ │ └── time.ts                                # Funções para manipulação de datas e horários
│ │
│ ├── models/                                  # Modelos de dados
│ │ └── hospitalRecord.ts                      # Modelo de registro hospitalar
│ │
│ ├── repositories/                            # Camada de acesso a dados
│ │ ├── recordBackupRepository.ts              # Backups de registros em andamento
│ │ ├── recordFinishedBackupRepository.ts      # Backups de registros finalizados
│ │ └── recordRepository.ts                    # CRUD principal da tabela de registros
│ │
│ ├── routes/                                  # Definição de rotas
│ │ ├── index.ts                               # Rotas principais
│ │ └── logRoutes.ts                           # Rotas de logs
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
├── README.md                                  # Documentação inicial do backend
└── tsconfig.json                              # Configuração do compilador TypeScript
```

# Instruções para configurar e executar o backend

Siga os passos abaixo para configurar e iniciar o backend localmente.

## Instalar as dependências 
Com o Node.js instalado, **e dentro da pasta backend**, execute o comando para instalar todas as dependências listadas no `package.json`:  

```
npm install
```

## Configurar as credenciais do Firebase
Para a integração com o Firebase funcionar corretamente, você precisa adicionar o arquivo de credenciais `serviceAccountKey.json` na pasta `src/firebase/`. Este arquivo pode ser obtido no console do Firebase, na seção de configurações do projeto, criando uma nova chave para a conta de serviço. Sem este arquivo, a conexão com o Firebase Admin SDK não funcionará, e funcionalidades dependentes do Firebase ficarão indisponíveis.

## Rodar o backend em modo de desenvolvimento
Após configurar as credenciais, rode o servidor localmente com o comando:  

```
npm run dev
```
Isso iniciará o backend usando o `ts-node-dev`, permitindo recarregamento automático ao salvar arquivos.

## Acessar a aplicação
Você poderá acessar as rotas definidas para manipular os registros hospitalares no endereço `http://localhost:3000/api-docs`


# 🔹Estrutura do frontend


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