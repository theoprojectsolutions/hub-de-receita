# Caderno de Treino

App para celular com um programa Upper/Lower de 5 treinos por semana (~1h).

- `programa.json`: os dados do programa (dias da semana, treinos, exercícios, séries, reps e descanso). Para trocar um exercício ou o dia de um treino, edite este arquivo.
- `index.html`: o app. Abre num calendário mensal; tocar num dia abre o treino daquele dia.

## Estrutura do treino

Meta: **15 séries válidas por semana para cada grupo muscular** (peito, costas, ombros, bíceps,
tríceps, quadríceps, posterior, glúteos e panturrilha). Cada série válida conta 1 para cada grupo
listado em `musculos` do exercício (ex.: agachamento conta para quadríceps e glúteos).
Aquecimento não conta. O app mostra o placar da semana abaixo do calendário.

| Dia | Treino | Exercícios | Séries válidas | Tempo estimado |
|-----|--------|-----------|----------------|----------------|
| Seg | Upper A (peito, costas e braços) | 6 | 26 | ~59 min |
| Ter | Lower A (quadríceps e panturrilha) | 5 | 24 | ~52 min |
| Qua | Upper B (ombros, costas e braços) | 6 | 26 | ~59 min |
| Qui | Descanso | | | |
| Sex | Lower B (posterior e glúteos) | 5 | 25 | ~57 min |
| Sáb | Upper C (ombros, peito e braços) | 6 | 23 | ~53 min |
| Dom | Descanso | | | |

Compostos: 1 aquecimento + 3 a 5 séries válidas de 6–10 reps, 90 s de descanso.
Isolados: 3 a 8 séries válidas de 10–15 reps, 60 s de descanso.

## Variar o treino

- **Trocar o treino do dia:** na ficha do dia, toque em "trocar treino" (ou, num dia de descanso, escolha um treino). Vale só para aquele dia.
- **Trocar um exercício:** toque em "variar" e escolha uma das alternativas. A troca continua nas próximas vezes desse treino até você trocar de novo.
- As alternativas de cada exercício ficam em `alternativas` no `programa.json`.

## Onde ficam os registros

Cada dia de treino é salvo como um documento (`AAAA-MM-DD`) no banco de dados do app,
numa área privada da sua conta, no formato:

```json
{
  "treino": "upA",
  "ex": { "supino-reto-barra": { "rest": "", "sets": [ { "kg": "40", "r": "12", "ok": true } ] } },
  "note": "",
  "escolha": "loA",
  "trocas": { "0": "agachamento-smith" }
}
```

Se a nuvem não responder, o app salva no próprio aparelho e envia depois.
