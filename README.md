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

