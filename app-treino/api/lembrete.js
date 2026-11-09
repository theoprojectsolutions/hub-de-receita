// Agenda a notificação de fim de descanso: responde na hora e, depois de N segundos, envia um web push.
// DELETE cancela um lembrete (quando o descanso é pulado ou substituído).
import webpush from 'web-push';
import { waitUntil } from '@vercel/functions';
import { put, head } from '@vercel/blob';

const espera = ms => new Promise(r => setTimeout(r, ms));
const limpaId = v => String(v || '').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 40);
const marcador = id => 'lembretes/cancelado-' + id + '.txt';

async function cancelado(id) {
  try { await head(marcador(id)); return true; } catch (e) { return false; }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!process.env.APP_PIN || req.headers['x-pin'] !== process.env.APP_PIN) return res.status(401).json({ erro: 'PIN inválido' });
  const corpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const id = limpaId(corpo.id);
  if (!id) return res.status(400).json({ erro: 'id obrigatório' });

  if (req.method === 'DELETE') {
    await put(marcador(id), '1', { access: 'private', allowOverwrite: true, addRandomSuffix: false, contentType: 'text/plain' });
    return res.status(200).json({ ok: true, cancelado: id });
  }
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST, DELETE'); return res.status(405).json({ erro: 'Método não permitido' }); }

  const sub = corpo.sub;
  if (!sub || typeof sub.endpoint !== 'string' || !sub.keys) return res.status(400).json({ erro: 'Inscrição de notificação inválida' });
  const segundos = Math.min(Math.max(Number(corpo.segundos) || 0, 5), 280);
  const payload = JSON.stringify({
    titulo: String(corpo.titulo || 'Descanso acabou').slice(0, 80),
    texto: String(corpo.texto || 'Hora da próxima série.').slice(0, 160),
    url: '/',
  });
  webpush.setVapidDetails('https://caderno-de-treino-six.vercel.app', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);

  waitUntil((async () => {
    await espera(segundos * 1000);
    if (await cancelado(id)) return;
    try {
      await webpush.sendNotification(sub, payload, { TTL: 300, urgency: 'high' });
    } catch (e) {
      console.error('Falha ao enviar notificação', e.statusCode, e.body);
    }
  })());
  return res.status(202).json({ ok: true, id, segundos });
}
