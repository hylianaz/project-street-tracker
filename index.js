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

const ADMIN_ID = process.env.ADMIN_ID;
const bot = new TelegramBot(TOKEN, {
  polling: true
});

function esAdmin(msg) {
  return String(msg.from.id) === String(ADMIN_ID);
}

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

  if (!esAdmin(msg)) {
    return bot.sendMessage(
      msg.chat.id,
      "❌ No tienes permiso para usar este bot."
    );
  }

  await pool.query(
    "INSERT INTO vigilados (jugador) VALUES ($1) ON CONFLICT DO NOTHING",
    [jugador]
  );

  bot.sendMessage(
    msg.chat.id,
    `👁️ Guardado en vigilancia:\n\n${jugador}`
  );
});

bot.onText(/\/lista/, async (msg) => {
  const resultado = await pool.query(
    "SELECT jugador FROM vigilados"
  );

  if (resultado.rows.length === 0) {
    bot.sendMessage(
      msg.chat.id,
      "No hay jugadores vigilados."
    );
    return;
  }

  const lista = resultado.rows
    .map(x => "• " + x.jugador)
    .join("\n");

  bot.sendMessage(
    msg.chat.id,
    "👁️ Jugadores vigilados:\n\n" + lista
  );
});
