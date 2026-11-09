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

## Cronômetro de descanso e notificações

- Descanso: **3 min** em exercícios que trabalham quadríceps (agachamento, leg press, extensora, afundo)
  e **2 min** nos demais (`descanso` no `programa.json`). O aquecimento continua com 1 min.
- Ao marcar ✓ numa série, o cronômetro começa e o app pede à API `api/lembrete.js` para mandar um
  web push quando o tempo acabar. O aviso chega mesmo com o celular bloqueado ou o app fechado.
  Pular ou começar outro descanso cancela o aviso anterior.
- `sw.js` é o service worker que mostra a notificação.
- Chaves VAPID nas variáveis `VAPID_PUBLIC_KEY` e `VAPID_PRIVATE_KEY` do projeto na Vercel.
- iPhone: as notificações só funcionam com o app adicionado à tela de início (iOS 16.4 ou mais novo).

## Onde ficam os registros

App publicado na Vercel: https://caderno-de-treino-six.vercel.app (projeto `caderno-de-treino`).

- O app pede um PIN na primeira vez (variável de ambiente `APP_PIN` no projeto da Vercel).
- `api/dados.js` grava cada dia como um arquivo próprio (`dias/AAAA-MM-DD.json`) no Vercel Blob privado
  `caderno-de-treino-dados`. Só a API, com o token do projeto, lê esses arquivos.
- No celular, toda alteração entra numa fila e só sai dela quando a API confirma a gravação.
  Sem internet, o app avisa e reenvia sozinho depois.

Formato de um dia:

```json
{
  "treino": "upA",
  "ex": { "supino-reto-halt": { "rest": "", "sets": [ { "kg": "40", "r": "12", "ok": true } ] } },
  "note": "",
  "escolha": "loA",
  "trocas": { "0": "custom:Supino na máquina Hammer" },
  "ajustes": { "0": { "series": 4, "reps": "5–7" } }
}
```

### Publicar uma nova versão

Os arquivos desta pasta são a raiz do projeto na Vercel (`index.html`, `programa.json`, `manifest.json`,
`package.json`, `api/dados.js`). A Vercel ainda não está ligada ao GitHub; dá para ligar em
Project Settings → Git, com Root Directory `app-treino`.
