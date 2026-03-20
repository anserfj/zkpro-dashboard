// ================================================
// ZK PRO — Cloudflare Worker v2 (avec messagerie)
// ================================================

const BOT_TOKEN  = "8700497448:AAG8DKiQ8d43FUIYU1j5d7IoDouq2DRI3-s";
const API        = `https://api.telegram.org/bot${BOT_TOKEN}`;
const SB_URL     = "https://hyigrnuoojusixzahjvq.supabase.co";
const SB_KEY     = "sb_publishable_zvgnghWMy0byVdyrIxSafA_i52Nn2f9";
const SBH        = { "Content-Type": "application/json", "apikey": SB_KEY, "Authorization": `Bearer ${SB_KEY}` };

export default {
  async fetch(request) {
    if (request.method !== "POST") return new Response("ZK PRO Bot ✅");
    const update = await request.json();
    const msg    = update?.message;
    if (!msg) return new Response("ok");

    const user   = msg.from;
    const chatId = msg.chat.id;
    const text   = msg.text || "";

    await upsertUser(user);

    if (text.startsWith("/start")) {
      await saveMessage(chatId, "in", text);
      await sendWelcome(chatId);
    } else if (text) {
      await saveMessage(chatId, "in", text);
    }

    return new Response("ok");
  }
};

async function upsertUser(user) {
  await fetch(`${SB_URL}/rest/v1/bot_users`, {
    method: "POST",
    headers: { ...SBH, "Prefer": "resolution=merge-duplicates" },
    body: JSON.stringify({
      id:         user.id,
      username:   user.username   || null,
      first_name: user.first_name || null,
      last_name:  user.last_name  || null,
      last_seen:  new Date().toISOString(),
    })
  });
}

async function saveMessage(telegramId, direction, text) {
  await fetch(`${SB_URL}/rest/v1/bot_messages`, {
    method: "POST",
    headers: { ...SBH, "Prefer": "return=minimal" },
    body: JSON.stringify({ telegram_id: telegramId, direction, text })
  });
}

async function sendWelcome(chatId) {
  await fetch(`${API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id:    chatId,
      text:       `👋 Bienvenue chez *ZK PRO* — Grossiste de puff en France !\n\n🏆 Les meilleurs prix du marché\n📦 Commande minimum 10 unités\n🚚 Livraison offerte dès 200 €\n⚡ Stock disponible immédiatement\n\nParcourez notre catalogue et passez votre commande directement depuis la boutique 👇`,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [[{
          text:    "🛒 Ouvrir la boutique ZK PRO",
          web_app: { url: "https://anserfj.github.io/telegram-shop/" }
        }]]
      }
    })
  });
  await saveMessage(chatId, "out", "👋 Message de bienvenue");
}
