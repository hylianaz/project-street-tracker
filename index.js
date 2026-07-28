const TelegramBot = require("node-telegram-bot-api");

const TOKEN = process.env.TELEGRAM_TOKEN;

if (!TOKEN) {
  console.log("Falta TELEGRAM_TOKEN");
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, {
  polling: true
});

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🤖 Project Street Tracker iniciado.\n\nUsa /estado para comprobar el bot."
  );
});

bot.onText(/\/estado/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🟢 Bot funcionando correctamente.\n\nPróximo paso: conectar Project Street."
  );
});

console.log("Bot iniciado");
