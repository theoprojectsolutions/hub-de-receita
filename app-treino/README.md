# Caderno de Treino

App para celular com um programa Upper/Lower de 5 treinos por semana (~1h).

- `programa.json`: os dados do programa (dias da semana, treinos, exercícios, séries, reps e descanso). Para trocar um exercício ou o dia de um treino, edite este arquivo.
- `index.html`: o app. Abre num calendário mensal; tocar num dia abre o treino daquele dia.

## Estrutura do treino (desde 23/11/2026)

| Dia | Treino | Exercícios |
|-----|--------|------------|
| Seg | **Push** | Supino reto máquina 4×6–10 · Supino inclinado halteres 3×8–10 · Crossover 3×10–12 · Elevação lateral máquina 4×12–15 · Elevação frontal 3×10–12 · Tríceps pulley 4×10–12 |
| Ter | Lower A | (igual ao anterior) |
| Qua | **Pull** | Puxada aberta 4×8–10 · Remada curvada Smith 3×8–10 · Remada baixa neutra 3×8–10 · Crucifixo invertido 3×12–15 · Rosca direta halteres 3×8–10 · Rosca martelo 3×10–12 |
| Qui | Descanso | |
| Sex | Lower B | (igual ao anterior) |
| Sáb | **Upper** | Supino inclinado máquina · Pull down · Serrote · Elevação lateral polia · Tríceps testa · Tríceps francês · Rosca Scott (7 × 3 séries) |
| Dom | Descanso | |

Volume semanal de cima (séries válidas): peito 13, costas 16, ombros 13, bíceps 9, tríceps 10.

`programa.json` guarda as divisões por data em `semanas`: antes de 23/11 vale a divisão antiga
(Upper A/B/C, marcados como `arquivado`), então o histórico das primeiras semanas continua certo.

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

## Fotos, descanso real e ordem dos exercícios

- **Fotos:** cada exercício tem o botão "Foto" (abre a câmera). A foto é reduzida no celular
  (até 1280 px, JPEG) e salva no Blob privado em `fotos/AAAA-MM-DD/<exercicio>-<hora>.jpg`
  pela API `api/fotos.js`. Tocar na miniatura abre a foto; dá para apagar (dois toques).
- **Descanso real:** ao apertar "Pular" no cronômetro, o app grava em `desc` (segundos) quanto
  você descansou depois daquela série e mostra "Descanso real 1:42 · meta 2:00" embaixo dela
  (em vermelho se passou mais de 15 s da meta).
- **Ordem:** segure a alça ⋮⋮ à esquerda do nome e arraste. A nova ordem fica salva em `ordem`
  e segue nas próximas vezes desse treino.

## Histórico de volume

No calendário, "Ver histórico de todas as semanas" abre a tela `#historico`:
gráfico de séries válidas por semana (últimas 12) e, para cada semana desde o primeiro
registro, treinos feitos, séries válidas, volume (kg × reps) e séries por grupo muscular
comparadas com a meta. "ver dias" lista os treinos da semana e abre cada um.

Exercícios digitados à mão ("Outro exercício") contam para o grupo reconhecido pelo nome
(ex.: "Hack" → quadríceps e glúteos, "Pull down" → costas). Adutora não conta para nenhum grupo.

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
