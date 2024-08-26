import dotenv from "dotenv";
dotenv.config();
import { Telegraf } from "telegraf";
import { startCommand } from "./scenes/commands/start.js";
import { config } from "./scenes/module/config.js";


export const bot = new Telegraf(process.env.BOT_TOKEN);


const sessions = {};

bot.use((ctx, next) => {
  if (!sessions[ctx.from.id]) {
    sessions[ctx.from.id] = {};
  }
  ctx.session = sessions[ctx.from.id];
  return next();
});


bot.start(startCommand);


config(bot);

bot
  .launch()
  .then(() => console.log("Bot is running..."))
  .catch((error) => console.error("Error launching bot:", error));
