# Caderno de Treino

App para celular com um programa Upper/Lower de 5 treinos por semana (~1h).

- `programa.json`: os dados do programa (dias da semana, treinos, exercícios, séries, reps e descanso). Para trocar um exercício ou o dia de um treino, edite este arquivo.
- `index.html`: o app. Abre num calendário mensal; tocar num dia abre o treino daquele dia.

## Estrutura do treino

| Dia | Treino | Exercícios | Séries válidas |
|-----|--------|-----------|----------------|
| Seg | Upper A | Supino reto halteres 3×6–8 · Remada curvada 3×6–8 · Supino inclinado halteres 3×8–10 · Puxada aberta 3×8–10 · Elevação lateral 4×10–12 · Tríceps pulley 4×10–12 | 20 |
| Ter | Lower A | Agachamento livre 4×6–8 · Leg press 45° 4×8–10 · Extensora 3×10–12 · Mesa flexora 4×10–12 · Gêmeos em pé 4×12–15 | 19 |
| Qua | Upper B | Desenvolvimento halteres 4×8–10 · Remada baixa neutra 4×8–10 · Peck deck 3×10–12 · Rosca direta halteres 4×8–10 · Tríceps testa 4×10–12 · Elevação lateral polia 4×12–15 | 23 |
| Qui | Descanso | | |
| Sex | Lower B | Stiff 4×8–10 · Afundo 3×10/perna · Cadeira flexora 4×10–12 · Elevação pélvica 3×8–10 · Gêmeos sentado 4×12–15 | 18 |
| Sáb | Upper C | Serrote 4×8–10 · Supino reto halteres 3×8–10 · Puxada neutra 3×8–10 · Elevação lateral 4×12–15 · Rosca martelo 4×10–12 · Crucifixo invertido 4×12–15 | 22 |
| Dom | Descanso | | |

Exercícios compostos têm 1 série de aquecimento antes das válidas (não conta no volume).
Descanso: 90 s nos compostos, 60 s nos isolados.

Volume semanal por grupo (séries válidas): peito 12, costas 17, ombros 20, bíceps 8,
tríceps 11, quadríceps 14, posterior 12, glúteos 18, panturrilha 8. Cada série conta para
todos os grupos em `musculos` (ex.: supino reto conta para peito e tríceps).

## Alterar exercícios

Na ficha do dia, toque em "alterar" no exercício para:

- trocar por uma das alternativas;
- digitar qualquer outro exercício;
- mudar o número de séries e as reps;
- mudar o seu tempo de descanso.

A alteração vale a partir daquele dia e segue nas próximas vezes desse treino. "voltar ao original"
desfaz. Também dá para trocar o treino inteiro de um dia em "trocar treino".

## Onde ficam os registros

Cada dia de treino é salvo como um documento (`AAAA-MM-DD`) no banco de dados do app,
numa área privada da sua conta, no formato:

```json
{
  "treino": "upA",
  "ex": { "supino-reto-barra": { "rest": "", "sets": [ { "kg": "40", "r": "12", "ok": true } ] } },
  "note": "",
  "escolha": "loA",
  "trocas": { "0": "custom:Supino na máquina Hammer" },
  "ajustes": { "0": { "series": 4, "reps": "5–7" } }
}
```

Se a nuvem não responder, o app salva no próprio aparelho e envia depois.
