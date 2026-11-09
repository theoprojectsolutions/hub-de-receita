// API do Caderno de Treino: grava e lê os treinos no Vercel Blob (armazenamento privado).
// Cada dia é um arquivo próprio: dias/AAAA-MM-DD.json. Assim uma gravação nunca apaga outro dia.
import { put, list, get, del } from '@vercel/blob';

const DIA = /^\d{4}-\d{2}-\d{2}$/;
const PASTA = 'dias/';

async function lerArquivo(pathname) {
  const r = await get(pathname, { access: 'private', useCache: false });
  if (!r || r.statusCode !== 200) return null;
  return JSON.parse((await new Response(r.stream).text()) || 'null');
}

// desde: só baixa os dias gravados a partir desse instante (o app guarda o último cursor).
async function ler(desde) {
  const arquivos = [];
  let cursor;
  do {
    const r = await list({ prefix: PASTA, cursor, limit: 1000 });
    arquivos.push(...r.blobs);
    cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);
  const limite = desde ? new Date(desde).getTime() : 0;
  let maisRecente = desde || null;
  const existentes = [];
  const baixar = [];
  for (const b of arquivos) {
    const m = b.pathname.match(/^dias\/(\d{4}-\d{2}-\d{2})\.json$/);
    if (!m) continue;
    existentes.push(m[1]);
    const t = new Date(b.uploadedAt).getTime();
    if (!maisRecente || t > new Date(maisRecente).getTime()) maisRecente = new Date(t).toISOString();
    if (t >= limite) baixar.push([m[1], b.pathname]);
  }
  const dias = {};
  await Promise.all(baixar.map(async ([dia, pathname]) => {
    const dados = await lerArquivo(pathname);
    if (dados !== null) dias[dia] = dados;
  }));
  return { dias, existentes, cursor: maisRecente };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const pin = process.env.APP_PIN;
  if (!pin || req.headers['x-pin'] !== pin) return res.status(401).json({ erro: 'PIN inválido' });

  try {
    if (req.method === 'GET') {
      const desde = typeof req.query?.desde === 'string' && !isNaN(Date.parse(req.query.desde)) ? req.query.desde : null;
      return res.status(200).json(await ler(desde));
    }
    if (req.method === 'PUT') {
      const corpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const { dia, dados } = corpo;
      if (!DIA.test(dia || '')) return res.status(400).json({ erro: 'Data inválida' });
      const pathname = PASTA + dia + '.json';
      if (dados === null || dados === undefined) {
        await del(pathname).catch(() => {});
        return res.status(200).json({ ok: true, dia, apagado: true });
      }
      const json = JSON.stringify(dados);
      if (json.length > 200000) return res.status(413).json({ erro: 'Registro grande demais' });
      await put(pathname, json, {
        access: 'private', allowOverwrite: true, addRandomSuffix: false, contentType: 'application/json',
      });
      return res.status(200).json({ ok: true, dia });
    }
    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ erro: 'Método não permitido' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: 'Falha ao acessar o banco de dados' });
  }
}
