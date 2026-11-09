// API do Caderno de Treino: grava e lê os treinos no Vercel Blob (armazenamento privado).
// Os dados ficam em um arquivo JSON por mês: treinos/AAAA-MM.json -> { "AAAA-MM-DD": { ...registro do dia } }
import { put, list, get, BlobPreconditionFailedError } from '@vercel/blob';

const DIA = /^\d{4}-\d{2}-\d{2}$/;
const PASTA = 'treinos/';
const arquivoDoMes = dia => PASTA + dia.slice(0, 7) + '.json';

async function lerArquivo(pathname) {
  const r = await get(pathname, { access: 'private', useCache: false });
  if (!r || r.statusCode !== 200) return { dados: {}, etag: null };
  const texto = await new Response(r.stream).text();
  return { dados: JSON.parse(texto || '{}'), etag: r.blob.etag };
}

async function lerTudo() {
  const arquivos = [];
  let cursor;
  do {
    const r = await list({ prefix: PASTA, cursor, limit: 1000 });
    arquivos.push(...r.blobs);
    cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);
  const dias = {};
  const meses = await Promise.all(arquivos.filter(b => b.pathname.endsWith('.json')).map(b => lerArquivo(b.pathname)));
  for (const m of meses) Object.assign(dias, m.dados);
  return dias;
}

async function gravarDia(dia, registro) {
  const pathname = arquivoDoMes(dia);
  // Lê o mês, troca só o dia e grava de volta. ifMatch impede que duas gravações ao mesmo tempo se apaguem.
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const { dados, etag } = await lerArquivo(pathname);
    if (registro === null) delete dados[dia]; else dados[dia] = registro;
    try {
      await put(pathname, JSON.stringify(dados), {
        access: 'private',
        allowOverwrite: true,
        addRandomSuffix: false,
        contentType: 'application/json',
        cacheControlMaxAge: 60,
        ...(etag ? { ifMatch: etag } : {}),
      });
      return;
    } catch (e) {
      if (!(e instanceof BlobPreconditionFailedError)) throw e;
    }
  }
  throw new Error('Conflito de gravação persistente');
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const pin = process.env.APP_PIN;
  if (!pin || req.headers['x-pin'] !== pin) return res.status(401).json({ erro: 'PIN inválido' });

  try {
    if (req.method === 'GET') {
      return res.status(200).json({ dias: await lerTudo() });
    }
    if (req.method === 'PUT') {
      const corpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const { dia, dados } = corpo;
      if (!DIA.test(dia || '')) return res.status(400).json({ erro: 'Data inválida' });
      if (JSON.stringify(dados ?? null).length > 200000) return res.status(413).json({ erro: 'Registro grande demais' });
      await gravarDia(dia, dados ?? null);
      return res.status(200).json({ ok: true, dia });
    }
    res.setHeader('Allow', 'GET, PUT');
    return res.status(405).json({ erro: 'Método não permitido' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: 'Falha ao acessar o banco de dados' });
  }
}
