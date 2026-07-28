const TelegramBot = require("node-telegram-bot-api");

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.query(`
CREATE TABLE IF NOT EXISTS vigilados (
  id SERIAL PRIMARY KEY,
  jugador TEXT UNIQUE,
  fecha TIMESTAMP DEFAULT NOW()
)
`);

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

let vigilados = [];

bot.onText(/\/vigilar (.+)/, async (msg, match) => {
  const jugador = match[1];

  await pool.query(
    "INSERT INTO vigilados (jugador) VALUES ($1) ON CONFLICT DO NOTHING",
    [jugador]
  );

  bot.sendMessage(
    msg.chat.id,
    `👁️ Guardado en vigilancia:\n\n${jugador}`
  );
});

bot.onText(/\/lista/, (msg) => {
  if (vigilados.length === 0) {
    bot.sendMessage(
      msg.chat.id,
      "No hay jugadores vigilados."
    );
    return;
  }

  bot.sendMessage(
    msg.chat.id,
    "👁️ Jugadores vigilados:\n\n" +
    vigilados.join("\n")
  );
});
