// Приветствие для @Ivan_WebDew_bot: на /start и любое сообщение бот отвечает
// текстом и кнопкой, которая открывает мини-апп. Запускается как Cloudflare Worker.
//
// Нужны две переменные (Settings → Variables and Secrets, тип Secret):
//   BOT_TOKEN       — токен бота из BotFather
//   WEBHOOK_SECRET  — любая длинная случайная строка (латиница и цифры)
// Токен нельзя хранить в коде и в репозитории.

const APP_URL = 'https://croooud.github.io/Web-Dew/';
const CONTACT_URL = 'https://t.me/IvanMiroshnichenkoo';

const GREETING =
  '<b>Привет! Я Иван, веб-разработчик.</b>\n\n' +
  'Делаю сайты-визитки, лендинги и Telegram Mini Apps под ключ. Запуск от 3 дней.\n\n' +
  'Нажмите кнопку ниже: там шаблоны работ, цены и <b>бесплатный набросок концепции</b> вашего проекта.';

const KEYBOARD = {
  inline_keyboard: [
    [{ text: 'Открыть страницу разработчика', web_app: { url: APP_URL } }],
    [{ text: 'Написать Ивану', url: CONTACT_URL }],
  ],
};

async function tg(env, method, body) {
  const res = await fetch('https://api.telegram.org/bot' + env.BOT_TOKEN + '/' + method, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.ok;
}

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return new Response('ok');

    // Принимаем только запросы от Telegram (он подставляет секрет из setWebhook)
    if (env.WEBHOOK_SECRET &&
        request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== env.WEBHOOK_SECRET) {
      return new Response('forbidden', { status: 403 });
    }

    let update = null;
    try { update = await request.json(); } catch (e) { /* пустой или битый запрос */ }

    const msg = update && update.message;
    if (msg && msg.chat && msg.chat.type === 'private') {
      await tg(env, 'sendMessage', {
        chat_id: msg.chat.id,
        text: GREETING,
        parse_mode: 'HTML',
        reply_markup: KEYBOARD,
        disable_web_page_preview: true,
      });
    }

    // Всегда 200, иначе Telegram будет повторять запрос
    return new Response('ok');
  },
};
