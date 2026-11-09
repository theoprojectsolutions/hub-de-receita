# Caderno de Treino

App para celular com um programa Upper/Lower de 5 treinos por semana (~1h).

- `programa.json`: os dados do programa (dias da semana, treinos, exercícios, séries, reps e descanso). Para trocar um exercício ou o dia de um treino, edite este arquivo.
- `index.html`: o app. Abre num calendário mensal; tocar num dia abre o treino daquele dia.

## Estrutura do treino

| Dia | Treino | Exercícios |
|-----|--------|------------|
| Seg | Upper A (peito e costas) | 6 |
| Ter | Lower A (quadríceps) | 5 |
| Qua | Upper B (costas e ombros) | 6 |
| Qui | Descanso | |
| Sex | Lower B (posterior e glúteos) | 5 |
| Sáb | Upper C (ombros e braços) | 6 |
| Dom | Descanso | |

Cada exercício tem 3 séries: 1 de aquecimento (~50% da carga) + 2 válidas.
Compostos: 6–10 reps, 2 min de descanso. Isolados: 10–15 reps, 75 s.

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
