// Fotos dos exercícios, guardadas no Vercel Blob privado: fotos/AAAA-MM-DD/<exercicio>-<timestamp>.jpg
// POST {dia, ex, data(base64 jpeg)} grava · GET ?p=<caminho> devolve a imagem · DELETE {p} apaga
import { put, get, del } from '@vercel/blob';

const DIA = /^\d{4}-\d{2}-\d{2}$/;
const EX = /^[a-z0-9-]{1,80}$/;
const CAMINHO = /^fotos\/\d{4}-\d{2}-\d{2}\/[a-z0-9-]{1,80}-\d{10,16}\.jpg$/;

export default async function handler(req, res) {
  if (!process.env.APP_PIN || req.headers['x-pin'] !== process.env.APP_PIN) return res.status(401).json({ erro: 'PIN inválido' });
  try {
    if (req.method === 'GET') {
      const p = String(req.query?.p || '');
      if (!CAMINHO.test(p)) return res.status(400).json({ erro: 'Foto inválida' });
      const r = await get(p, { access: 'private' });
      if (!r || r.statusCode !== 200) return res.status(404).json({ erro: 'Foto não encontrada' });
      const buf = Buffer.from(await new Response(r.stream).arrayBuffer());
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'private, max-age=31536000, immutable');
      return res.status(200).end(buf);
    }
    res.setHeader('Cache-Control', 'no-store');
    const corpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    if (req.method === 'POST') {
      const { dia, ex, data } = corpo;
      if (!DIA.test(dia || '') || !EX.test(ex || '') || typeof data !== 'string') return res.status(400).json({ erro: 'Dados da foto inválidos' });
      const buf = Buffer.from(data, 'base64');
      if (buf.length < 100 || buf.length > 3 * 1024 * 1024) return res.status(413).json({ erro: 'Foto grande demais' });
      if (buf[0] !== 0xff || buf[1] !== 0xd8) return res.status(415).json({ erro: 'A foto precisa ser JPEG' });
      const p = `fotos/${dia}/${ex}-${Date.now()}.jpg`;
      await put(p, buf, { access: 'private', contentType: 'image/jpeg', addRandomSuffix: false });
      return res.status(200).json({ ok: true, p });
    }
    if (req.method === 'DELETE') {
      const p = String(corpo.p || '');
      if (!CAMINHO.test(p)) return res.status(400).json({ erro: 'Foto inválida' });
      await del(p).catch(() => {});
      return res.status(200).json({ ok: true });
    }
    res.setHeader('Allow', 'GET, POST, DELETE');
    return res.status(405).json({ erro: 'Método não permitido' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ erro: 'Falha ao acessar as fotos' });
  }
}
